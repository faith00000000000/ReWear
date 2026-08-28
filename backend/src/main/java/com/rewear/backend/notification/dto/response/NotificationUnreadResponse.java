package com.rewear.backend.notification.dto.response;
public record NotificationUnreadResponse(long unreadCount,long revision,long watermark) {}
