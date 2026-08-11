package com.rewear.backend.payment.mapper;

import com.rewear.backend.payment.dto.reponse.PaymentTransactionResponse;
import com.rewear.backend.payment.modal.PaymentTransaction;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public com.rewear.backend.payment.dto.reponse.PaymentTransactionResponse toResponse(PaymentTransaction tx) {
        return PaymentTransactionResponse.builder()
                .referenceId(tx.getReferenceId())
                .gateway(tx.getPaymentGateway())
                .status(tx.getPaymentStatus())
                .amountNpr(tx.getAmountNpr())
                .completedAt(tx.getCompletedAt())
                .build();
    }
}