package com.rewear.backend.notification.dto.response;
import java.time.Instant;
public record NotificationResponse(Long id,long sequence,String type,String title,String message,String href,Instant createdAt,Instant readAt) {}
