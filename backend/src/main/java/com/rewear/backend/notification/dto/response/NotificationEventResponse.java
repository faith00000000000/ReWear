package com.rewear.backend.notification.dto.response;
public record NotificationEventResponse(String eventId,String type,long unreadCount,long revision,long watermark) {}
