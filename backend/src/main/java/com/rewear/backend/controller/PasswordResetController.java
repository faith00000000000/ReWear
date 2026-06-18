// src/main/java/com/rewear/backend/controller/PasswordResetController.java

package com.rewear.backend.controller;

import com.rewear.backend.dto.request.ChangePasswordRequestDto;
import com.rewear.backend.dto.request.ForgotPasswordRequestDto;
import com.rewear.backend.dto.request.ResetPasswordRequestDto;
import com.rewear.backend.dto.request.VerifyOtpRequestDto;
import com.rewear.backend.dto.response.OtpVerifyResponseDto;
import com.rewear.backend.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    /**
     * Step 1 — Request OTP
     * POST /api/auth/forgot-password
     * Body: { "email": "user@example.com" }
     * Always returns 200 to prevent email enumeration
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDto requestDto) {

        log.info("Forgot password request for email: {}", requestDto.getEmail());
        passwordResetService.sendOtp(requestDto);

        return ResponseEntity.ok(Map.of(
                "message", "If this email is registered, an OTP has been sent."
        ));
    }

    /**
     * Step 2 — Verify OTP
     * POST /api/auth/verify-otp
     * Body: { "email": "user@example.com", "otpCode": "482910" }
     * Returns: { resetToken, expiresIn, message }
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<OtpVerifyResponseDto> verifyOtp(
            @Valid @RequestBody VerifyOtpRequestDto requestDto) {

        log.info("OTP verification request for email: {}", requestDto.getEmail());
        OtpVerifyResponseDto response = passwordResetService.verifyOtp(requestDto);
        return ResponseEntity.ok(response);
    }

    /**
     * Step 3 — Reset Password (unauthenticated)
     * POST /api/auth/reset-password
     * Body: { "resetToken": "uuid-here", "newPassword": "newPass123" }
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequestDto requestDto) {

        log.info("Reset password request with token");
        passwordResetService.resetPassword(requestDto);

        return ResponseEntity.ok(Map.of(
                "message", "Password has been reset successfully. Please log in."
        ));
    }

    /**
     * Step 4 — Change Password (authenticated users only)
     * POST /api/auth/change-password
     * Header: Authorization: Bearer <accessToken>
     * Body: { "currentPassword": "old", "newPassword": "new", "confirmPassword": "new" }
     */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequestDto requestDto) {

        log.info("Change password request for authenticated user: {}", userDetails.getUsername());
        passwordResetService.changePassword(userDetails.getUsername(), requestDto);

        return ResponseEntity.ok(Map.of(
                "message", "Password changed successfully."
        ));
    }
}

