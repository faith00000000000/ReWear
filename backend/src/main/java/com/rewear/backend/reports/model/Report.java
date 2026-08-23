package com.rewear.backend.reports.model;
// src/main/java/com/rewear/backend/report/model/Report.java

import com.rewear.backend.listing.enums.ListingMode;
import com.rewear.backend.reports.enums.ReportActionTaken;
import com.rewear.backend.reports.enums.ReportStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Listing snapshot, captured at report time ──
    @Column(nullable = false)
    private Long listingId;

    private String itemTitle;

    private String itemImage;

    // Reused directly from the listing module — THRIFT / RENT / THRIFT_AND_RENT.
    // "FLEX" is a display-only label the frontend applies for THRIFT_AND_RENT;
    // the backend always stores the real listing mode.
    @Enumerated(EnumType.STRING)
    private ListingMode listingType;

    private Double price;

    // ── Seller snapshot ──
    private Long sellerId;

    private String sellerName;

    // ── Reporter (the buyer who filed the report) ──
    @Column(nullable = false)
    private Long reporterId;

    private String reporterName;

    private String reporterEmail;

    // ── The complaint itself ──
    @Column(nullable = false, length = 150)
    private String reason;

    @Column(length = 1000)
    private String details;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status = ReportStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private ReportActionTaken actionTaken = ReportActionTaken.NONE;

    @Column(length = 1000)
    private String adminNote;

    private String reviewedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime reportedAt;

    private LocalDateTime resolvedAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.reportedAt = LocalDateTime.now();
        this.updatedAt = this.reportedAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}