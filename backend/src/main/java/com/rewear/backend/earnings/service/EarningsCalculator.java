package com.rewear.backend.earnings.service;
import com.rewear.backend.order.modal.OrderItem;
import org.springframework.stereotype.Component;
import java.math.*;
import java.util.regex.Pattern;
@Component
public class EarningsCalculator {
 public static final BigDecimal THRIFT_RATE=new BigDecimal("0.12"), RENT_RATE=new BigDecimal("0.20");
 private static final Pattern LEGACY_THRIFT=Pattern.compile("(?i)^(?:Rs\\.?|NPR)?\\s*(\\d+(?:,\\d{3})*(?:\\.\\d{1,2})?)\\s*$");
 public record Amounts(String type,BigDecimal gross,BigDecimal rate,BigDecimal cut,BigDecimal seller,String source) {}
 public Amounts calculate(OrderItem item) {
  boolean rental=item.getRentalStartIso()!=null || item.getRentalEndIso()!=null || "RENT".equals(item.getItemStatus());
  BigDecimal gross=item.getFeeAmountNpr();
  String source="CHECKOUT_SNAPSHOT";
  BigDecimal rate=item.getCommissionRate();
  if(gross==null) {
   if(rental) throw new IllegalArgumentException("Legacy rental lacks a separately recorded fee/deposit breakdown");
   if(!"THRIFT".equals(item.getItemStatus()) && !"THRIFT + RENT".equals(item.getItemStatus()))
    throw new IllegalArgumentException("Unknown purchase type");
   var matcher=LEGACY_THRIFT.matcher(item.getPrice()==null?"":item.getPrice());
   if(!matcher.matches()) throw new IllegalArgumentException("Legacy item price cannot be parsed safely");
   gross=new BigDecimal(matcher.group(1).replace(",","")); rate=THRIFT_RATE; source="LEGACY_THRIFT_SNAPSHOT";
  }
  if(gross.signum()<0 || rate==null || rate.signum()<0 || rate.compareTo(BigDecimal.ONE)>0)
   throw new IllegalArgumentException("Invalid commission snapshot");
  gross=gross.setScale(2,RoundingMode.UNNECESSARY);
  BigDecimal cut=gross.multiply(rate).setScale(2,RoundingMode.HALF_UP);
  return new Amounts(rental?"rent":"thrift",gross,rate,cut,gross.subtract(cut),source);
 }
}
