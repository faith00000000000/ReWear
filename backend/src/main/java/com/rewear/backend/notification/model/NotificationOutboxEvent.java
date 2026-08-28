package com.rewear.backend.notification.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Entity @Table(name="notification_outbox",indexes=@Index(name="idx_notification_delivery",columnList="delivered_at,id"))
@Getter @Setter @NoArgsConstructor
public class NotificationOutboxEvent {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private Long recipientId;
 @Column(nullable=false) private long revision;
 @Column(nullable=false) private long unreadCount;
 @Column(nullable=false) private long watermark;
 @Column(nullable=false) private Instant createdAt;
 @Column(name="delivered_at") private Instant deliveredAt;
}
