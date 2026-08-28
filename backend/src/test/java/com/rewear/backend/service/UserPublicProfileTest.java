package com.rewear.backend.service;

import com.rewear.backend.user.service.UserService;
import com.rewear.backend.user.repository.UserRepository;
import com.rewear.backend.user.model.User;
import com.rewear.backend.user.mapper.UserMapper;
import com.rewear.backend.listing.repository.ListingRepository;
import com.rewear.backend.storage.SupabaseStorageService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

class UserPublicProfileTest {
 private final UserRepository users=mock(UserRepository.class);
 private final UserService service=new UserService(users,mock(PasswordEncoder.class),new UserMapper(),mock(SupabaseStorageService.class),mock(ListingRepository.class));
 private User seller() {
  var seller=User.builder().id(7L).fullName("Seller").email("private@example.invalid").phone("9800000000")
   .createdAt(LocalDateTime.of(2024,3,12,10,30)).profilePictureUrl("/avatar.png").build();
  when(users.findById(7L)).thenReturn(Optional.of(seller));return seller;
 }
 @Test void publicProfileIncludesRealJoinDateWithoutContactOrAccountFields() {
  var seller=seller();var result=service.getUserById(7L,false);
  assertThat(result.getCreatedAt()).isEqualTo(seller.getCreatedAt());
  assertThat(result.getFullName()).isEqualTo("Seller");
  assertThat(result.getEmail()).isNull();assertThat(result.getPhone()).isNull();assertThat(result.getRole()).isNull();assertThat(result.getIsActive()).isNull();
 }
 @Test void ownerStillReceivesOwnContactDetails() {
  var seller=seller();var result=service.getUserById(7L,true);
  assertThat(result.getEmail()).isEqualTo(seller.getEmail());assertThat(result.getPhone()).isEqualTo(seller.getPhone());
 }
 @Test void missingHistoricalJoinDateIsNotInvented() {
  var seller=seller();seller.setCreatedAt(null);assertThat(service.getUserById(7L,false).getCreatedAt()).isNull();
 }
}
