package com.rewear.backend.reports.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// Shape sent by ReportModal on the product detail page:
// api.post('/api/reports', { listingId, reason, details })
@Getter
@Setter
public class ReportCreateRequest {

    @NotNull(message = "listingId is required")
    private Long listingId;

    @NotBlank(message = "reason is required")
    @Size(max = 150)
    private String reason;

    @Size(max = 500, message = "details must be at most 500 characters")
    private String details;
}