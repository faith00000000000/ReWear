package com.rewear.backend.notification.controller;
import com.rewear.backend.notification.service.NotificationService;
import com.rewear.backend.notification.dto.request.MarkAllNotificationsReadRequest;
import com.rewear.backend.notification.dto.response.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
@RestController @RequestMapping("/api/notifications") @RequiredArgsConstructor
public class NotificationController {
 private final NotificationService service;
 @GetMapping public NotificationPageResponse inbox(Principal principal,@RequestParam(required=false) Long cursor,
  @RequestParam(defaultValue="20") int size,@RequestParam(defaultValue="false") boolean unreadOnly) {
  return service.inbox(principal.getName(),cursor,size,unreadOnly);
 }
 @GetMapping("/unread-count") public NotificationUnreadResponse unread(Principal principal) { return service.unread(principal.getName()); }
 @PatchMapping("/{id}/read") public NotificationUnreadResponse read(Principal principal,@PathVariable Long id) { return service.markRead(principal.getName(),id); }
 @PatchMapping("/read-all") public NotificationUnreadResponse readAll(Principal principal,@Valid @RequestBody MarkAllNotificationsReadRequest request) {
  return service.markAllRead(principal.getName(),request.throughSequence());
 }
}
