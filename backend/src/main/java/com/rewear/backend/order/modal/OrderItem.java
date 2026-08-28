package com.rewear.backend.order.modal;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "listing_id", nullable = false)
    private Long listingId;

    @Column(precision=14,scale=2) private java.math.BigDecimal feeAmountNpr;
    @Column(precision=14,scale=2) private java.math.BigDecimal depositAmountNpr;
    @Column(precision=14,scale=2) private java.math.BigDecimal shippingAmountNpr;
    @Column(precision=5,scale=4) private java.math.BigDecimal commissionRate;
    private Long sellerId;
    private String sellerName;

    // Null means an existing, open rental. Closed states are irreversible.
    private String rentalState;
    private java.time.Instant rentalClosedAt;
    @Column(precision=14,scale=2) private java.math.BigDecimal cancellationFeeNpr;
    @Column(precision=14,scale=2) private java.math.BigDecimal refundDueNpr;
    private String refundState;

    // Snapshot fields — captured at checkout time so history stays accurate
    // even if the listing is later edited or removed
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String image;

    @Column(nullable = false)
    private String price; // display string, e.g. "Rs. 1,200"

    // "THRIFT" | "RENT" | "THRIFT + RENT" — matches the cart's status labels
    @Column(name = "item_status", nullable = false)
    private String itemStatus;

    @Column(name = "rental_start")
    private String rentalStart;

    @Column(name = "rental_end")
    private String rentalEnd;

    @Column(name = "rental_days")
    private Integer rentalDays;

    @Column(name = "return_deadline")
    private String returnDeadline;

    @Column(name = "rental_start_iso")
    private String rentalStartIso;

    @Column(name = "rental_end_iso")
    private String rentalEndIso;
}
