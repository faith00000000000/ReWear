package com.rewear.backend.payment.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentVerifyRequest {
    private String referenceId;

    // eSewa: base64 "data" query param from success_url callback
    // Khalti: leave null — verifyPayment() re-fetches via lookup API
    private String gatewayResponseData;

    // Khalti: final transaction_id from the lookup response, saved for audit
    private String gatewayTransactionId;
}