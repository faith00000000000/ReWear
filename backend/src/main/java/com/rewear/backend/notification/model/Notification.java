package com.rewear.backend.notification.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Entity @Table(name="notifications", indexes={
 @Index(name="idx_notification_inbox",columnList="recipient_id,inbox_sequence"),
 @Index(name="idx_notification_unread",columnList="recipient_id,read_at")},
 uniqueConstraints=@UniqueConstraint(name="uk_notification_event",columnNames={"recipient_id","event_key"}))
@Getter @Setter @NoArgsConstructor
public class Notification {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="recipient_id",nullable=false) private Long recipientId;
 @Column(name="inbox_sequence",nullable=false) private long sequence;
 @Column(name="event_key",nullable=false,length=180) private String eventKey;
 @Column(nullable=false,length=50) private String type;
 @Column(nullable=false,length=160) private String title;
 @Column(nullable=false,length=1000) private String message;
 @Column(nullable=false,length=400) private String href;
 @Column(name="created_at",nullable=false) private Instant createdAt;
 @Column(name="read_at") private Instant readAt;
}
