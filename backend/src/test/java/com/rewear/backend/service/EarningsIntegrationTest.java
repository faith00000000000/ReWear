package com.rewear.backend.service;
import com.rewear.backend.earnings.service.*;
import com.rewear.backend.earnings.repository.EarningsPaymentRepository;
import com.rewear.backend.order.modal.*;
import com.rewear.backend.order.repository.OrderRepository;
import com.rewear.backend.order.service.OrderService;
import com.rewear.backend.order.dto.request.OrderCreateRequest;
import com.rewear.backend.payment.modal.PaymentTransaction;
import com.rewear.backend.payment.enums.*;
import com.rewear.backend.user.model.User;
import com.rewear.backend.user.enums.Role;
import com.rewear.backend.user.repository.UserRepository;
import com.rewear.backend.listing.entity.Listing;
import com.rewear.backend.listing.enums.*;
import com.rewear.backend.listing.repository.ListingRepository;
import com.rewear.backend.security.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.core.userdetails.UserDetailsService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.net.URI;
import java.net.http.*;
import java.util.*;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest(classes=EarningsIntegrationTest.Config.class,webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT,
 properties={"spring.config.location=optional:classpath:earnings-test.properties",
 "spring.datasource.url=jdbc:h2:mem:earnings;MODE=MySQL;DB_CLOSE_DELAY=-1",
 "spring.datasource.driver-class-name=org.h2.Driver","spring.datasource.username=sa","spring.datasource.password=",
 "spring.jpa.hibernate.ddl-auto=create-drop","spring.jpa.open-in-view=false"})
class EarningsIntegrationTest {
 @Configuration @EnableAutoConfiguration
 @ComponentScan("com.rewear.backend.earnings")
 @Import({OrderService.class,com.rewear.backend.exception.GlobalExceptionHandler.class})
 @EntityScan("com.rewear.backend")
 @EnableJpaRepositories({"com.rewear.backend.earnings.repository","com.rewear.backend.order.repository",
 "com.rewear.backend.user.repository","com.rewear.backend.listing.repository"})
 static class Config {
  @Bean JwtService jwt(){return new JwtService("earnings-test-secret-at-least-32-characters",900000,604800000);}
  @Bean UserDetailsService details(UserRepository users) {return email->{var user=users.findByEmail(email).orElseThrow();
   return org.springframework.security.core.userdetails.User.withUsername(email).password("").roles(user.getRole().name()).build();};}
  @Bean SecurityFilterChain security(HttpSecurity http,JwtService jwt,UserDetailsService details) throws Exception {
   // Service must enforce admin ownership even with the application's legacy broad permitAll configuration.
   return http.csrf(c->c.disable()).authorizeHttpRequests(a->a.anyRequest().permitAll())
    .addFilterBefore(new JwtAuthFilter(jwt,details),UsernamePasswordAuthenticationFilter.class).build();
  }
 }
 @Autowired EarningsService service;
 @Autowired EarningsPaymentRepository payments;
 @Autowired OrderRepository orders;
 @Autowired UserRepository users;
 @Autowired ListingRepository listings;
 @Autowired OrderService orderService;
 @Autowired JwtService jwt;
 @Value("${local.server.port}") int port;
 User admin,buyer,seller;
 @BeforeEach void setup() {
  payments.deleteAll(); orders.deleteAll(); listings.deleteAll(); users.deleteAll();
  admin=users.save(User.builder().email("admin@test.invalid").fullName("Admin").role(Role.ADMIN).build());
  buyer=users.save(User.builder().email("buyer@test.invalid").fullName("Buyer").build());
  seller=users.save(User.builder().email("seller@test.invalid").fullName("Seller").build());
 }
 BigDecimal money(String value){return new BigDecimal(value);}
 OrderItem item(String type,String fee,String deposit,String shipping) {
  return OrderItem.builder().listingId(1L).name("Garment").image("/images/garment.jpg").price("Rs. 1000")
   .itemStatus(type).feeAmountNpr(money(fee)).depositAmountNpr(money(deposit)).shippingAmountNpr(money(shipping))
   .commissionRate(money(type.equals("RENT")?"0.20":"0.12")).sellerId(seller.getId()).sellerName("Seller").build();
 }
 Order order(long total,OrderItem... items) {
  var order=Order.builder().buyer(buyer).totalAmountNpr(total).status("CONFIRMED").items(new ArrayList<>(List.of(items))).build();
  for(var item:items)item.setOrder(order);
  return orders.save(order);
 }
 void pay(Order order,PaymentStatus status) {
  payments.save(PaymentTransaction.builder().order(order).referenceId(UUID.randomUUID().toString())
   .paymentGateway(PaymentGateway.KHALTI).paymentStatus(status).amountNpr(order.getTotalAmountNpr())
   .completedAt(LocalDateTime.now()).build());
 }
 @Test void splitsMixedOrderAndExcludesDepositShippingAndFailedPayments() {
  pay(order(6100,item("THRIFT","1000","0","100"),item("RENT","2000","3000","0")),PaymentStatus.SUCCESS);
  pay(order(500,item("THRIFT","500","0","0")),PaymentStatus.FAILED);
  var result=service.dashboard(admin.getEmail(),"all","",0,20);
  assertThat(result.metrics().totalGMV()).isEqualByComparingTo("3000");
  assertThat(result.metrics().totalCommission()).isEqualByComparingTo("520");
  assertThat(result.metrics().sellerShare()).isEqualByComparingTo("2480");
  assertThat(result.metrics().excludedCharges()).isEqualByComparingTo("3100");
  assertThat(result.transactions()).hasSize(2);
  assertThat(service.dashboard(admin.getEmail(),"rent","seller",0,1).totalElements()).isEqualTo(1);
 }
 @Test void duplicateCollectionDoesNotDoubleCommission() {
  var order=order(1000,item("THRIFT","1000","0","0"));pay(order,PaymentStatus.SUCCESS);pay(order,PaymentStatus.SUCCESS);
  var result=service.dashboard(admin.getEmail(),"all","",0,20);
  assertThat(result.metrics().totalCommission()).isEqualByComparingTo("120");
  assertThat(result.metrics().verifiedCollections()).isEqualByComparingTo("2000");
  assertThat(result.reviewCount()).isEqualTo(1);
 }
 @Test void legacyRentalAndNonReconciledPaymentsRequireReview() {
  var legacy=item("RENT","300","1000","0");legacy.setFeeAmountNpr(null);legacy.setPrice("Rs. 100 / day");
  pay(order(1100,legacy),PaymentStatus.SUCCESS);
  pay(order(100,item("THRIFT","1000","0","0")),PaymentStatus.SUCCESS);
  var thrift=item("THRIFT","1000","0","0");thrift.setFeeAmountNpr(null);thrift.setPrice("Rs. 1,000");
  pay(order(1000,thrift),PaymentStatus.SUCCESS);
  var result=service.dashboard(admin.getEmail(),"all","",0,20);
  assertThat(result.reviewCount()).isEqualTo(2);
  assertThat(result.transactions()).hasSize(1);
  assertThat(result.metrics().totalCommission()).isEqualByComparingTo("120");
 }
 @Test void decimalCommissionUsesTwoDecimalHalfUpRounding() {
  var calculator=new EarningsCalculator();
  var amounts=calculator.calculate(item("THRIFT","100.05","0","0"));
  assertThat(amounts.cut()).isEqualByComparingTo("12.01");
  assertThat(amounts.seller()).isEqualByComparingTo("88.04");
 }
 @Test void checkoutSnapshotsServerRentalFeeAndCorrectsClientTotal() {
  var listing=listings.save(Listing.builder().seller(seller).productTitle("Rental")
   .listingMode(ListingMode.RENT).clothingType("Dress").gender("Unisex").size("M").condition("Good")
   .color("Blue").material("Cotton").deliveryOption(DeliveryOption.FLEX).rentPerDay(money("250")).securityDeposit(money("1000")).build());
  var line=new OrderCreateRequest.OrderItemRequest();line.setListingId(listing.getId());line.setName("Untrusted");
  line.setImage("/garment.jpg");line.setPrice("Rs. 1");line.setStatus("RENT");line.setRentalStartIso("2026-08-29");
  line.setRentalEndIso("2026-08-31");line.setRentalDays(2);line.setFulfillment("shipping");line.setDeliveryFee(money("50"));
  var request=new OrderCreateRequest();request.setItems(List.of(line));request.setTotalAmountNpr(1L);
  var result=orderService.createOrder(buyer.getEmail(),request);
  assertThat(result.getTotalAmountNpr()).isEqualTo(1550);
  assertThat(result.getItems().get(0).getPrice()).isEqualTo("Rs. 250.00 / day");
  assertThat(result.getItems().get(0).getName()).isEqualTo("Rental");
 }
 @Test void endpointRejectsAnonymousBuyerAndRefreshTokenButAcceptsAdmin() throws Exception {
  var http=HttpClient.newHttpClient();var url=URI.create("http://localhost:"+port+"/api/admin/earnings");
  assertThat(http.send(HttpRequest.newBuilder(url).GET().build(),HttpResponse.BodyHandlers.ofString()).statusCode()).isEqualTo(401);
  String buyerToken=jwt.generateAccessToken(buyer.getEmail(),Map.of("userId",buyer.getId(),"role","ROLE_USER"));
  String adminToken=jwt.generateAccessToken(admin.getEmail(),Map.of("userId",admin.getId(),"role","ROLE_ADMIN"));
  for(var entry:Map.of(buyerToken,403,jwt.generateRefreshToken(admin.getEmail()),401,adminToken,200).entrySet()) {
   var response=http.send(HttpRequest.newBuilder(url).header("Authorization","Bearer "+entry.getKey()).GET().build(),HttpResponse.BodyHandlers.ofString());
   assertThat(response.statusCode()).isEqualTo(entry.getValue());
  }
 }
}

