package com.rewear.backend.payment.service;

import com.rewear.backend.order.modal.Order;
import com.rewear.backend.order.repository.OrderRepository;
import com.rewear.backend.payment.enums.PaymentGateway;
import com.rewear.backend.payment.mapper.PaymentMapper;
import com.rewear.backend.payment.enums.PaymentStatus;
import com.rewear.backend.payment.modal.PaymentTransaction;
import com.rewear.backend.payment.dto.request.PaymentInitiateRequest;
import com.rewear.backend.payment.dto.reponse.PaymentInitiateResponse;
import com.rewear.backend.payment.dto.reponse.PaymentTransactionResponse;
import com.rewear.backend.payment.dto.request.PaymentVerifyRequest;
import com.rewear.backend.payment.gateway.EsewaGatewayService;
import com.rewear.backend.payment.gateway.KhaltiGatewayService;
import com.rewear.backend.payment.repository.PaymentTransactionRepository;
import com.rewear.backend.user.service.EmailService;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.Map;
import java.util.Random;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentTransactionRepository transactionRepository;
    private final OrderRepository orderRepository;
    private final EsewaGatewayService esewaService;
    private final KhaltiGatewayService khaltiService;
    private final PaymentMapper paymentMapper;
    private final EmailService emailService;

    @Transactional
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request) throws Exception {

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found: " + request.getOrderId()));

        String referenceId =
                "RWR-" + Year.now().getValue() + "-"
                        + String.format("%06d", new Random().nextInt(999999));

        log.info("Initiating payment: ref={} gateway={} amountNpr={}",
                referenceId, request.getPaymentGateway(), request.getAmountNpr());

        String gatewayRedirectUrl;
        String gatewayMethod = "GET";
        Map<String, String> gatewayFormFields = null;
        String pidx = null;

        switch (request.getPaymentGateway()) {
            case ESEWA -> {
                EsewaGatewayService.EsewaPaymentForm form = esewaService.buildPaymentForm(
                        referenceId,
                        request.getAmountNpr(),
                        request.getSuccessUrl(),
                        request.getFailureUrl()
                );
                gatewayRedirectUrl = form.actionUrl();
                gatewayMethod = "POST";
                gatewayFormFields = form.fields();
            }
            case KHALTI -> {
                long amountPaisa = request.getAmountNpr() * 100L;
                KhaltiGatewayService.KhaltiInitiateResult result = khaltiService.initiatePayment(
                        referenceId,
                        amountPaisa,
                        "RE:WEAR Order #" + order.getId(),
                        request.getSuccessUrl()
                );
                pidx = result.pidx();
                gatewayRedirectUrl = result.paymentUrl();
            }
            default -> throw new IllegalArgumentException(
                    "Unsupported gateway: " + request.getPaymentGateway());
        }

        PaymentTransaction tx = PaymentTransaction.builder()
                .order(order)
                .referenceId(referenceId)
                .paymentGateway(request.getPaymentGateway())
                .paymentStatus(PaymentStatus.INITIATED)
                .amountNpr(request.getAmountNpr())
                .gatewayRedirectUrl(gatewayRedirectUrl)
                .gatewayTransactionId(pidx)
                .build();

        transactionRepository.save(tx);
        log.info("PaymentTransaction saved: ref={} status=INITIATED", referenceId);

        return PaymentInitiateResponse.builder()
                .referenceId(referenceId)
                .gatewayRedirectUrl(gatewayRedirectUrl)
                .gatewayMethod(gatewayMethod)
                .gatewayFormFields(gatewayFormFields)
                .gateway(request.getPaymentGateway().name())
                .status(PaymentStatus.INITIATED.name())
                .build();
    }

    @Transactional
    public PaymentTransactionResponse verifyAndComplete(PaymentVerifyRequest request) throws Exception {

        PaymentTransaction tx = transactionRepository
                .findByReferenceId(request.getReferenceId())
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + request.getReferenceId()));

        log.info("Verifying payment: ref={} gateway={} currentStatus={}",
                tx.getReferenceId(), tx.getPaymentGateway(), tx.getPaymentStatus());

        if (tx.getPaymentStatus() == PaymentStatus.SUCCESS) {
            log.warn("Payment already verified, skipping: ref={}", tx.getReferenceId());
            return paymentMapper.toResponse(tx);
        }

        boolean verified = switch (tx.getPaymentGateway()) {
            case ESEWA -> esewaService.verifyPayment(
                    tx.getReferenceId(),
                    tx.getAmountNpr(),
                    request.getGatewayResponseData()
            );
            case KHALTI -> khaltiService.verifyPayment(
                    tx.getGatewayTransactionId(),
                    tx.getAmountNpr() * 100L
            );
        };

        if (verified) {
            tx.setPaymentStatus(PaymentStatus.SUCCESS);
            tx.setGatewayTransactionId(request.getGatewayTransactionId());
            tx.setGatewayResponse(request.getGatewayResponseData());
            tx.setCompletedAt(java.time.LocalDateTime.now());

            Order order = tx.getOrder();
            order.setStatus("CONFIRMED");
            orderRepository.save(order);

            log.info("Payment verified SUCCESS: ref={}", tx.getReferenceId());

            // ── Send transaction receipt email ──
            try {
                String formattedDate = tx.getCompletedAt()
                        .format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));

                emailService.sendPaymentReceiptEmail(
                        order.getBuyer().getEmail(),
                        order.getBuyer().getFullName(),
                        tx.getReferenceId(),
                        tx.getPaymentGateway().name(),
                        tx.getAmountNpr(),
                        tx.getGatewayTransactionId(),
                        order.getId(),
                        order.getStatus(),
                        formattedDate
                );
            } catch (Exception e) {
                // Never let email failure break the payment verification flow
                log.error("Could not queue payment receipt email for ref={}: {}",
                        tx.getReferenceId(), e.getMessage());
            }

        } else {
            tx.setPaymentStatus(PaymentStatus.FAILED);
            log.warn("Payment verification FAILED: ref={} gateway={}",
                    tx.getReferenceId(), tx.getPaymentGateway());
        }

        return paymentMapper.toResponse(transactionRepository.save(tx));
    }
}