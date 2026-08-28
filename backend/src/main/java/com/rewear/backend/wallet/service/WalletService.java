package com.rewear.backend.wallet.service;
import com.rewear.backend.wallet.model.Withdrawal;
import com.rewear.backend.wallet.repository.*;
import com.rewear.backend.rental.service.*;
import com.rewear.backend.earnings.repository.EarningsPaymentRepository;
import com.rewear.backend.earnings.service.EarningsCalculator;
import com.rewear.backend.payment.enums.PaymentStatus;
import com.rewear.backend.user.enums.Role;
import com.rewear.backend.notification.service.NotificationService;
import com.rewear.backend.notification.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
@Service @RequiredArgsConstructor @Transactional(isolation=Isolation.READ_COMMITTED)
public class WalletService {
 private final RentalService rentals;
 private final PaidOrderGuard guard;
 private final EarningsPaymentRepository payments;
 private final EarningsCalculator calculator;
 private final WithdrawalRepository withdrawals;
 private final RefundReceiptRepository receipts;
 private final WalletUserRepository users;
 private final NotificationService notifications;
 public record Entry(Long itemId,String name,String type,String state,BigDecimal fee,BigDecimal commission,BigDecimal net,boolean available){}
 public record Request(@NotNull @DecimalMin("1.00") @Digits(integer=12,fraction=2) BigDecimal amount,
  @NotBlank @Pattern(regexp="ESEWA|KHALTI") String gateway,@NotBlank @Pattern(regexp="9[0-9]{9}") String account,
  @NotBlank @Pattern(regexp="[A-Za-z0-9-]{16,64}") String requestKey){}
 public record WithdrawalView(Long id,BigDecimal amount,String gateway,String account,String status,Instant createdAt){}
 public record Wallet(BigDecimal totalEarned,BigDecimal pendingRentalEarnings,BigDecimal availableBalance,
  BigDecimal reservedForWithdrawal,BigDecimal withdrawn,List<Entry> entries,List<WithdrawalView> withdrawals,int reviewCount,
  boolean providerPayoutEnabled,String providerNotice){}
 public record Refund(Long itemId,String itemName,String buyerName,String state,BigDecimal deposit,BigDecimal refundDue,String refundState,String gateway,String providerReference){}
 public record Settlement(BigDecimal depositsHeld,BigDecimal depositsAwaitingReturn,BigDecimal refundsDue,
  BigDecimal cancellationFees,BigDecimal reservedWithdrawals,List<Refund> rentals,List<WithdrawalView> withdrawals,int reviewCount){}
 private WithdrawalView view(Withdrawal w){return new WithdrawalView(w.getId(),w.getAmount(),w.getGateway(),"******"+w.getAccount().substring(6),w.getStatus(),w.getCreatedAt());}
 @Transactional(readOnly=true)
 public Wallet wallet(String email) {
  var user=rentals.actor(email);var entries=new ArrayList<Entry>();var seen=new HashSet<Long>();int review=0;
  BigDecimal earned=BigDecimal.ZERO,pending=BigDecimal.ZERO;
  for(var p:payments.findByPaymentStatusOrderByCompletedAtDescIdDesc(PaymentStatus.SUCCESS)) {
   var o=p.getOrder();if(!seen.add(o.getId()))continue;
   if(o.getItems().stream().noneMatch(i->Objects.equals(rentals.sellerId(i),user.getId())))continue;
   try {guard.verified(o);}catch(IllegalArgumentException e){review++;continue;}
   for(var i:o.getItems()) if(Objects.equals(rentals.sellerId(i),user.getId())) {
    var a=calculator.calculate(i);boolean rent=a.type().equals("rent");String state=rent?RentalService.state(i):"PAID_SALE";
    boolean available=!rent||state.equals("RETURNED");
    BigDecimal net=state.equals("CANCELLED")?BigDecimal.ZERO:a.seller();
    entries.add(new Entry(i.getId(),i.getName(),a.type(),state,a.gross(),a.cut(),net,available));
    if(available)earned=earned.add(net);else pending=pending.add(net);
   }
  }
  var history=withdrawals.findBySellerIdOrderByIdDesc(user.getId());
  BigDecimal reserved=history.stream().filter(w->w.getStatus().equals("PENDING_PROVIDER_SETUP")).map(Withdrawal::getAmount).reduce(BigDecimal.ZERO,BigDecimal::add);
  return new Wallet(earned,pending,earned.subtract(reserved),reserved,BigDecimal.ZERO,entries,history.stream().map(this::view).toList(),review,false,
   "Withdrawal requests reserve your balance. eSewa/Khalti seller disbursement integration is not configured; no money has been sent. You can cancel a pending request.");
 }
 public WithdrawalView request(String email,Request request) {
  var user=rentals.actor(email);users.lockUser(user.getId()).orElseThrow();
  var existing=withdrawals.findBySellerIdAndRequestKey(user.getId(),request.requestKey());
  if(existing.isPresent()) {
   var w=existing.get();if(w.getAmount().compareTo(request.amount())!=0||!w.getGateway().equals(request.gateway())||!w.getAccount().equals(request.account()))
    throw new ResponseStatusException(HttpStatus.CONFLICT,"Request key already used with different details");
   return view(w);
  }
  if(request.amount().signum()<=0 || wallet(email).availableBalance().compareTo(request.amount())<0)
   throw new ResponseStatusException(HttpStatus.CONFLICT,"Insufficient available balance");
  var w=new Withdrawal();w.setSellerId(user.getId());w.setRequestKey(request.requestKey());w.setAmount(request.amount());
  w.setGateway(request.gateway());w.setAccount(request.account());w.setCreatedAt(Instant.now());w.setStatus("PENDING_PROVIDER_SETUP");withdrawals.saveAndFlush(w);
  notifications.notifyUser(user.getId(),"withdrawal:"+w.getId(),NotificationType.PAYMENT,"Withdrawal requested",
   "NPR "+w.getAmount()+" reserved for "+w.getGateway()+". Awaiting payout integration; money has not been sent.","/profile/earnings");
  notifications.notifyAdmins("withdrawal:"+w.getId(),NotificationType.PAYMENT,"Seller withdrawal awaiting processing","A seller requested NPR "+w.getAmount()+" via "+w.getGateway()+". Provider setup is required.","/admin/earnings");
  return view(w);
 }
 public void cancel(String email,Long id) {
  var user=rentals.actor(email);users.lockUser(user.getId()).orElseThrow();var w=withdrawals.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
  if(!Objects.equals(w.getSellerId(),user.getId()))throw new ResponseStatusException(HttpStatus.FORBIDDEN);
  if(w.getStatus().equals("CANCELLED"))return;
  if(!w.getStatus().equals("PENDING_PROVIDER_SETUP"))throw new ResponseStatusException(HttpStatus.CONFLICT,"Withdrawal cannot be cancelled");
  w.setStatus("CANCELLED");notifications.notifyUser(user.getId(),"withdrawal-cancel:"+id,NotificationType.PAYMENT,"Withdrawal request cancelled","Your reserved balance is available again.","/profile/earnings");
 }
 @Transactional(readOnly=true)
 public Settlement settlement(String email) {
  if(rentals.actor(email).getRole()!=Role.ADMIN)throw new ResponseStatusException(HttpStatus.FORBIDDEN);
  var rows=new ArrayList<Refund>();var seen=new HashSet<Long>();int review=0;
  BigDecimal held=BigDecimal.ZERO,awaiting=BigDecimal.ZERO,due=BigDecimal.ZERO,fees=BigDecimal.ZERO;
  for(var p:payments.findByPaymentStatusOrderByCompletedAtDescIdDesc(PaymentStatus.SUCCESS)) {
   var o=p.getOrder();if(!seen.add(o.getId()))continue;
   try{guard.verified(o);}catch(IllegalArgumentException e){review++;continue;}
   for(var i:o.getItems())if(i.getRentalStartIso()!=null) {
    String state=RentalService.state(i);BigDecimal refund=i.getRefundDueNpr()==null?BigDecimal.ZERO:i.getRefundDueNpr();
    boolean refunded="REFUNDED_MANUALLY".equals(i.getRefundState());
    if(!refunded)held=held.add(i.getDepositAmountNpr());if(state.equals("ACTIVE"))awaiting=awaiting.add(i.getDepositAmountNpr());
    if(!refunded)due=due.add(refund);if(i.getCancellationFeeNpr()!=null)fees=fees.add(i.getCancellationFeeNpr());
    rows.add(new Refund(i.getId(),i.getName(),o.getBuyer().getFullName(),state,i.getDepositAmountNpr(),refunded?BigDecimal.ZERO:refund,i.getRefundState(),p.getPaymentGateway().name(),receipts.findByItemId(i.getId()).map(com.rewear.backend.wallet.model.RefundReceipt::getProviderReference).orElse(null)));
   }
  }
  var ws=withdrawals.findAll().stream().filter(w->w.getStatus().equals("PENDING_PROVIDER_SETUP")).toList();
  return new Settlement(held,awaiting,due,fees,ws.stream().map(Withdrawal::getAmount).reduce(BigDecimal.ZERO,BigDecimal::add),rows,ws.stream().map(this::view).toList(),review);
 }
}
