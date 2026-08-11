package com.rewear.backend.payment.dto.reponse;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class PaymentInitiateResponse {
    private String referenceId;
    private String gatewayRedirectUrl;

    // "POST" for eSewa (frontend must auto-submit a form), "GET" for Khalti
    // (frontend just redirects via window.location.href)
    private String gatewayMethod;

    // Populated only for eSewa — hidden form fields the frontend must submit
    private Map<String, String> gatewayFormFields;

    private String gateway;
    private String status;
}