package com.rewear.backend.reports.service;

// src/main/java/com/rewear/report/service/ReportService.java

import com.rewear.backend.reports.dto.request.ReportCreateRequest;
import com.rewear.backend.reports.dto.request.ReportStatusUpdateRequest;
import com.rewear.backend.reports.dto.response.ReportResponse;
import com.rewear.backend.reports.dto.response.ReportStatsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReportService {

    // reporterEmail comes from Authentication#getName() — see controller.
    ReportResponse createReport(ReportCreateRequest request, String reporterEmail);

    Page<ReportResponse> getReports(String status, String listingType, String search, Pageable pageable);

    ReportResponse getReportById(Long id);

    ReportResponse updateReportStatus(Long id, ReportStatusUpdateRequest request, String reviewerEmail);

    ReportStatsResponse getStats();
}