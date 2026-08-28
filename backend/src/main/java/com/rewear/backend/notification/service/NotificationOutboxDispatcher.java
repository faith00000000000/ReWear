package com.rewear.backend.notification.service;
import com.rewear.backend.notification.repository.NotificationOutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
@Component @RequiredArgsConstructor @Slf4j
public class NotificationOutboxDispatcher {
 private final NotificationOutboxRepository outbox;
 private final NotificationOutboxDelivery delivery;
 @Scheduled(fixedDelayString="${app.notifications.dispatch-delay-ms:1000}")
 public void dispatch() {
  for(var event:outbox.findTop50ByDeliveredAtIsNullOrderByIdAsc()) {
   try { delivery.deliver(event.getId()); }
   catch(Exception failure) { log.warn("Notification event {} pending retry ({})",event.getId(),failure.getClass().getSimpleName()); }
  }
 }
}
