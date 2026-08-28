package com.rewear.backend.earnings.service;
import com.rewear.backend.order.modal.OrderItem;
import com.rewear.backend.order.dto.request.OrderCreateRequest;
import com.rewear.backend.listing.repository.ListingRepository;
import com.rewear.backend.listing.enums.ListingMode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
@Service @RequiredArgsConstructor
public class OrderEarningsSnapshotService {
 private final ListingRepository listings;
 public OrderItem snapshot(OrderItem item,OrderCreateRequest.OrderItemRequest request) {
  var listing=listings.findById(item.getListingId()).orElseThrow(()->new IllegalArgumentException("Listing unavailable"));
  if(listing.getAvailability()!=com.rewear.backend.listing.enums.Availability.AVAILABLE)
   throw new IllegalArgumentException("Item is reserved or sold; wait for seller return confirmation");
  if(item.getOrder()!=null && item.getOrder().getBuyer()!=null && listing.getSeller().getId().equals(item.getOrder().getBuyer().getId()))
   throw new IllegalArgumentException("You cannot purchase or rent your own listing");
  boolean rental=request.getRentalStartIso()!=null || request.getRentalEndIso()!=null || "RENT".equals(request.getStatus());
  int days=1;
  if(rental) {
   if(request.getRentalStartIso()==null || request.getRentalEndIso()==null) throw new IllegalArgumentException("Rental dates required");
   LocalDate start=LocalDate.parse(request.getRentalStartIso()),end=LocalDate.parse(request.getRentalEndIso());
   if(end.isBefore(start)) throw new IllegalArgumentException("Invalid rental dates");
   // Preserve the existing UI's billing convention: date difference, minimum one day.
   days=Math.toIntExact(Math.max(1,ChronoUnit.DAYS.between(start,end)));
   if(request.getRentalDays()==null || request.getRentalDays()!=days) throw new IllegalArgumentException("Rental duration mismatch");
   if(listing.getListingMode()==ListingMode.THRIFT) throw new IllegalArgumentException("Listing does not support renting");
  } else if(listing.getListingMode()==ListingMode.RENT) throw new IllegalArgumentException("Listing does not support thrift");
  BigDecimal unit=rental?listing.getRentPerDay():listing.getThriftPrice();
  if(unit==null || unit.signum()<0) throw new IllegalArgumentException("Listing price unavailable");
  BigDecimal deposit=rental && listing.getSecurityDeposit()!=null?listing.getSecurityDeposit():BigDecimal.ZERO;
  if(!"pickup".equals(request.getFulfillment()) && !"shipping".equals(request.getFulfillment())) throw new IllegalArgumentException("Select shipping or pickup");
  BigDecimal shipping="pickup".equals(request.getFulfillment())?BigDecimal.ZERO:request.getDeliveryFee();
  if(shipping==null || shipping.signum()<0 || deposit.signum()<0) throw new IllegalArgumentException("Invalid charges");
  item.setFeeAmountNpr(unit.multiply(BigDecimal.valueOf(days)).setScale(2));
  item.setDepositAmountNpr(deposit.setScale(2)); item.setShippingAmountNpr(shipping.setScale(2));
  item.setCommissionRate(rental?EarningsCalculator.RENT_RATE:EarningsCalculator.THRIFT_RATE);
  item.setSellerId(listing.getSeller().getId()); item.setSellerName(listing.getSeller().getFullName());
  item.setName(listing.getProductTitle());
  item.setPrice("Rs. "+unit.toPlainString()+(rental?" / day":""));
  item.setItemStatus(rental?"RENT":"THRIFT");
  return item;
 }
}
