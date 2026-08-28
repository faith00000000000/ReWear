package com.rewear.backend.notification.service;
import com.rewear.backend.notification.repository.*;
import com.rewear.backend.notification.dto.response.NotificationEventResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import tools.jackson.databind.ObjectMapper;
import java.time.Instant;
@Service @RequiredArgsConstructor
public class NotificationOutboxDelivery {
 private final NotificationOutboxRepository outbox;
 private final NotificationRecipientRepository recipients;
 private final SimpMessagingTemplate messaging;
 private final ObjectMapper json;
 @Transactional
 public void deliver(Long id) {
  var event=outbox.findById(id).orElseThrow();
  if(event.getDeliveredAt()!=null) return;
  var user=recipients.findById(event.getRecipientId()).orElseThrow();
  var payload=new NotificationEventResponse(id.toString(),"INBOX_CHANGED",event.getUnreadCount(),event.getRevision(),event.getWatermark());
  // Personal destination fans out to every session. REST recovers events missed while offline.
  messaging.convertAndSendToUser(user.getEmail(),"/queue/notifications",json.writeValueAsString(payload));
  event.setDeliveredAt(Instant.now());
  outbox.save(event);
 }
}
