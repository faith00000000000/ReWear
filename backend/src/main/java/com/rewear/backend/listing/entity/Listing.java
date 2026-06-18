package com.rewear.backend.listing.entity;
// listing/entity/Listing.java
import com.rewear.backend.listing.enums.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Section 1: Basic Information ──────────────────────────────────

    @Column(name = "product_title", nullable = false, length = 80)
    private String productTitle;

    @Enumerated(EnumType.STRING)
    @Column(name = "listing_mode", nullable = false)
    private ListingMode listingMode;

    @Column(name = "clothing_type", nullable = false)
    private String clothingType;

    @Column(name = "gender", nullable = false)
    private String gender;

    @Column(name = "brand")
    private String brand;

    @Column(name = "style_occasion")
    private String styleOccasion;

    // Stored as comma-separated string: "Minimal,Party,Work"
    @Column(name = "tags", length = 500)
    private String tags;

    // ── Section 2: Media — Supabase public URLs ───────────────────────

    @Column(name = "photo_front_url", length = 1000)
    private String photoFrontUrl;

    @Column(name = "photo_back_url", length = 1000)
    private String photoBackUrl;

    @Column(name = "photo_label_url", length = 1000)
    private String photoLabelUrl;

    @Column(name = "photo_detail_url", length = 1000)
    private String photoDetailUrl;

    @Column(name = "video_url", length = 1000)
    private String videoUrl;

    // ── Section 3: Description ────────────────────────────────────────

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // ── Section 4: Item Attributes ────────────────────────────────────

    @Column(name = "size", nullable = false)
    private String size;

    @Column(name = "item_condition", nullable = false)  // 'condition' is reserved in MySQL
    private String condition;

    @Column(name = "color", nullable = false)
    private String color;

    @Column(name = "material", nullable = false)
    private String material;

    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability")
    @Builder.Default
    private Availability availability = Availability.AVAILABLE;

    @Enumerated(EnumType.STRING)
    @Column(name = "shipping_option", nullable = false)
    private ShippingOptions shippingOption;

    @Column(name = "defect_flaws", columnDefinition = "TEXT")
    private String defectFlaws;

    // ── Section 5: Pricing ────────────────────────────────────────────

    @Column(name = "thrift_price", precision = 10, scale = 2)
    private BigDecimal thriftPrice;

    @Column(name = "rent_per_day", precision = 10, scale = 2)
    private BigDecimal rentPerDay;

    @Column(name = "security_deposit", precision = 10, scale = 2)
    private BigDecimal securityDeposit;

    // ── Listing Lifecycle ─────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ListingStatus status = ListingStatus.DRAFT;

    // FK to users table — wire up to your existing User entity later
    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    // ── Audit ─────────────────────────────────────────────────────────

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}