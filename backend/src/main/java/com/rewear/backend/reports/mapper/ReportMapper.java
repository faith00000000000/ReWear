package com.rewear.backend.reports.mapper;

// src/main/java/com/rewear/backend/report/mapper/ReportMapper.java

import com.rewear.backend.reports.dto.response.ReportResponse;
import com.rewear.backend.reports.model.Report;
import org.springframework.stereotype.Component;

@Component
public class ReportMapper {

    public ReportResponse toResponse(Report report) {
        if (report == null) return null;

        return ReportResponse.builder()
                .id(report.getId())
                .listingId(report.getListingId())
                .itemTitle(report.getItemTitle())
                .itemImage(report.getItemImage())
                // Sent as the raw enum name (THRIFT / RENT / THRIFT_AND_RENT).
                // Frontend decides how to label THRIFT_AND_RENT as "FLEX".
                .listingType(report.getListingType() != null ? report.getListingType().name() : null)
                .price(report.getPrice())
                .sellerId(report.getSellerId())
                .sellerName(report.getSellerName())
                .reporterId(report.getReporterId())
                .reporterName(report.getReporterName())
                .reporterEmail(report.getReporterEmail())
                .reason(report.getReason())
                .details(report.getDetails())
                .status(report.getStatus() != null ? report.getStatus().name() : null)
                .actionTaken(report.getActionTaken() != null ? report.getActionTaken().name() : null)
                .adminNote(report.getAdminNote())
                .reviewedBy(report.getReviewedBy())
                .reportedAt(report.getReportedAt())
                .resolvedAt(report.getResolvedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
}