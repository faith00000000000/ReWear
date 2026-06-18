package com.rewear.backend.security;

import com.rewear.backend.dto.request.LoginRequestDto;
import com.rewear.backend.dto.request.UserRequestDto;
import com.rewear.backend.dto.response.AuthResponseDto;
import com.rewear.backend.exception.InvalidCredentialsException;
import com.rewear.backend.exception.InvalidTokenException;
import com.rewear.backend.exception.ResourceAlreadyExistsException;
import com.rewear.backend.exception.ResourceNotFoundException;
import com.rewear.backend.mapper.UserMapper;
import com.rewear.backend.model.User;
import com.rewear.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    @Value("${app.jwt.access-token-expiry}")
    private long accessTokenExpiryMs;
    @Transactional
    public AuthResponseDto signup(UserRequestDto requestDto) {
        log.info("Processing signup for email: {}", requestDto.getEmail());
        
        String normalizedEmail = normalizeEmail(requestDto.getEmail());

        if (userRepository.existsByEmail(normalizedEmail)) {
            log.warn("Signup attempt with already registered email: {}", normalizedEmail);
            throw new ResourceAlreadyExistsException("Email is already registered with an account");
        }

        try {
            User user = User.builder()
                    .fullName(requestDto.getFullName().trim())
                    .email(normalizedEmail)
                    .password(passwordEncoder.encode(requestDto.getPassword()))
                    .isActive(true)
                    .oauthProvider(null)
                    .build();

            User savedUser = userRepository.save(user);
            log.info("User successfully registered with email: {}", normalizedEmail);
            return buildAuthResponse(savedUser);
        } catch (Exception e) {
            log.error("Error during signup for email: {}", normalizedEmail, e);
            throw new RuntimeException("Failed to create user account", e);
        }
    }

    @Transactional(readOnly = true)
    public AuthResponseDto login(LoginRequestDto requestDto) {
        log.info("Processing login for email: {}", requestDto.getEmail());
        
        String normalizedEmail = normalizeEmail(requestDto.getEmail());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            normalizedEmail,
                            requestDto.getPassword()
                    )
            );
            log.debug("Authentication successful for email: {}", normalizedEmail);
        } catch (BadCredentialsException e) {
            log.warn("Login failed: invalid credentials for email: {}", normalizedEmail);
            throw new InvalidCredentialsException("Invalid email or password");
        } catch (Exception e) {
            log.error("Authentication error for email: {}", normalizedEmail, e);
            throw new InvalidCredentialsException("Authentication failed", e);
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> {
                    log.error("User not found after authentication for email: {}", normalizedEmail);
                    return new ResourceNotFoundException("User account not found");
                });

        if (!user.getIsActive()) {
            log.warn("Login attempt with deactivated account: {}", normalizedEmail);
            throw new InvalidCredentialsException("Your account has been deactivated");
        }

        log.info("Login successful for email: {}", normalizedEmail);
        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponseDto refreshToken(String refreshToken) {
        log.info("Processing token refresh");
        
        if (refreshToken == null || refreshToken.isBlank()) {
            log.warn("Refresh token is missing");
            throw new InvalidTokenException("Refresh token is required");
        }

        try {
            String email = jwtService.extractEmail(refreshToken);

            if (!jwtService.isTokenValid(refreshToken, email)) {
                log.warn("Refresh token validation failed for email: {}", email);
                throw new InvalidTokenException("Invalid or expired refresh token");
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        log.error("User not found for email: {}", email);
                        return new ResourceNotFoundException("User account not found");
                    });

            if (!user.getIsActive()) {
                log.warn("Token refresh attempt with deactivated account: {}", email);
                throw new InvalidTokenException("User account has been deactivated");
            }

            log.info("Token successfully refreshed for email: {}", email);
            return buildAuthResponse(user);
        } catch (InvalidTokenException e) {
            throw e;
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error refreshing token", e);
            throw new InvalidTokenException("Failed to refresh token", e);
        }
    }

    private AuthResponseDto buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(
                user.getEmail(),
                Map.of("userId", user.getId())
        );
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());
        long expiresIn = jwtService.getTokenExpiryTime(accessToken);

        return AuthResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toResponseDto(user))
                .expiresIn(expiresIn / 1000) // Convert to seconds
                .build();
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}