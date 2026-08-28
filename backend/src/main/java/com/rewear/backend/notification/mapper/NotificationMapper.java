package com.rewear.backend.notification.mapper;
import com.rewear.backend.notification.model.Notification;
import com.rewear.backend.notification.dto.response.NotificationResponse;
import org.springframework.stereotype.Component;
@Component
public class NotificationMapper {
 public NotificationResponse toResponse(Notification n) {
  return new NotificationResponse(n.getId(),n.getSequence(),n.getType(),n.getTitle(),n.getMessage(),n.getHref(),n.getCreatedAt(),n.getReadAt());
 }
}
