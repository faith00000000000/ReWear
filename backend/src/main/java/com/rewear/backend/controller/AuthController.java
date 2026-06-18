package com.rewear.backend.controller;

import com.rewear.backend.dto.request.LoginRequestDto;
import com.rewear.backend.dto.request.RefreshTokenRequestDto;
import com.rewear.backend.dto.request.UserRequestDto;
import com.rewear.backend.dto.response.AuthResponseDto;
import com.rewear.backend.security.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user account with email and password
     * 
     * @param requestDto contains email, password, and fullName
     * @return AuthResponseDto with tokens and user info
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDto> signup(@Valid @RequestBody UserRequestDto requestDto) {
        log.info("Signup request for email: {}", requestDto.getEmail());
        AuthResponseDto response = authService.signup(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Authenticate user with email and password
     * 
     * @param requestDto contains email and password
     * @return AuthResponseDto with tokens and user info
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto requestDto) {
        log.info("Login request for email: {}", requestDto.getEmail());
        AuthResponseDto response = authService.login(requestDto);
        return ResponseEntity.ok(response);
    }

    /**
     * Refresh the access token using a valid refresh token
     * 
     * @param requestDto contains refreshToken
     * @return AuthResponseDto with new tokens
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDto> refresh(@Valid @RequestBody RefreshTokenRequestDto requestDto) {
        log.info("Token refresh request");
        AuthResponseDto response = authService.refreshToken(requestDto.getRefreshToken());
        return ResponseEntity.ok(response);
    }
}