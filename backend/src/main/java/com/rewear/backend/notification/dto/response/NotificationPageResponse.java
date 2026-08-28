package com.rewear.backend.notification.dto.response;
import java.util.List;
public record NotificationPageResponse(List<NotificationResponse> items,Long nextCursor,NotificationUnreadResponse state) {}
