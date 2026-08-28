package com.rewear.backend.service;

import com.rewear.backend.notification.config.NotificationWebSocketConfig;
import com.rewear.backend.notification.dto.response.NotificationPageResponse;
import com.rewear.backend.notification.enums.NotificationType;
import com.rewear.backend.notification.repository.NotificationRecipientRepository;
import com.rewear.backend.notification.service.NotificationService;
import com.rewear.backend.notification.service.NotificationOutboxDispatcher;
import com.rewear.backend.notification.security.NotificationStompAuthInterceptor;
import com.rewear.backend.security.JwtService;
import com.rewear.backend.security.JwtAuthFilter;
import com.rewear.backend.user.model.User;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.messaging.*;
import org.springframework.messaging.converter.StringMessageConverter;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import java.lang.reflect.Type;
import java.net.URI;
import java.net.http.*;
import java.util.*;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.*;
import static org.awaitility.Awaitility.await;
import static java.util.concurrent.TimeUnit.SECONDS;

@SpringBootTest(classes=NotificationIntegrationTest.Config.class,webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT,
 properties={"spring.config.location=optional:classpath:notification-test.properties",
 "spring.datasource.url=jdbc:h2:mem:notifications;MODE=MySQL;DB_CLOSE_DELAY=-1",
 "spring.datasource.driver-class-name=org.h2.Driver","spring.datasource.username=sa","spring.datasource.password=",
 "spring.jpa.hibernate.ddl-auto=create-drop","app.frontend-url=http://localhost:3000",
 "app.notifications.dispatch-delay-ms=60000"})
class NotificationIntegrationTest {
 @Configuration @EnableAutoConfiguration
 @Import(com.rewear.backend.exception.GlobalExceptionHandler.class)
 @ComponentScan("com.rewear.backend.notification")
 @EntityScan({"com.rewear.backend.notification.model","com.rewear.backend.user.model"})
 @EnableJpaRepositories("com.rewear.backend.notification.repository")
 static class Config {
  @Bean JwtService jwt(){return new JwtService("notification-test-secret-at-least-32-characters",900000,604800000);}
  @Bean UserDetailsService userDetails(NotificationRecipientRepository users) {
   return email -> {var u=users.findByEmail(email).orElseThrow();
    return org.springframework.security.core.userdetails.User.withUsername(email).password(u.getPassword()).roles(u.getRole().name()).build();};
  }
  @Bean SecurityFilterChain security(HttpSecurity http,JwtService jwt,UserDetailsService users) throws Exception {
   return http.csrf(c->c.disable()).authorizeHttpRequests(a->a.requestMatchers("/ws/notifications").permitAll().anyRequest().authenticated())
    .exceptionHandling(e->e.authenticationEntryPoint((request,response,error)->response.sendError(401)))
    .addFilterBefore(new JwtAuthFilter(jwt,users),UsernamePasswordAuthenticationFilter.class).build();
  }
 }
 @Autowired NotificationService service;
 @Autowired NotificationRecipientRepository users;
 @Autowired NotificationOutboxDispatcher dispatcher;
 @Autowired NotificationStompAuthInterceptor interceptor;
 @Autowired SimpUserRegistry registry;
 @Autowired JwtService jwt;
 @Autowired PlatformTransactionManager transactions;
 @Value("${local.server.port}") int port;
 User buyer;
 @BeforeEach void user(){buyer=users.save(User.builder().email(UUID.randomUUID()+"@test.invalid").fullName("Test Buyer").build());}
 void publish(String key){service.notifyUser(buyer.getId(),key,NotificationType.PAYMENT,"Paid","Your order is paid","/profile/order-history");}
 String token(User u){return jwt.generateAccessToken(u.getEmail(),Map.of("userId",u.getId(),"role","ROLE_USER"));}

 @Test void persistsDeduplicatesAndPreservesNewNotificationsAcrossMarkAll() {
  publish("first"); publish("first");
  NotificationPageResponse first=service.inbox(buyer.getEmail(),null,20,false);
  assertThat(first.items()).hasSize(1);
  publish("later");
  var result=service.markAllRead(buyer.getEmail(),first.state().watermark());
  assertThat(result.unreadCount()).isEqualTo(1);
  assertThat(service.inbox(buyer.getEmail(),null,20,true).items()).extracting(n->n.sequence()).containsExactly(2L);
  assertThat(service.markAllRead(buyer.getEmail(),result.watermark()).unreadCount()).isZero();
  long revision=service.unread(buyer.getEmail()).revision();
  assertThat(service.markAllRead(buyer.getEmail(),result.watermark()).revision()).isEqualTo(revision);
 }

 @Test void ownershipPaginationAndRollback() {
  publish("one"); publish("two"); publish("three");
  var first=service.inbox(buyer.getEmail(),null,2,false);
  assertThat(first.items()).hasSize(2);
  assertThat(service.inbox(buyer.getEmail(),first.nextCursor(),2,false).items()).hasSize(1);
  User stranger=users.save(User.builder().email(UUID.randomUUID()+"@test.invalid").fullName("Other").build());
  assertThatThrownBy(()->service.markRead(stranger.getEmail(),first.items().get(0).id())).hasMessageContaining("404");
  assertThatThrownBy(()->new TransactionTemplate(transactions).execute(status->{publish("rollback"); throw new IllegalStateException("rollback");})).isInstanceOf(IllegalStateException.class);
  assertThat(service.unread(buyer.getEmail()).unreadCount()).isEqualTo(3);
 }

 @Test void restRequiresAccessTokenAndScopesInbox() throws Exception {
  var http=HttpClient.newHttpClient();
  String url="http://localhost:"+port+"/api/notifications/unread-count";
  assertThat(http.send(HttpRequest.newBuilder(URI.create(url)).GET().build(),HttpResponse.BodyHandlers.ofString()).statusCode()).isEqualTo(401);
  assertThat(http.send(HttpRequest.newBuilder(URI.create(url)).header("Authorization","Bearer "+jwt.generateRefreshToken(buyer.getEmail())).GET().build(),HttpResponse.BodyHandlers.ofString()).statusCode()).isEqualTo(401);
  publish("http");
  var response=http.send(HttpRequest.newBuilder(URI.create(url)).header("Authorization","Bearer "+token(buyer)).GET().build(),HttpResponse.BodyHandlers.ofString());
  assertThat(response.statusCode()).isEqualTo(200);
  assertThat(response.body()).contains("\"unreadCount\":1");
  User stranger=users.save(User.builder().email(UUID.randomUUID()+"@test.invalid").fullName("Other").build());
  long id=service.inbox(buyer.getEmail(),null,20,false).items().get(0).id();
  var foreign=http.send(HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/api/notifications/"+id+"/read"))
    .header("Authorization","Bearer "+token(stranger)).method("PATCH",HttpRequest.BodyPublishers.noBody()).build(),HttpResponse.BodyHandlers.ofString());
  assertThat(foreign.statusCode()).isEqualTo(404);

 }

 @Test void rejectsForeignSubscriptionsAndClientPublication() {
  StompHeaderAccessor connect=StompHeaderAccessor.create(StompCommand.CONNECT);
  connect.setSessionId("test-security"); connect.setLeaveMutable(true);
  connect.setNativeHeader("Authorization","Bearer "+token(buyer));
  interceptor.preSend(MessageBuilder.createMessage(new byte[0],connect.getMessageHeaders()),null);
  for(String destination:List.of("/topic/notifications","/user/someone/queue/notifications","/queue/notifications")) {
   StompHeaderAccessor subscribe=StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
   subscribe.setSessionId("test-security"); subscribe.setDestination(destination);
   assertThatThrownBy(()->interceptor.preSend(MessageBuilder.createMessage(new byte[0],subscribe.getMessageHeaders()),null)).isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
  }
  StompHeaderAccessor send=StompHeaderAccessor.create(StompCommand.SEND);
  send.setSessionId("test-security"); send.setDestination("/app/notifications");
  assertThatThrownBy(()->interceptor.preSend(MessageBuilder.createMessage(new byte[0],send.getMessageHeaders()),null)).isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
 }

 @Test void concurrentCreationKeepsCountAndRevisionsConsistent() throws Exception {
  var pool=Executors.newFixedThreadPool(4);
  try {
   var futures=new ArrayList<Future<?>>();
   for(int i=0;i<12;i++) { final int index=i; futures.add(pool.submit(()->publish("concurrent-"+index))); }
   for(var future:futures) future.get(10,SECONDS);
   var page=service.inbox(buyer.getEmail(),null,20,false);
   assertThat(page.items()).hasSize(12);
   assertThat(page.state().unreadCount()).isEqualTo(12);
   assertThat(page.state().revision()).isEqualTo(12);
  } finally { pool.shutdownNow(); }
 }

 @Test void websocketBroadcastsUnreadAndReadAllToBothSessionsButNotOtherUser() throws Exception {
  WebSocketStompClient client=new WebSocketStompClient(new StandardWebSocketClient());
  client.setMessageConverter(new StringMessageConverter());
  BlockingQueue<String> first=new LinkedBlockingQueue<>(), second=new LinkedBlockingQueue<>(), other=new LinkedBlockingQueue<>();
  User stranger=users.save(User.builder().email(UUID.randomUUID()+"@test.invalid").fullName("Other").build());
  List<StompSession> sessions=new ArrayList<>();
  try {
   sessions.add(connect(client,buyer,first)); sessions.add(connect(client,buyer,second)); sessions.add(connect(client,stranger,other));
   await().atMost(5,SECONDS).until(()->registry.getUser(buyer.getEmail())!=null
     && registry.getUser(buyer.getEmail()).getSessions().stream().filter(s->!s.getSubscriptions().isEmpty()).count()==2);
   publish("socket");
   dispatcher.dispatch();
   assertThat(first.poll(5,SECONDS)).contains("\"unreadCount\":1");
   assertThat(second.poll(5,SECONDS)).contains("\"unreadCount\":1");
   var state=service.unread(buyer.getEmail());
   service.markAllRead(buyer.getEmail(),state.watermark());
   dispatcher.dispatch();
   assertThat(first.poll(5,SECONDS)).contains("\"unreadCount\":0");
   assertThat(second.poll(5,SECONDS)).contains("\"unreadCount\":0");
   assertThat(other.poll(200,TimeUnit.MILLISECONDS)).isNull();
  } finally {for(var session:sessions) if(session.isConnected()) session.disconnect(); client.stop();}
 }
 StompSession connect(WebSocketStompClient client,User u,BlockingQueue<String> queue) throws Exception {
  StompHeaders headers=new StompHeaders(); headers.add("Authorization","Bearer "+token(u));
  var session=client.connectAsync("ws://localhost:"+port+"/ws/notifications",new org.springframework.web.socket.WebSocketHttpHeaders(),headers,new StompSessionHandlerAdapter(){}).get(5,SECONDS);
  session.subscribe("/user/queue/notifications",new StompFrameHandler(){
   public Type getPayloadType(StompHeaders headers){return String.class;}
   public void handleFrame(StompHeaders headers,Object payload){queue.add((String)payload);}
  });
  return session;
 }
}

