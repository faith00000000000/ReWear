package com.rewear.backend.notification.dto.request;
import jakarta.validation.constraints.Min;
public record MarkAllNotificationsReadRequest(@Min(0) long throughSequence) {}
