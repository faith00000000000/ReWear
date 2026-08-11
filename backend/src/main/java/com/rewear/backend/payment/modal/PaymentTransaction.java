package com.rewear.backend.payment.modal;

import com.rewear.backend.order.modal.Order;
import com.rewear.backend.payment.enums.PaymentGateway;
import com.rewear.backend.payment.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Our own generated ref, e.g. "RWR-2026-123456" — sent to the gateway
    // as transaction_uuid (eSewa) / purchase_order_id (Khalti)
    @Column(name = "reference_id", nullable = false, unique = true)
    private String referenceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_gateway", nullable = false)
    private PaymentGateway paymentGateway;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @Column(name = "amount_npr", nullable = false)
    private Long amountNpr;

    @Column(name = "gateway_redirect_url", length = 1000)
    private String gatewayRedirectUrl;

    // eSewa: unused. Khalti: stores pidx returned at initiate time,
    // later overwritten with the final transaction_id after verify.
    @Column(name = "gateway_transaction_id")
    private String gatewayTransactionId;

    // Raw response payload from the gateway callback — kept for audit/debug
    @Lob
    @Column(name = "gateway_response", columnDefinition = "LONGTEXT")
    private String gatewayResponse;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}