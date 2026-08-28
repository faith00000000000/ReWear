package com.rewear.backend.notification.model;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name="notification_inbox_state") @Getter @Setter @NoArgsConstructor
public class NotificationInboxState {
 @Id private Long recipientId;
 private long unreadCount;
 private long revision;
 private long sequence;
 public NotificationInboxState(Long recipientId) { this.recipientId=recipientId; }
}
