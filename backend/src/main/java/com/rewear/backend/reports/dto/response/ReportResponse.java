package com.rewear.backend.reports.dto.response;

// src/main/java/com/rewear/report/dto/response/ReportResponse.java
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private Long id;
    private Long listingId;
    private String itemTitle;
    private String itemImage;
    private String listingType;   // "THRIFT" | "RENT"
    private Double price;
    private Long sellerId;
    private String sellerName;
    private Long reporterId;
    private String reporterName;
    private String reporterEmail;
    private String reason;
    private String details;
    private String status;        // "PENDING" | "INVESTIGATING" | "RESOLVED" | "DISMISSED"
    private String actionTaken;   // "NONE" | "WARNING_ISSUED" | ...
    private String adminNote;
    private String reviewedBy;
    private LocalDateTime reportedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime updatedAt;
}