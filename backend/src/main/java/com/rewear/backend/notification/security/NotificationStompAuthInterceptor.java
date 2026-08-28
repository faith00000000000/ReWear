package com.rewear.backend.notification.security;
import com.rewear.backend.security.JwtService;
import com.rewear.backend.notification.repository.NotificationRecipientRepository;
import com.rewear.backend.user.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.messaging.*;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.messaging.support.*;
import org.springframework.security.access.AccessDeniedException;
@Component @RequiredArgsConstructor
public class NotificationStompAuthInterceptor implements ChannelInterceptor {
 private final JwtService jwt;
 private final NotificationRecipientRepository recipients;
 private final NotificationSocketSessions sessions;
 @Override public Message<?> preSend(Message<?> message,MessageChannel channel) {
  StompHeaderAccessor h=MessageHeaderAccessor.getAccessor(message,StompHeaderAccessor.class);
  if(h==null) throw new AccessDeniedException("STOMP required");
  StompCommand command=h.getCommand();
  if(command==StompCommand.DISCONNECT) return message;
  if(command==StompCommand.CONNECT) {
   String header=h.getFirstNativeHeader("Authorization");
   if(header==null || !header.startsWith("Bearer ")) throw new AccessDeniedException("Access token required");
   String token=header.substring(7);
   Long userId=jwt.extractUserId(token);
   if(userId==null || jwt.extractRole(token)==null) throw new AccessDeniedException("Access token required");
   var user=recipients.findByEmail(jwt.extractEmail(token)).orElseThrow(()->new AccessDeniedException("Unknown account"));
   if(!userId.equals(user.getId()) || !Boolean.TRUE.equals(user.getIsActive()) || user.getStatus()==UserStatus.BANNED)
    throw new AccessDeniedException("Inactive account");
   long remaining=jwt.getTokenExpiryTime(token);
   if(remaining<=0) throw new AccessDeniedException("Expired token");
   var identity=new NotificationSocketSessions.Identity(user.getEmail(),userId,System.currentTimeMillis()+remaining);
   sessions.authenticated(h.getSessionId(),identity); h.setUser(identity);
   return message;
  }
  if(!sessions.valid(h.getSessionId())) throw new AccessDeniedException("Session expired");
  if(command==StompCommand.SUBSCRIBE && !"/user/queue/notifications".equals(h.getDestination()))
   throw new AccessDeniedException("Private notification queue only");
  if(command!=null && command!=StompCommand.SUBSCRIBE && command!=StompCommand.UNSUBSCRIBE)
   throw new AccessDeniedException("Client messages are not supported");
  return message;
 }
}
