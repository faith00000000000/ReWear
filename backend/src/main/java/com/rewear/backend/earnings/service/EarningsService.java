package com.rewear.backend.earnings.service;
import com.rewear.backend.earnings.dto.EarningsResponse;
import com.rewear.backend.earnings.dto.EarningsResponse.*;
import com.rewear.backend.earnings.repository.EarningsPaymentRepository;
import com.rewear.backend.payment.enums.PaymentStatus;
import com.rewear.backend.user.repository.UserRepository;
import com.rewear.backend.user.enums.Role;
import com.rewear.backend.user.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
@Service @RequiredArgsConstructor
public class EarningsService {
 private final EarningsPaymentRepository payments;
 private final UserRepository users;
 private final EarningsCalculator calculator;
 @Transactional(readOnly=true)
 public EarningsResponse dashboard(String email,String type,String search,int page,int size) {
  var admin=users.findByEmail(email).orElseThrow(()->new ResponseStatusException(HttpStatus.FORBIDDEN));
  if(admin.getRole()!=Role.ADMIN || !Boolean.TRUE.equals(admin.getIsActive()) || admin.getStatus()==UserStatus.BANNED)
   throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Admin access required");
  if(!Set.of("all","thrift","rent").contains(type) || page<0 || size<1 || size>100)
   throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid filter or page");
  var rows=new ArrayList<Transaction>(); var issues=new ArrayList<ReviewIssue>();
  var seen=new HashSet<Long>();
  BigDecimal collections=BigDecimal.ZERO,excluded=BigDecimal.ZERO;
  for(var payment:payments.findByPaymentStatusOrderByCompletedAtDescIdDesc(PaymentStatus.SUCCESS)) {
   var order=payment.getOrder();
   BigDecimal paid=BigDecimal.valueOf(payment.getAmountNpr());
   collections=collections.add(paid);
   try {
    if(!seen.add(order.getId())) throw new IllegalArgumentException("Additional successful payment for the same order; review duplicate collection");
    if(!"CONFIRMED".equals(order.getStatus())) throw new IllegalArgumentException("Paid order is not confirmed; review cancellation/refund state");
    if(payment.getCompletedAt()==null) throw new IllegalArgumentException("Payment completion date missing");
    if(!Objects.equals(payment.getAmountNpr(),order.getTotalAmountNpr())) throw new IllegalArgumentException("Payment and order totals differ");
    if(order.getItems().isEmpty()) throw new IllegalArgumentException("Order has no items");
    var orderRows=new ArrayList<Transaction>(); BigDecimal fee=BigDecimal.ZERO,charges=BigDecimal.ZERO;
    boolean structured=true;
    for(var item:order.getItems()) {
     var a=calculator.calculate(item);
     fee=fee.add(item.getFeeAmountNpr()==null?a.gross():item.getFeeAmountNpr());
     structured &= item.getDepositAmountNpr()!=null && item.getShippingAmountNpr()!=null;
     if(item.getDepositAmountNpr()!=null) charges=charges.add(item.getDepositAmountNpr());
     if(item.getShippingAmountNpr()!=null) charges=charges.add(item.getShippingAmountNpr());
     orderRows.add(new Transaction(payment.getReferenceId()+"-"+item.getId(),order.getId(),payment.getReferenceId(),
      payment.getPaymentGateway().name(),item.getName(),item.getImage(),item.getSellerId(),
      item.getSellerName()==null?"Not recorded on legacy order":item.getSellerName(),order.getBuyer().getFullName(),
      a.type(),a.gross(),a.rate(),a.cut(),a.seller(),payment.getCompletedAt().toString(),a.source()));
    }
    if(fee.compareTo(paid)>0 || (structured && fee.add(charges).compareTo(paid)!=0))
     throw new IllegalArgumentException("Fee/deposit/shipping amounts do not reconcile with payment");
    excluded=excluded.add(paid.subtract(fee)); rows.addAll(orderRows);
   } catch(IllegalArgumentException | ArithmeticException invalid) {
    issues.add(new ReviewIssue(payment.getReferenceId(),order.getId(),invalid.getMessage()));
   }
  }
  BigDecimal thrift=BigDecimal.ZERO,rent=BigDecimal.ZERO,tc=BigDecimal.ZERO,rc=BigDecimal.ZERO;
  YearMonth current=YearMonth.now(ZoneId.of("Asia/Kathmandu"));
  var months=new LinkedHashMap<String,BigDecimal[]>();
  for(int i=5;i>=0;i--) months.put(current.minusMonths(i).toString(),new BigDecimal[]{BigDecimal.ZERO,BigDecimal.ZERO});
  for(var row:rows) {
   boolean rental=row.type().equals("rent");
   if(rental){rent=rent.add(row.grossAmount());rc=rc.add(row.platformCut());}
   else {thrift=thrift.add(row.grossAmount());tc=tc.add(row.platformCut());}
   var bucket=months.get(YearMonth.from(LocalDateTime.parse(row.date())).toString());
   if(bucket!=null) {int index=rental?1:0;bucket[index]=bucket[index].add(row.platformCut());}
  }
  String query=search.trim().toLowerCase(Locale.ROOT);
  var filtered=rows.stream().filter(r->type.equals("all") || r.type().equals(type))
   .filter(r->(r.id()+" "+r.orderId()+" "+r.itemTitle()+" "+r.sellerName()+" "+r.buyerName()).toLowerCase(Locale.ROOT).contains(query)).toList();
  long start=Math.min((long)page*size,filtered.size()); int end=(int)Math.min(start+size,filtered.size());
  var metrics=new Metrics(thrift.add(rent),thrift,rent,tc,rc,tc.add(rc),thrift.add(rent).subtract(tc.add(rc)),collections,excluded);
  return new EarningsResponse(metrics,months.entrySet().stream().map(e->new Monthly(e.getKey(),e.getValue()[0],e.getValue()[1])).toList(),
   filtered.subList((int)start,end),filtered.size(),page,size,issues.stream().limit(50).toList(),issues.size());
 }
}
