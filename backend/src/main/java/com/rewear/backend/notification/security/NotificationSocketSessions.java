package com.rewear.backend.notification.security;
import com.rewear.backend.notification.repository.NotificationRecipientRepository;
import com.rewear.backend.user.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.socket.*;
import java.security.Principal;
import java.util.concurrent.ConcurrentHashMap;
@Component @RequiredArgsConstructor
public class NotificationSocketSessions {
 public record Identity(String name,Long userId,long expiresAt) implements Principal { public String getName(){return name;} }
 private final NotificationRecipientRepository recipients;
 private final ConcurrentHashMap<String,Identity> identities=new ConcurrentHashMap<>();
 private final ConcurrentHashMap<String,WebSocketSession> sockets=new ConcurrentHashMap<>();
 private final ConcurrentHashMap<String,Long> openedAt=new ConcurrentHashMap<>();
 public void opened(WebSocketSession session){ sockets.put(session.getId(),session); openedAt.put(session.getId(),System.currentTimeMillis()); }
 public void authenticated(String id,Identity identity){ identities.put(id,identity); }
 public void removed(String id){ identities.remove(id); sockets.remove(id); openedAt.remove(id); }
 public Identity identity(String id){return id==null?null:identities.get(id);}
 public boolean valid(String id) {
  Identity identity=identity(id);
  if(identity==null || identity.expiresAt()<=System.currentTimeMillis()) return false;
  return recipients.findById(identity.userId()).map(u->Boolean.TRUE.equals(u.getIsActive()) && u.getStatus()!=UserStatus.BANNED).orElse(false);
 }
 @Scheduled(fixedDelay=10000)
 public void closeInvalid() {
  sockets.forEach((id,socket)->{
   boolean authenticated=identities.containsKey(id);
   if((authenticated && !valid(id)) || (!authenticated && System.currentTimeMillis()-openedAt.getOrDefault(id,0L)>15000)) {
    try { socket.close(CloseStatus.POLICY_VIOLATION); } catch(Exception ignored) { /* transport may already be closed */ }
    removed(id);
   }
  });
 }
}
