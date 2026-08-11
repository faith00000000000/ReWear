package com.rewear.backend.payment.dto.reponse;

import com.rewear.backend.payment.enums.PaymentGateway;
import com.rewear.backend.payment.enums.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentTransactionResponse {
    private String referenceId;
    private PaymentGateway gateway;
    private PaymentStatus status;
    private Long amountNpr;
    private LocalDateTime completedAt;
}
