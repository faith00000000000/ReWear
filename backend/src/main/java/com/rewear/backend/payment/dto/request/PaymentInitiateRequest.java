package com.rewear.backend.payment.dto.request;

import com.rewear.backend.payment.enums.PaymentGateway;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentInitiateRequest {
    private Long orderId;
    private Long amountNpr;
    private PaymentGateway paymentGateway;
    private String successUrl;
    private String failureUrl;
}