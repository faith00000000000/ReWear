package com.rewear.backend.reports.service.impl;// src/main/java/com/rewear/backend/report/service/impl/ReportServiceImpl.java

import com.rewear.backend.listing.enums.ListingMode;
import com.rewear.backend.reports.dto.request.ReportCreateRequest;
import com.rewear.backend.reports.dto.request.ReportStatusUpdateRequest;
import com.rewear.backend.reports.dto.response.ReportResponse;
import com.rewear.backend.reports.dto.response.ReportStatsResponse;
import com.rewear.backend.reports.enums.ReportStatus;
import com.rewear.backend.reports.mapper.ReportMapper;
import com.rewear.backend.reports.model.Report;
import com.rewear.backend.reports.repository.ReportRepository;
import com.rewear.backend.reports.service.ReportService;
import java.math.BigDecimal;

// TODO(ADAPT): point these at your real Listing/User entities & repos.
import com.rewear.backend.listing.entity.Listing;
import com.rewear.backend.listing.repository.ListingRepository;
import com.rewear.backend.user.model.User;
import com.rewear.backend.user.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {
    private final com.rewear.backend.notification.service.NotificationService notificationService;

    private final ReportRepository reportRepository;
    private final ReportMapper reportMapper;

    // TODO(ADAPT): swap for your actual repositories/services.
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final com.rewear.backend.user.service.EmailService emailService;

    @Override
    @Transactional
    public ReportResponse createReport(ReportCreateRequest request, String reporterEmail) {
        Report report = new Report();
        report.setListingId(request.getListingId());
        report.setReason(request.getReason());
        report.setDetails(request.getDetails());
        report.setStatus(ReportStatus.PENDING);

        enrichWithListingSnapshot(report, request.getListingId());
        enrichWithReporterSnapshot(report, reporterEmail);

        Report saved = reportRepository.save(report);
        notificationService.notifyAdmins("report-created:" + saved.getId(),
            com.rewear.backend.notification.enums.NotificationType.REPORT,
            "New report", "A report has been submitted for review.", "/admin/reports");
        return reportMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReportResponse> getReports(String status, String listingType, String search, Pageable pageable) {
        Specification<Report> spec = buildSpecification(status, listingType, search);
        return reportRepository.findAll(spec, pageable).map(reportMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ReportResponse getReportById(Long id) {
        return reportMapper.toResponse(findReportOrThrow(id));
    }

    @Override
    @Transactional
    public ReportResponse updateReportStatus(Long id, ReportStatusUpdateRequest request, String reviewerEmail) {
        Report report = findReportOrThrow(id);
        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.FORBIDDEN, "Admin access required"));
        if (reviewer.getRole() != com.rewear.backend.user.enums.Role.ADMIN
                || !Boolean.TRUE.equals(reviewer.getIsActive())
                || reviewer.getStatus() == com.rewear.backend.user.enums.UserStatus.BANNED) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Admin access required");
        }
        var previousAction = report.getActionTaken();

        if (report.getStatus() != request.getStatus()) {
            notificationService.notifyUser(report.getReporterId(),
                "report-status:" + id + ":" + java.util.UUID.randomUUID(),
                com.rewear.backend.notification.enums.NotificationType.REPORT,
                "Report status updated", "Your report #" + id + " is now " + request.getStatus().name().toLowerCase() + ".",
                "/notifications");
        }
        report.setStatus(request.getStatus());
        if (request.getActionTaken() != null) {
            report.setActionTaken(request.getActionTaken());
        }
        if (request.getAdminNote() != null) {
            report.setAdminNote(request.getAdminNote());
        }
        report.setReviewedBy(reviewerEmail);

        if (request.getStatus() == ReportStatus.RESOLVED || request.getStatus() == ReportStatus.DISMISSED) {
            report.setResolvedAt(LocalDateTime.now());
        }

        if (request.getActionTaken() != null
                && request.getActionTaken() != com.rewear.backend.reports.enums.ReportActionTaken.NONE
                && request.getActionTaken() != previousAction) {
            enforce(report, request.getActionTaken(), request.getAdminNote());
        }

        Report saved = reportRepository.save(report);
        return reportMapper.toResponse(saved);
    }

    private void enforce(Report report, com.rewear.backend.reports.enums.ReportActionTaken action, String note) {
        Listing listing = listingRepository.findById(report.getListingId())
                .orElseThrow(() -> new EntityNotFoundException("Listing not found: " + report.getListingId()));
        User seller = listing.getSeller();
        String title;
        String message;

        switch (action) {
            case WARNING_ISSUED -> {
                title = "Moderation warning";
                message = "A warning was issued for listing #" + listing.getId() + " (" + listing.getProductTitle() + ").";
            }
            case LISTING_HIDDEN -> {
                listing.setStatus(com.rewear.backend.listing.enums.ListingStatus.ARCHIVED);
                listingRepository.save(listing);
                title = "Listing hidden";
                message = "Listing #" + listing.getId() + " was hidden after moderation review.";
            }
            case LISTING_REMOVED -> {
                listing.setStatus(com.rewear.backend.listing.enums.ListingStatus.ARCHIVED);
                listingRepository.save(listing);
                title = "Listing removed";
                message = "Listing #" + listing.getId() + " was removed from the marketplace after moderation review.";
            }
            case SELLER_SUSPENDED -> {
                listing.setStatus(com.rewear.backend.listing.enums.ListingStatus.ARCHIVED);
                listingRepository.save(listing);
                seller.setSuspendedUntil(LocalDateTime.now().plusDays(15));
                userRepository.save(seller);
                title = "Account suspended for 15 days";
                message = "Your account is restricted for 15 days and listing #" + listing.getId()
                        + " was removed from the marketplace.";
            }
            default -> { return; }
        }

        if (note != null && !note.isBlank()) {
            message += " Admin note: " + note;
        }
        notificationService.notifyUser(seller.getId(), "report-enforcement:" + report.getId() + ":" + action,
                com.rewear.backend.notification.enums.NotificationType.REPORT, title, message, "/profile/listings");
        emailService.sendModerationEmail(seller.getEmail(), seller.getFullName(), title, message);
    }

    @Override
    @Transactional(readOnly = true)
    public ReportStatsResponse getStats() {
        return ReportStatsResponse.builder()
                .total(reportRepository.count())
                .pending(reportRepository.countByStatus(ReportStatus.PENDING))
                .investigating(reportRepository.countByStatus(ReportStatus.INVESTIGATING))
                .resolved(reportRepository.countByStatus(ReportStatus.RESOLVED))
                .dismissed(reportRepository.countByStatus(ReportStatus.DISMISSED))
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    private Report findReportOrThrow(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Report not found: " + id));
    }

    // TODO(ADAPT): pick which photo represents this listing in the report snapshot.
// Using photoFrontUrl here — swap if you prefer a different one.
    private void enrichWithListingSnapshot(Report report, Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new EntityNotFoundException("Listing not found: " + listingId));

        report.setItemTitle(listing.getProductTitle());
        report.setItemImage(listing.getPhotoFrontUrl());

        // No single getPrice() on Listing — thrift and rent are separate fields.
        // Prefer thriftPrice; fall back to rentPerDay for RENT-only listings.
        BigDecimal price = listing.getThriftPrice() != null
                ? listing.getThriftPrice()
                : listing.getRentPerDay();
        report.setPrice(price != null ? price.doubleValue() : null);

        // Store the listing's real mode as-is — THRIFT, RENT, or THRIFT_AND_RENT.
        // No collapsing here; "FLEX" is only ever a frontend display label.
        report.setListingType(listing.getListingMode());

        if (listing.getSeller() != null) {
            report.setSellerId(listing.getSeller().getId());
            report.setSellerName(listing.getSeller().getFullName());
        }
    }

    // TODO(ADAPT): this assumes Authentication#getName() returns the user's
// email and that UserRepository can resolve it.
    private void enrichWithReporterSnapshot(Report report, String reporterEmail) {
        User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + reporterEmail));

        report.setReporterId(reporter.getId());
        report.setReporterName(reporter.getFullName());
        report.setReporterEmail(reporter.getEmail());
    }

    private Specification<Report> buildSpecification(String status, String listingType, String search) {
        List<Specification<Report>> specs = new ArrayList<>();

        if (status != null && !status.equalsIgnoreCase("all")) {
            ReportStatus parsedStatus = ReportStatus.valueOf(status.toUpperCase());
            specs.add((root, query, cb) -> cb.equal(root.get("status"), parsedStatus));
        }

        // Accepts THRIFT / RENT / THRIFT_AND_RENT from the query param.
        // The frontend sends THRIFT_AND_RENT even though it displays "Flex".
        if (listingType != null && !listingType.equalsIgnoreCase("all")) {
            ListingMode parsedMode = ListingMode.valueOf(listingType.toUpperCase());
            specs.add((root, query, cb) -> cb.equal(root.get("listingType"), parsedMode));
        }

        if (search != null && !search.isBlank()) {
            String like = "%" + search.toLowerCase() + "%";
            specs.add((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("itemTitle")), like),
                    cb.like(cb.lower(root.get("reason")), like),
                    cb.like(cb.lower(root.get("reporterName")), like),
                    cb.like(cb.lower(root.get("sellerName")), like)
            ));
        }

        return specs.stream().reduce(Specification::and).orElse(null);
    }
}