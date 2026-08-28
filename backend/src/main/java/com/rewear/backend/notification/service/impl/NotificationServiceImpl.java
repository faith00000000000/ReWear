package com.rewear.backend.notification.service.impl;
import com.rewear.backend.notification.service.NotificationService;
import com.rewear.backend.notification.dto.response.*;
import com.rewear.backend.notification.enums.NotificationType;
import com.rewear.backend.notification.model.*;
import com.rewear.backend.notification.repository.*;
import com.rewear.backend.notification.mapper.NotificationMapper;
import com.rewear.backend.user.enums.*;
import com.rewear.backend.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.Instant;
@Service @RequiredArgsConstructor @Transactional(isolation=org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
public class NotificationServiceImpl implements NotificationService {
 private final NotificationRepository notifications;
 private final NotificationInboxStateRepository states;
 private final NotificationOutboxRepository outbox;
 private final NotificationRecipientRepository recipients;
 private final NotificationMapper mapper;

 public void notifyUser(Long recipientId,String eventKey,NotificationType type,String title,String message,String href) {
  if (recipientId==null) return; // Guest donations have no inbox.
  recipients.lockRecipient(recipientId).orElseThrow(()->new IllegalArgumentException("Unknown recipient"));
  if (notifications.findByRecipientIdAndEventKey(recipientId,eventKey).isPresent()) return;
  if (!href.startsWith("/") || href.startsWith("//") || href.contains("\\"))
   throw new IllegalArgumentException("Notification destination must be a local path");
  NotificationInboxState state=state(recipientId);
  state.setSequence(state.getSequence()+1);
  state.setUnreadCount(state.getUnreadCount()+1);
  Notification n=new Notification();
  n.setRecipientId(recipientId); n.setSequence(state.getSequence()); n.setEventKey(eventKey);
  n.setType(type.name()); n.setTitle(title); n.setMessage(message); n.setHref(href); n.setCreatedAt(Instant.now());
  notifications.saveAndFlush(n);
  changed(state);
 }
 public void notifyAdmins(String key,NotificationType type,String title,String message,String href) {
  for (Long id:recipients.recipientsByRole(Role.ADMIN)) notifyUser(id,key,type,title,message,href);
 }
 public NotificationPageResponse inbox(String email,Long cursor,int size,boolean unreadOnly) {
  User user=current(email); // Serialize snapshot with read/write operations for a coherent revision.
  NotificationInboxState state=state(user.getId());
  int limit=Math.max(1,Math.min(size,50));
  var rows=notifications.inbox(user.getId(),cursor,unreadOnly,PageRequest.of(0,limit+1));
  boolean more=rows.size()>limit;
  var visible=rows.subList(0,Math.min(rows.size(),limit));
  return new NotificationPageResponse(visible.stream().map(mapper::toResponse).toList(),
   more?visible.get(visible.size()-1).getSequence():null,snapshot(state));
 }
 public NotificationUnreadResponse unread(String email) { return snapshot(state(current(email).getId())); }
 public NotificationUnreadResponse markRead(String email,Long id) {
  Long userId=current(email).getId();
  Notification n=notifications.findByIdAndRecipientId(id,userId)
   .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Notification not found"));
  NotificationInboxState state=state(userId);
  if(n.getReadAt()==null) { state.setUnreadCount(state.getUnreadCount()-1); n.setReadAt(Instant.now()); notifications.saveAndFlush(n); changed(state); }
  return snapshot(state);
 }
 public NotificationUnreadResponse markAllRead(String email,long throughSequence) {
  if(throughSequence<0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid watermark");
  NotificationInboxState state=state(current(email).getId());
  int changedRows=notifications.markAll(state.getRecipientId(),Math.min(throughSequence,state.getSequence()),Instant.now());
  if(changedRows>0) { state.setUnreadCount(state.getUnreadCount()-changedRows); changed(state); }
  return snapshot(state);
 }
 private User current(String email) {
  User found=recipients.findByEmail(email).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED));
  User user=recipients.lockRecipient(found.getId()).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED));
  if(!Boolean.TRUE.equals(user.getIsActive()) || user.getStatus()==UserStatus.BANNED)
   throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Account inactive");
  return user;
 }
 private NotificationInboxState state(Long id) {
  return states.findById(id).orElseGet(()->states.save(new NotificationInboxState(id)));
 }
 private NotificationUnreadResponse snapshot(NotificationInboxState state) {
  return new NotificationUnreadResponse(state.getUnreadCount(),state.getRevision(),state.getSequence());
 }
 private void changed(NotificationInboxState state) {
  state.setRevision(state.getRevision()+1); states.save(state);
  NotificationOutboxEvent event=new NotificationOutboxEvent();
  event.setRecipientId(state.getRecipientId()); event.setRevision(state.getRevision());
  event.setWatermark(state.getSequence()); event.setUnreadCount(snapshot(state).unreadCount()); event.setCreatedAt(Instant.now());
  outbox.save(event);
 }
}
