package com.rewear.backend.service;

import com.rewear.backend.dto.request.LoginRequestDto;
import com.rewear.backend.dto.request.ResetPasswordRequestDto;
import com.rewear.backend.dto.response.UserResponseDto;
import com.rewear.backend.exception.InvalidCredentialsException;
import com.rewear.backend.mapper.UserMapper;
import com.rewear.backend.model.PasswordResetOtp;
import com.rewear.backend.model.User;
import com.rewear.backend.repository.UserRepository;
import com.rewear.backend.security.AuthService;
import com.rewear.backend.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OtpService otpService;

    @Mock
    private EmailService emailService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserMapper userMapper;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    void resetPasswordUpdatesStoredHashAndAllowsLoginWithNewPasswordOnly() {
        User user = User.builder()
                .id(1L)
                .fullName("Test User")
                .email("test@example.com")
                .password(passwordEncoder.encode("old-password"))
                .isActive(true)
                .build();

        PasswordResetOtp otpRecord = PasswordResetOtp.builder()
                .user(user)
                .otpVerified(true)
                .resetToken("reset-token")
                .resetTokenExpiryDate(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .build();

        when(otpService.findByResetToken("reset-token")).thenReturn(Optional.of(otpRecord));
        when(userRepository.save(user)).thenReturn(user);

        PasswordResetService passwordResetService = new PasswordResetService(
                userRepository,
                otpService,
                emailService,
                passwordEncoder
        );

        ResetPasswordRequestDto resetRequest = new ResetPasswordRequestDto();
        resetRequest.setResetToken("reset-token");
        resetRequest.setNewPassword("new-password");

        passwordResetService.resetPassword(resetRequest);

        assertThat(passwordEncoder.matches("new-password", user.getPassword())).isTrue();
        assertThat(passwordEncoder.matches("old-password", user.getPassword())).isFalse();
        verify(userRepository).save(user);
        verify(otpService).markUsed(otpRecord);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any())).thenAnswer(invocation -> {
            var authentication = invocation.getArgument(0, org.springframework.security.core.Authentication.class);
            String email = authentication.getPrincipal().toString();
            String rawPassword = authentication.getCredentials().toString();
            User currentUser = userRepository.findByEmail(email).orElseThrow();

            if (!passwordEncoder.matches(rawPassword, currentUser.getPassword())) {
                throw new BadCredentialsException("Invalid credentials");
            }

            return authentication;
        });
        when(jwtService.generateAccessToken(any(), any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken("test@example.com")).thenReturn("refresh-token");
        when(jwtService.getTokenExpiryTime("access-token")).thenReturn(3600_000L);
        when(userMapper.toResponseDto(user)).thenReturn(UserResponseDto.builder()
                .id(1L)
                .email("test@example.com")
                .fullName("Test User")
                .isActive(true)
                .build());

        AuthService authService = new AuthService(
                userRepository,
                passwordEncoder,
                jwtService,
                authenticationManager,
                userMapper
        );

        LoginRequestDto oldPasswordLogin = new LoginRequestDto();
        oldPasswordLogin.setEmail("test@example.com");
        oldPasswordLogin.setPassword("old-password");

        assertThatThrownBy(() -> authService.login(oldPasswordLogin))
                .isInstanceOf(InvalidCredentialsException.class);

        LoginRequestDto newPasswordLogin = new LoginRequestDto();
        newPasswordLogin.setEmail("test@example.com");
        newPasswordLogin.setPassword("new-password");

        assertThat(authService.login(newPasswordLogin).getAccessToken()).isEqualTo("access-token");
    }
}
