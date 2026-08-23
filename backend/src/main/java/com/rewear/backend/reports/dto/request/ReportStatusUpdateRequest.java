package com.rewear.backend.reports.dto.request;

// src/main/java/com/rewear/report/dto/request/ReportStatusUpdateRequest.java

import com.rewear.backend.reports.enums.ReportActionTaken;
import com.rewear.backend.reports.enums.ReportStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// Sent by the admin dashboard's resolution panel (Mark Investigating /
// Resolve / Dismiss, with an optional action taken + note).
@Getter
@Setter
public class ReportStatusUpdateRequest {

    @NotNull(message = "status is required")
    private ReportStatus status;

    private ReportActionTaken actionTaken;

    @Size(max = 1000)
    private String adminNote;
}
