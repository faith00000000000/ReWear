package com.rewear.backend.notification.service;
import com.rewear.backend.notification.enums.NotificationType;
import com.rewear.backend.notification.dto.response.*;
public interface NotificationService {
 void notifyUser(Long recipientId,String eventKey,NotificationType type,String title,String message,String href);
 void notifyAdmins(String eventKey,NotificationType type,String title,String message,String href);
 NotificationPageResponse inbox(String email,Long cursor,int size,boolean unreadOnly);
 NotificationUnreadResponse unread(String email);
 NotificationUnreadResponse markRead(String email,Long id);
 NotificationUnreadResponse markAllRead(String email,long throughSequence);
}
