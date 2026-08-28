package com.rewear.backend.rental.dto;
import java.math.BigDecimal;
public record RentalView(Long id,Long listingId,String name,String image,String startDate,String endDate,
 String buyerName,String sellerName,boolean buyerSide,boolean sellerSide,String state,
 boolean canCancel,boolean canReturn,String actionBlockReason,BigDecimal rentalFee,BigDecimal deposit,
 BigDecimal cancellationFee,BigDecimal refundDue,String refundState) {}
