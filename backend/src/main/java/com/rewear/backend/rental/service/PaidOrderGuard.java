package com.rewear.backend.rental.service;
import com.rewear.backend.order.modal.Order;
import com.rewear.backend.payment.enums.PaymentStatus;
import com.rewear.backend.payment.modal.PaymentTransaction;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Objects;
@Component
public class PaidOrderGuard {
 // Never create spendable balances or refunds from guessed legacy prices.
 public PaymentTransaction verifiedPayment(Order order) {
  var paid=order.getTransactions().stream().filter(p->p.getPaymentStatus()==PaymentStatus.SUCCESS).toList();
  if(!"CONFIRMED".equals(order.getStatus()) || paid.size()!=1 || paid.get(0).getCompletedAt()==null || !Objects.equals(paid.get(0).getAmountNpr(),order.getTotalAmountNpr()))
   throw new IllegalArgumentException("Payment needs reconciliation before settlement");
  return paid.get(0);
 }
 public PaymentTransaction verified(Order order) {
  var payment=verifiedPayment(order);
  BigDecimal total=BigDecimal.ZERO;
  for(var i:order.getItems()) {
   if(i.getFeeAmountNpr()==null || i.getDepositAmountNpr()==null || i.getShippingAmountNpr()==null || i.getSellerId()==null || i.getCommissionRate()==null)
    throw new IllegalArgumentException("Legacy order needs verified fee, deposit and seller snapshots");
   if(i.getFeeAmountNpr().signum()<0 || i.getDepositAmountNpr().signum()<0 || i.getShippingAmountNpr().signum()<0 || i.getCommissionRate().signum()<0 || i.getCommissionRate().compareTo(BigDecimal.ONE)>0)
    throw new IllegalArgumentException("Invalid monetary snapshot");
   total=total.add(i.getFeeAmountNpr()).add(i.getDepositAmountNpr()).add(i.getShippingAmountNpr());
  }
  if(total.compareTo(BigDecimal.valueOf(order.getTotalAmountNpr()))!=0) throw new IllegalArgumentException("Order amounts do not reconcile");
  return payment;
 }
}
