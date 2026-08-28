package com.rewear.backend.earnings.dto;
import java.math.BigDecimal;
import java.util.List;
public record EarningsResponse(
 Metrics metrics,List<Monthly> monthly,List<Transaction> transactions,long totalElements,int page,int size,
 List<ReviewIssue> reviewIssues,int reviewCount) {
 public record Metrics(BigDecimal totalGMV,BigDecimal thriftGMV,BigDecimal rentGMV,
  BigDecimal thriftCommission,BigDecimal rentCommission,BigDecimal totalCommission,
  BigDecimal sellerShare,BigDecimal verifiedCollections,BigDecimal excludedCharges) {}
 public record Monthly(String month,BigDecimal thriftComm,BigDecimal rentComm) {}
 public record Transaction(String id,Long orderId,String paymentReference,String gateway,String itemTitle,
  String itemImage,Long sellerId,String sellerName,String buyerName,String type,BigDecimal grossAmount,
  BigDecimal commissionRate,BigDecimal platformCut,BigDecimal sellerShare,String date,String source) {}
 public record ReviewIssue(String reference,Long orderId,String reason) {}
}
