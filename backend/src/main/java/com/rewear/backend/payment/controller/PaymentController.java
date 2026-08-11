package com.rewear.backend.payment.controller;

import com.rewear.backend.payment.dto.request.PaymentInitiateRequest;
import com.rewear.backend.payment.dto.reponse.PaymentInitiateResponse;
import com.rewear.backend.payment.dto.reponse.PaymentTransactionResponse;
import com.rewear.backend.payment.dto.request.PaymentVerifyRequest;
import com.rewear.backend.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<PaymentInitiateResponse> initiate(
            @RequestBody PaymentInitiateRequest request
    ) throws Exception {
        return ResponseEntity.ok(paymentService.initiatePayment(request));
    }

    // eSewa hits this (via your success page) with the base64 "data" query param
    // Khalti hits this (via your success page) with pidx / status / transaction_id
    @PostMapping("/verify")
    public ResponseEntity<PaymentTransactionResponse> verify(
            @RequestBody PaymentVerifyRequest request
    ) throws Exception {
        return ResponseEntity.ok(paymentService.verifyAndComplete(request));
    }
}