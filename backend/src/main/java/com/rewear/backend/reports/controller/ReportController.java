package com.rewear.backend.reports.controller;
// src/main/java/com/rewear/report/controller/ReportController.java

import com.rewear.backend.reports.dto.request.ReportCreateRequest;
import com.rewear.backend.reports.dto.request.ReportStatusUpdateRequest;
import com.rewear.backend.reports.dto.response.ReportResponse;
import com.rewear.backend.reports.dto.response.ReportStatsResponse;
import com.rewear.backend.reports.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // Called by ReportModal on the product detail page — any logged-in
    // buyer can flag a listing. authentication.getName() is treated as
    // the user's email; adjust in ReportServiceImpl if that's not the case.
    @PostMapping
    public ResponseEntity<ReportResponse> createReport(
            @Valid @RequestBody ReportCreateRequest request,
            Authentication authentication) {
        ReportResponse response = reportService.createReport(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Admin dashboard — paginated + filterable list.
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ReportResponse>> getReports(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String listingType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "reportedAt"));
        return ResponseEntity.ok(reportService.getReports(status, listingType, search, pageable));
    }

    // Feeds the summary cards (Total / Pending / Investigating / Resolved).
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportStatsResponse> getStats() {
        return ResponseEntity.ok(reportService.getStats());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportResponse> getReport(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }

    // Admin's "Confirm Resolution" action in the report detail drawer.
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ReportStatusUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(reportService.updateReportStatus(id, request, authentication.getName()));
    }
}