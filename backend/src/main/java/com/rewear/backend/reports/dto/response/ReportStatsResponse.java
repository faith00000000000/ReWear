package com.rewear.backend.reports.dto.response;
// src/main/java/com/rewear/report/dto/response/ReportStatsResponse.java

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

// Powers the summary cards (Total / Pending / Investigating / Resolved).
@Getter
@Builder
@AllArgsConstructor
public class ReportStatsResponse {
    private long total;
    private long pending;
    private long investigating;
    private long resolved;
    private long dismissed;
}