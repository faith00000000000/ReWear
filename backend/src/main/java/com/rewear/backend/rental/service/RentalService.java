package com.rewear.backend.rental.service;
import com.rewear.backend.rental.dto.RentalView;
import com.rewear.backend.rental.repository.RentalItemRepository;
import com.rewear.backend.order.modal.OrderItem;
import com.rewear.backend.listing.repository.ListingRepository;
import com.rewear.backend.listing.enums.Availability;
import com.rewear.backend.user.repository.UserRepository;
import com.rewear.backend.user.model.User;
import com.rewear.backend.user.enums.UserStatus;
import com.rewear.backend.notification.service.NotificationService;
import com.rewear.backend.notification.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.math.*;
import java.time.*;
import java.util.*;
@Service @RequiredArgsConstructor
@Transactional(isolation=Isolation.READ_COMMITTED)
public class RentalService {
 @jakarta.persistence.PersistenceContext private jakarta.persistence.EntityManager entityManager;
 private final RentalItemRepository items;
 private final ListingRepository listings;
 private final UserRepository users;
 private final PaidOrderGuard guard;
 private final NotificationService notifications;
 public static final BigDecimal CANCEL_RATE=new BigDecimal("0.07");
 public User actor(String email) {
  if(email==null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
  var user=users.findByEmail(email).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED));
  if(!Boolean.TRUE.equals(user.getIsActive()) || user.getStatus()==UserStatus.BANNED) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
  return user;
 }
 public static LocalDate today(){return LocalDate.now(ZoneId.of("Asia/Kathmandu"));}
 public static BigDecimal cancellationFee(BigDecimal fee){return fee.multiply(CANCEL_RATE).setScale(2,RoundingMode.HALF_UP);}
 public static String state(OrderItem i){return i.getRentalState()==null?"ACTIVE":i.getRentalState();}
 @Transactional(readOnly=true)
 public List<RentalView> list(String email){var user=actor(email);return items.inbox(user.getId()).stream().map(i->view(i,user.getId())).toList();}
 public Long sellerId(OrderItem i) {
  if(i.getSellerId()!=null)return i.getSellerId();
  return listings.findByIdWithSeller(i.getListingId()).map(l->l.getSeller().getId()).orElse(null);
 }
 private String sellerName(OrderItem i) {
  if(i.getSellerName()!=null)return i.getSellerName();
  return listings.findByIdWithSeller(i.getListingId()).map(l->l.getSeller().getFullName()).orElse(null);
 }
 private String returnProblem(OrderItem i) {
  try {guard.verifiedPayment(i.getOrder());LocalDate.parse(i.getRentalStartIso());LocalDate.parse(i.getRentalEndIso());return null;}
  catch(IllegalArgumentException | DateTimeException e){return e.getMessage();}
 }
 private String problem(OrderItem i) {
  try {guard.verified(i.getOrder()); LocalDate.parse(i.getRentalStartIso()); LocalDate.parse(i.getRentalEndIso());return null;}
  catch(IllegalArgumentException | DateTimeException e){return e.getMessage();}
 }
 private RentalView view(OrderItem i,Long user) {
  boolean buyer=Objects.equals(i.getOrder().getBuyer().getId(),user),seller=Objects.equals(sellerId(i),user);
  String problem=problem(i);boolean active=state(i).equals("ACTIVE");
  String returnProblem=returnProblem(i);
  boolean before=returnProblem==null && today().isBefore(LocalDate.parse(i.getRentalStartIso()));
  return new RentalView(i.getId(),i.getListingId(),i.getName(),i.getImage(),i.getRentalStartIso(),i.getRentalEndIso(),
   i.getOrder().getBuyer().getFullName(),sellerName(i),buyer,seller,state(i),
   buyer&&active&&problem==null&&before,seller&&active&&returnProblem==null&&!before,
   problem!=null?problem:(buyer&&active&&!before?"Cancellation closes at midnight Nepal time on the rental start date":null),
   i.getFeeAmountNpr(),i.getDepositAmountNpr(),i.getCancellationFeeNpr()!=null?i.getCancellationFeeNpr():i.getFeeAmountNpr()==null?null:cancellationFee(i.getFeeAmountNpr()),i.getRefundDueNpr(),i.getRefundState());
 }
 public RentalView close(String email,Long id,boolean cancel) {
  var user=actor(email);
  // Lock listing first so two bookings cannot race when releasing availability.
  var snapshot=items.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
  Long owner=cancel?snapshot.getOrder().getBuyer().getId():sellerId(snapshot);
  if(!Objects.equals(owner,user.getId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
  var listing=listings.lockListing(snapshot.getListingId()).orElseThrow(()->new ResponseStatusException(HttpStatus.CONFLICT,"Listing needs manual review"));
  var item=items.lockItem(id).orElseThrow();
  entityManager.refresh(item); // Re-read after waiting for another close operation to commit.
  if(item.getRentalStartIso()==null) throw new ResponseStatusException(HttpStatus.CONFLICT,"This item is not a rental");
  String target=cancel?"CANCELLED":"RETURNED";
  if(state(item).equals(target)) return view(item,user.getId()); // Idempotent retry.
  if(!state(item).equals("ACTIVE")) throw new ResponseStatusException(HttpStatus.CONFLICT,"Rental already closed");
  Long resolvedSeller=sellerId(item);
  if(!cancel && !Objects.equals(resolvedSeller,user.getId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
  String returnProblem=returnProblem(item);
  if(returnProblem!=null)throw new ResponseStatusException(HttpStatus.CONFLICT,returnProblem);
  String problem=problem(item);
  if(cancel && problem!=null) throw new ResponseStatusException(HttpStatus.CONFLICT,problem);
  boolean before=today().isBefore(LocalDate.parse(item.getRentalStartIso()));
  if(cancel&&!before) throw new ResponseStatusException(HttpStatus.CONFLICT,"Cancellation is only allowed before the rental start date");
  if(!cancel&&before) throw new ResponseStatusException(HttpStatus.CONFLICT,"Cannot confirm return before rental starts");
  BigDecimal fee=cancel?cancellationFee(item.getFeeAmountNpr()):BigDecimal.ZERO;
  BigDecimal refund=problem!=null?null:cancel?item.getFeeAmountNpr().subtract(fee).add(item.getDepositAmountNpr()).add(item.getShippingAmountNpr()):item.getDepositAmountNpr();
  item.setRentalState(target);item.setRentalClosedAt(Instant.now());item.setCancellationFeeNpr(fee);
  item.setRefundDueNpr(refund);item.setRefundState(refund==null?"REQUIRES_REVIEW":refund.signum()==0?"NOT_REQUIRED":"PENDING_PROVIDER");
  items.saveAndFlush(item);
  boolean released=items.otherReservations(item.getListingId(),id)==0 && listing.getAvailability()!=Availability.SOLD_OUT;
  if(released){listing.setAvailability(Availability.AVAILABLE);listing.setRentedFrom(null);listing.setRentedTo(null);}
  String message=cancel?"Rental cancelled. 7% cancellation fee: NPR "+fee+". Refund due: NPR "+refund+" (includes full deposit and shipping).":
   "Seller confirmed the return. Full security deposit refund due: NPR "+refund+". Seller rental earnings are now available after 20% commission.";
  if(problem!=null)message="Seller confirmed the physical return. Legacy payment breakdown requires review before a deposit refund or seller credit can be calculated.";
  else message+=" Refund transfer is pending provider processing.";
  for(Long recipient:new TreeSet<>(List.of(item.getOrder().getBuyer().getId(),resolvedSeller)))
   notifications.notifyUser(recipient,"rental:"+id+":"+target,NotificationType.PAYMENT,target.equals("CANCELLED")?"Rental cancelled":"Rental returned",message+(released?" Item is available again.":" Availability needs reservation review."),"/profile/rentals");
  notifications.notifyAdmins("rental-refund:"+id,NotificationType.PAYMENT,"Rental refund due",message,"/admin/earnings");
  return view(item,user.getId());
 }
}
