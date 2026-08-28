package com.rewear.backend.service;
import com.rewear.backend.rental.service.*;
import com.rewear.backend.rental.repository.*;
import com.rewear.backend.wallet.service.WalletService;
import com.rewear.backend.wallet.repository.WithdrawalRepository;
import com.rewear.backend.earnings.service.EarningsService;
import com.rewear.backend.earnings.repository.EarningsPaymentRepository;
import com.rewear.backend.order.modal.*;
import com.rewear.backend.order.repository.OrderRepository;
import com.rewear.backend.payment.modal.PaymentTransaction;
import com.rewear.backend.payment.enums.*;
import com.rewear.backend.user.model.User;
import com.rewear.backend.user.enums.Role;
import com.rewear.backend.user.repository.UserRepository;
import com.rewear.backend.listing.entity.Listing;
import com.rewear.backend.listing.enums.*;
import com.rewear.backend.listing.repository.ListingRepository;
import com.rewear.backend.notification.service.NotificationService;
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
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.*;
import java.net.URI;
import java.net.http.*;
import java.util.*;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest(classes=RentalSettlementIntegrationTest.Config.class,webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT,
 properties={"spring.config.location=optional:classpath:rental-test.properties",
 "spring.datasource.url=jdbc:h2:mem:rentals;MODE=MySQL;DB_CLOSE_DELAY=-1",
 "spring.datasource.driver-class-name=org.h2.Driver","spring.datasource.username=sa","spring.datasource.password=",
 "spring.jpa.hibernate.ddl-auto=create-drop","spring.jpa.open-in-view=false"})
class RentalSettlementIntegrationTest {
 @Configuration @EnableAutoConfiguration
 @ComponentScan({"com.rewear.backend.earnings","com.rewear.backend.rental","com.rewear.backend.wallet"})
 @Import(com.rewear.backend.exception.GlobalExceptionHandler.class)
 @EntityScan("com.rewear.backend")
 @EnableJpaRepositories({"com.rewear.backend.earnings.repository","com.rewear.backend.order.repository",
 "com.rewear.backend.user.repository","com.rewear.backend.listing.repository","com.rewear.backend.rental.repository","com.rewear.backend.wallet.repository"})
 static class Config {
  @Bean NotificationService notifications(){return mock(NotificationService.class);}
  @Bean JwtService jwt(){return new JwtService("rental-test-secret-at-least-32-characters",900000,604800000);}
  @Bean UserDetailsService details(UserRepository users){return email->{var u=users.findByEmail(email).orElseThrow();return org.springframework.security.core.userdetails.User.withUsername(email).password("").roles(u.getRole().name()).build();};}
  @Bean SecurityFilterChain security(HttpSecurity http,JwtService jwt,UserDetailsService details)throws Exception {
   return http.csrf(c->c.disable()).authorizeHttpRequests(a->a.anyRequest().permitAll()).addFilterBefore(new JwtAuthFilter(jwt,details),UsernamePasswordAuthenticationFilter.class).build();
  }
 }
 @Autowired com.rewear.backend.wallet.service.AdminRefundService refunds;
 @Autowired com.rewear.backend.wallet.repository.RefundReceiptRepository receipts;
 @Autowired RentalService rentals; @Autowired WalletService wallet; @Autowired EarningsService earnings;
 @Autowired RentalItemRepository items; @Autowired WithdrawalRepository withdrawals;
 @Autowired EarningsPaymentRepository payments; @Autowired OrderRepository orders;
 @Autowired UserRepository users; @Autowired ListingRepository listings; @Autowired NotificationService notifications;
 @Autowired JwtService jwt; @Value("${local.server.port}") int port;
 User admin,buyer,seller,other;
 @BeforeEach void setup(){receipts.deleteAll();withdrawals.deleteAll();payments.deleteAll();orders.deleteAll();listings.deleteAll();users.deleteAll();reset(notifications);
  admin=users.save(User.builder().email("admin@r.invalid").fullName("Admin").role(Role.ADMIN).build());
  buyer=users.save(User.builder().email("buyer@r.invalid").fullName("Buyer").build());
  seller=users.save(User.builder().email("seller@r.invalid").fullName("Seller").build());
  other=users.save(User.builder().email("other@r.invalid").fullName("Other").build());
 }
 BigDecimal m(String s){return new BigDecimal(s);}
 OrderItem paid(LocalDate start) {
  var l=listings.save(Listing.builder().seller(seller).productTitle("Blue dress").description("Keep this exact description")
   .listingMode(ListingMode.RENT).clothingType("Dress").gender("Unisex").size("M").condition("Good").color("Blue").material("Cotton")
   .deliveryOption(DeliveryOption.FLEX).rentPerDay(m("500")).securityDeposit(m("2000")).availability(Availability.RESERVED)
   .rentedFrom(start).rentedTo(start.plusDays(2)).build());
  var item=OrderItem.builder().listingId(l.getId()).sellerId(seller.getId()).sellerName("Seller").name("Blue dress").image("/dress.jpg")
   .price("Rs. 500 / day").itemStatus("RENT").feeAmountNpr(m("1000")).depositAmountNpr(m("2000")).shippingAmountNpr(m("100"))
   .commissionRate(m("0.20")).rentalStartIso(start.toString()).rentalEndIso(start.plusDays(2).toString()).build();
  var o=Order.builder().buyer(buyer).status("CONFIRMED").totalAmountNpr(3100L).items(new ArrayList<>(List.of(item))).build();item.setOrder(o);orders.save(o);
  payments.save(PaymentTransaction.builder().order(o).referenceId(UUID.randomUUID().toString()).paymentGateway(PaymentGateway.KHALTI).paymentStatus(PaymentStatus.SUCCESS).amountNpr(3100L).completedAt(LocalDateTime.now()).build());
  return item;
 }
 @Test void buyerCancellationChargesSevenPercentAndQueuesFullDepositAndShippingRefund() {
  var i=paid(RentalService.today().plusDays(1));assertThat(rentals.list(buyer.getEmail()).get(0).canCancel()).isTrue();
  var r=rentals.close(buyer.getEmail(),i.getId(),true);
  assertThat(r.state()).isEqualTo("CANCELLED");assertThat(r.cancellationFee()).isEqualByComparingTo("70");assertThat(r.refundDue()).isEqualByComparingTo("3030");
  assertThat(r.refundState()).isEqualTo("PENDING_PROVIDER");assertThat(listings.findById(i.getListingId()).orElseThrow().getAvailability()).isEqualTo(Availability.AVAILABLE);
  assertThat(wallet.wallet(seller.getEmail()).availableBalance()).isEqualByComparingTo("0");
  assertThat(earnings.dashboard(admin.getEmail(),"all","",0,20).metrics().totalCommission()).isEqualByComparingTo("70");
  rentals.close(buyer.getEmail(),i.getId(),true);
  verify(notifications,times(2)).notifyUser(anyLong(),eq("rental:"+i.getId()+":CANCELLED"),any(),anyString(),contains("3030"),eq("/profile/rentals"));
 }
 @Test void returnReleasesSellerShareAndKeepsDepositLiabilityUntilRealRefund() {
  var i=paid(RentalService.today());assertThat(wallet.wallet(seller.getEmail()).pendingRentalEarnings()).isEqualByComparingTo("800");
  var r=rentals.close(seller.getEmail(),i.getId(),false);assertThat(r.refundDue()).isEqualByComparingTo("2000");
  assertThat(wallet.wallet(seller.getEmail()).availableBalance()).isEqualByComparingTo("800");
  assertThat(wallet.settlement(admin.getEmail()).depositsHeld()).isEqualByComparingTo("2000");
  assertThat(wallet.settlement(admin.getEmail()).refundsDue()).isEqualByComparingTo("2000");
  assertThat(listings.findById(i.getListingId()).orElseThrow().getDescription()).isEqualTo("Keep this exact description");
  rentals.close(seller.getEmail(),i.getId(),false);assertThat(wallet.wallet(seller.getEmail()).availableBalance()).isEqualByComparingTo("800");
 }
 @Test void cannotCancelOnStartDateOrConfirmFutureReturnOrActForAnotherUser() {
  var i=paid(RentalService.today());
  assertThatThrownBy(()->rentals.close(buyer.getEmail(),i.getId(),true)).isInstanceOf(ResponseStatusException.class).hasMessageContaining("409");
  assertThatThrownBy(()->rentals.close(buyer.getEmail(),i.getId(),false)).hasMessageContaining("403");
  assertThatThrownBy(()->rentals.close(other.getEmail(),i.getId(),true)).hasMessageContaining("403");
  var future=paid(RentalService.today().plusDays(2));assertThatThrownBy(()->rentals.close(seller.getEmail(),future.getId(),false)).hasMessageContaining("409");
  assertThat(rentals.list(other.getEmail())).isEmpty();
 }
 @Test void incompleteLegacySnapshotBlocksRefundAndEarnings() {
  var i=paid(RentalService.today().plusDays(1));i.setDepositAmountNpr(null);items.save(i);
  assertThat(rentals.list(buyer.getEmail()).get(0).canCancel()).isFalse();
  assertThatThrownBy(()->rentals.close(buyer.getEmail(),i.getId(),true)).hasMessageContaining("409");
  assertThat(wallet.wallet(seller.getEmail()).reviewCount()).isEqualTo(1);
 }
 @Test void withdrawalReservesBalanceIsIdempotentAndCancelableButNeverFakesPayout() {
  var i=paid(RentalService.today());rentals.close(seller.getEmail(),i.getId(),false);
  var request=new WalletService.Request(m("500"),"ESEWA","9800000000",UUID.randomUUID().toString());
  var w=wallet.request(seller.getEmail(),request);assertThat(wallet.request(seller.getEmail(),request).id()).isEqualTo(w.id());
  assertThat(w.status()).isEqualTo("PENDING_PROVIDER_SETUP");assertThat(wallet.wallet(seller.getEmail()).availableBalance()).isEqualByComparingTo("300");
  assertThat(wallet.wallet(seller.getEmail()).withdrawn()).isEqualByComparingTo("0");
  assertThatThrownBy(()->wallet.cancel(other.getEmail(),w.id())).hasMessageContaining("403");
  assertThatThrownBy(()->wallet.request(seller.getEmail(),new WalletService.Request(m("301"),"KHALTI","9800000000",UUID.randomUUID().toString()))).hasMessageContaining("409");
  wallet.cancel(seller.getEmail(),w.id());wallet.cancel(seller.getEmail(),w.id());assertThat(wallet.wallet(seller.getEmail()).availableBalance()).isEqualByComparingTo("800");
 }
 @Test void concurrentWithdrawalCannotOverspend() throws Exception {
  var i=paid(RentalService.today());rentals.close(seller.getEmail(),i.getId(),false);
  var pool=Executors.newFixedThreadPool(2);var gate=new CountDownLatch(1);
  try { var tasks=new ArrayList<Future<Boolean>>();for(int n=0;n<2;n++)tasks.add(pool.submit(()->{gate.await();try{wallet.request(seller.getEmail(),new WalletService.Request(m("600"),"KHALTI","9800000000",UUID.randomUUID().toString()));return true;}catch(ResponseStatusException e){return false;}}));
   gate.countDown();int success=0;for(var f:tasks)if(f.get(15,TimeUnit.SECONDS))success++;assertThat(success).isEqualTo(1);assertThat(wallet.wallet(seller.getEmail()).availableBalance()).isEqualByComparingTo("200");
  } finally {pool.shutdownNow();}
 }
 @Test void simultaneousCancellationCreatesOnlyOneRefundAndNotificationSet() throws Exception {
  var i=paid(RentalService.today().plusDays(1));var pool=Executors.newFixedThreadPool(2);var gate=new CountDownLatch(1);
  try {
   var a=pool.submit(()->{gate.await();return rentals.close(buyer.getEmail(),i.getId(),true);});
   var b=pool.submit(()->{gate.await();return rentals.close(buyer.getEmail(),i.getId(),true);});gate.countDown();
   assertThat(a.get(15,TimeUnit.SECONDS).refundDue()).isEqualByComparingTo("3030");
   assertThat(b.get(15,TimeUnit.SECONDS).refundDue()).isEqualByComparingTo("3030");
   verify(notifications,times(2)).notifyUser(anyLong(),eq("rental:"+i.getId()+":CANCELLED"),any(),anyString(),anyString(),anyString());
   assertThat(wallet.settlement(admin.getEmail()).refundsDue()).isEqualByComparingTo("3030");
  } finally {pool.shutdownNow();}
 }
 @Test void thriftEarnsEightyEightPercentAndInactiveAccountsCannotWithdraw() {
  var i=paid(RentalService.today());i.setRentalStartIso(null);i.setRentalEndIso(null);i.setItemStatus("THRIFT");i.setCommissionRate(m("0.12"));items.save(i);
  assertThat(wallet.wallet(seller.getEmail()).availableBalance()).isEqualByComparingTo("880");
  seller.setIsActive(false);users.save(seller);
  assertThatThrownBy(()->wallet.request(seller.getEmail(),new WalletService.Request(m("100"),"ESEWA","9800000000",UUID.randomUUID().toString()))).hasMessageContaining("403");
 }
 @Test void legacyRentalIsVisibleToListingOwnerAndReturnDoesNotInventMoney() {
  var i=paid(RentalService.today());i.setSellerId(null);i.setSellerName(null);i.setFeeAmountNpr(null);i.setDepositAmountNpr(null);items.save(i);
  var row=rentals.list(seller.getEmail()).get(0);
  assertThat(row.sellerSide()).isTrue();assertThat(row.sellerName()).isEqualTo("Seller");assertThat(row.canReturn()).isTrue();
  assertThat(rentals.list(other.getEmail())).isEmpty();
  assertThatThrownBy(()->rentals.close(other.getEmail(),i.getId(),false)).hasMessageContaining("403");
  var returned=rentals.close(seller.getEmail(),i.getId(),false);
  assertThat(returned.state()).isEqualTo("RETURNED");assertThat(returned.refundDue()).isNull();assertThat(returned.refundState()).isEqualTo("REQUIRES_REVIEW");
  assertThat(listings.findById(i.getListingId()).orElseThrow().getAvailability()).isEqualTo(Availability.AVAILABLE);
  assertThat(wallet.wallet(seller.getEmail()).availableBalance()).isEqualByComparingTo("0");
 }
 @Test void recordedSellerTakesPrecedenceOverFallbackListingOwner() {
  var i=paid(RentalService.today());i.setSellerId(other.getId());items.save(i);
  assertThat(rentals.list(seller.getEmail())).isEmpty();assertThat(rentals.list(other.getEmail())).hasSize(1);
 }
 @Test void adminRecordsRefundOnceReleasesDepositAndNotifiesBuyer() {
  var i=paid(RentalService.today());rentals.close(seller.getEmail(),i.getId(),false);reset(notifications);
  var request=new com.rewear.backend.wallet.service.AdminRefundService.Confirmation("REFUND-123456",m("2000"),true);
  assertThatThrownBy(()->refunds.confirm(seller.getEmail(),i.getId(),request)).hasMessageContaining("403");
  assertThatThrownBy(()->refunds.confirm(admin.getEmail(),i.getId(),new com.rewear.backend.wallet.service.AdminRefundService.Confirmation("REFUND-123456",m("1900"),true))).hasMessageContaining("409");
  assertThatThrownBy(()->refunds.confirm(admin.getEmail(),i.getId(),new com.rewear.backend.wallet.service.AdminRefundService.Confirmation("REFUND-123456",m("2000"),false))).hasMessageContaining("400");
  refunds.confirm(admin.getEmail(),i.getId(),request);refunds.confirm(admin.getEmail(),i.getId(),request);
  assertThat(wallet.settlement(admin.getEmail()).depositsHeld()).isEqualByComparingTo("0");
  assertThat(wallet.settlement(admin.getEmail()).refundsDue()).isEqualByComparingTo("0");
  assertThat(wallet.wallet(seller.getEmail()).availableBalance()).isEqualByComparingTo("800");
  assertThat(rentals.list(buyer.getEmail()).get(0).refundState()).isEqualTo("REFUNDED_MANUALLY");
  assertThat(receipts.findByItemId(i.getId()).orElseThrow().getAdminId()).isEqualTo(admin.getId());
  verify(notifications,times(1)).notifyUser(eq(buyer.getId()),eq("refund-confirmed:"+i.getId()),any(),anyString(),contains("2000"),eq("/profile/rentals"));
 }
 @Test void refundCannotBeRecordedBeforeReturnOrReuseProviderReference() {
  var first=paid(RentalService.today());var second=paid(RentalService.today());
  var request=new com.rewear.backend.wallet.service.AdminRefundService.Confirmation("REFUND-654321",m("2000"),true);
  assertThatThrownBy(()->refunds.confirm(admin.getEmail(),first.getId(),request)).hasMessageContaining("409");
  rentals.close(seller.getEmail(),first.getId(),false);rentals.close(seller.getEmail(),second.getId(),false);
  refunds.confirm(admin.getEmail(),first.getId(),request);
  assertThatThrownBy(()->refunds.confirm(admin.getEmail(),second.getId(),request)).hasMessageContaining("409");
 }
 @Test void anotherReservationPreventsRelisting() {
  var first=paid(RentalService.today());var second=paid(RentalService.today());second.setListingId(first.getListingId());items.save(second);
  rentals.close(seller.getEmail(),first.getId(),false);assertThat(listings.findById(first.getListingId()).orElseThrow().getAvailability()).isEqualTo(Availability.RESERVED);
 }
 @Test void httpRejectsAnonymousRefreshTokensNonAdminAndInvalidWithdrawal() throws Exception {
  var client=HttpClient.newHttpClient();String base="http://localhost:"+port;
  assertThat(client.send(HttpRequest.newBuilder(URI.create(base+"/api/rentals")).GET().build(),HttpResponse.BodyHandlers.ofString()).statusCode()).isEqualTo(401);
  var refresh=jwt.generateRefreshToken(buyer.getEmail());
  assertThat(client.send(HttpRequest.newBuilder(URI.create(base+"/api/seller/earnings")).header("Authorization","Bearer "+refresh).GET().build(),HttpResponse.BodyHandlers.ofString()).statusCode()).isEqualTo(401);
  var token=jwt.generateAccessToken(buyer.getEmail(),Map.of("userId",buyer.getId(),"role","ROLE_USER"));
  assertThat(client.send(HttpRequest.newBuilder(URI.create(base+"/api/admin/earnings/settlement")).header("Authorization","Bearer "+token).GET().build(),HttpResponse.BodyHandlers.ofString()).statusCode()).isEqualTo(403);
  assertThat(client.send(HttpRequest.newBuilder(URI.create(base+"/api/seller/earnings/withdrawals")).header("Authorization","Bearer "+token).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString("{}" )).build(),HttpResponse.BodyHandlers.ofString()).statusCode()).isEqualTo(400);
 }
}
