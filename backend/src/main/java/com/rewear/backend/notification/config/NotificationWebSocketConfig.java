package com.rewear.backend.notification.config;
import com.rewear.backend.notification.security.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.messaging.*;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.config.*;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.WebSocketHandlerDecorator;
import org.springframework.web.socket.config.annotation.*;
@Configuration @EnableWebSocketMessageBroker @EnableScheduling @RequiredArgsConstructor
public class NotificationWebSocketConfig implements WebSocketMessageBrokerConfigurer {
 private final NotificationStompAuthInterceptor authentication;
 private final NotificationSocketSessions sessions;
 @Value("${app.frontend-url}") private String frontendUrl;
 @Override public void registerStompEndpoints(StompEndpointRegistry registry) {
  registry.addEndpoint("/ws/notifications").setAllowedOrigins(frontendUrl,"http://localhost:3000","http://localhost:3001");
 }
 @Override public void configureMessageBroker(MessageBrokerRegistry registry) {
  registry.enableSimpleBroker("/queue");
  registry.setUserDestinationPrefix("/user");
  registry.setApplicationDestinationPrefixes("/app");
  registry.setPreservePublishOrder(true);
 }
 @Override public void configureClientInboundChannel(ChannelRegistration registration) { registration.interceptors(authentication); }
 @Override public void configureClientOutboundChannel(ChannelRegistration registration) {
  registration.interceptors(new ChannelInterceptor() {
   @Override public Message<?> preSend(Message<?> message,MessageChannel channel) {
    if(SimpMessageHeaderAccessor.getMessageType(message.getHeaders())==SimpMessageType.MESSAGE
      && !sessions.valid(SimpMessageHeaderAccessor.getSessionId(message.getHeaders()))) return null;
    return message;
   }
  });
 }
 @Override public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
  registration.setMessageSizeLimit(8192).setSendBufferSizeLimit(65536).setSendTimeLimit(10000);
  registration.addDecoratorFactory(handler->new WebSocketHandlerDecorator(handler) {
   @Override public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    sessions.opened(session); super.afterConnectionEstablished(session);
   }
   @Override public void afterConnectionClosed(WebSocketSession session,CloseStatus status) throws Exception {
    sessions.removed(session.getId()); super.afterConnectionClosed(session,status);
   }
  });
 }
}
