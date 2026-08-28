package com.rewear.backend.wallet.service;
import com.rewear.backend.wallet.model.RefundReceipt;
import com.rewear.backend.wallet.repository.RefundReceiptRepository;
import com.rewear.backend.rental.repository.RentalItemRepository;
import com.rewear.backend.rental.service.*;
import com.rewear.backend.notification.service.NotificationService;
import com.rewear.backend.notification.enums.NotificationType;
import com.rewear.backend.user.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
@Service @RequiredArgsConstructor
public class AdminRefundService {
 private final RentalService rentals;
 private final RentalItemRepository items;
 private final PaidOrderGuard guard;
 private final RefundReceiptRepository receipts;
 private final NotificationService notifications;
 public record Confirmation(@NotBlank @Pattern(regexp="[A-Za-z0-9][A-Za-z0-9._/-]{5,119}") String providerReference,
  @NotNull @DecimalMin("0.01") @Digits(integer=12,fraction=2) BigDecimal refundedAmount,
  @AssertTrue boolean externallyRefunded){}
 @Transactional(isolation=Isolation.READ_COMMITTED)
 public void confirm(String email,Long id,Confirmation request) {
  var admin=rentals.actor(email);if(admin.getRole()!=Role.ADMIN)throw new ResponseStatusException(HttpStatus.FORBIDDEN);
  if(!request.externallyRefunded())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Confirm only after the external refund succeeds");
  var item=items.lockItem(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
  var existing=receipts.findByItemId(id);
  if(existing.isPresent()) {
   var receipt=existing.get();
   if(!receipt.getProviderReference().equals(request.providerReference())||receipt.getAmount().compareTo(request.refundedAmount())!=0)
    throw new ResponseStatusException(HttpStatus.CONFLICT,"Refund already recorded with different evidence");
   return;
  }
  if(!"RETURNED".equals(item.getRentalState())&&!"CANCELLED".equals(item.getRentalState()))
   throw new ResponseStatusException(HttpStatus.CONFLICT,"Rental must be returned or cancelled first");
  if(!"PENDING_PROVIDER".equals(item.getRefundState()) || item.getRefundDueNpr()==null || item.getRefundDueNpr().signum()<=0)
   throw new ResponseStatusException(HttpStatus.CONFLICT,"Refund breakdown needs review or no refund is due");
  var payment=guard.verified(item.getOrder());
  if(request.refundedAmount().compareTo(item.getRefundDueNpr())!=0)
   throw new ResponseStatusException(HttpStatus.CONFLICT,"Refund amount must exactly match the recorded obligation");
  String gateway=payment.getPaymentGateway().name();
  if(receipts.existsByGatewayAndProviderReference(gateway,request.providerReference()))
   throw new ResponseStatusException(HttpStatus.CONFLICT,"This refund reference was already recorded");
  var receipt=new RefundReceipt();receipt.setItemId(id);receipt.setAdminId(admin.getId());receipt.setAmount(item.getRefundDueNpr());
  receipt.setGateway(gateway);receipt.setProviderReference(request.providerReference());receipt.setRecordedAt(Instant.now());receipts.saveAndFlush(receipt);
  item.setRefundState("REFUNDED_MANUALLY");
  notifications.notifyUser(item.getOrder().getBuyer().getId(),"refund-confirmed:"+id,NotificationType.PAYMENT,
   "Refund confirmed by admin",("RETURNED".equals(item.getRentalState())?"Your rental was returned. Your full security deposit of NPR ":"Your cancelled rental refund of NPR ")
   +receipt.getAmount()+" has been confirmed refunded by an admin through "+gateway+". Reference: "+receipt.getProviderReference(),"/profile/rentals");
  notifications.notifyAdmins("refund-recorded:"+id,NotificationType.PAYMENT,"External refund recorded","Admin #"+admin.getId()+" recorded NPR "+receipt.getAmount()+" for rental item #"+id+". Reference: "+receipt.getProviderReference(),"/admin/earnings");
 }
}
