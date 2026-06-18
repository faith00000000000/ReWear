// src/main/java/com/rewear/backend/service/PasswordResetService.java

package com.rewear.backend.service;

import com.rewear.backend.dto.request.ChangePasswordRequestDto;
import com.rewear.backend.dto.request.ForgotPasswordRequestDto;
import com.rewear.backend.dto.request.ResetPasswordRequestDto;
import com.rewear.backend.dto.request.VerifyOtpRequestDto;
import com.rewear.backend.dto.response.OtpVerifyResponseDto;
import com.rewear.backend.exception.ResourceNotFoundException;
import com.rewear.backend.model.PasswordResetOtp;
import com.rewear.backend.model.User;
import com.rewear.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    // ── 1. Initiate: Send OTP ─────────────────────────────────────────────────

    @Transactional
    public void sendOtp(ForgotPasswordRequestDto requestDto) {
        String email = requestDto.getEmail().trim().toLowerCase();
        log.info("OTP request for email: {}", email);

        Optional<User> userOpt = userRepository.findByEmail(email);

        // SECURITY: Do not reveal whether email exists or not
        if (userOpt.isEmpty()) {
            log.warn("OTP requested for non-existent email: {}", email);
            return;
        }

        User user = userOpt.get();

        // Guard: Block OTP for OAuth-only users (they have no password)
        if (user.getOauthProvider() != null && user.getPassword().isBlank()) {
            log.warn("OTP requested for OAuth user: {}", email);
            return;
        }

        PasswordResetOtp otpRecord = otpService.createOtp(user);

        emailService.sendOtpEmail(user.getEmail(), user.getFullName(), otpRecord.getOtpCode());

        log.info("OTP generated and email dispatched for user: {}", user.getId());
    }

    // ── 2. Verify OTP — Returns Reset Token ───────────────────────────────────

    @Transactional
    public OtpVerifyResponseDto verifyOtp(VerifyOtpRequestDto requestDto) {
        String email = requestDto.getEmail().trim().toLowerCase();
        String submittedOtp = requestDto.getOtpCode().trim();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("OTP verification failed — user not found: {}", email);
                    return new ResourceNotFoundException("Invalid OTP or email");
                });

        PasswordResetOtp otpRecord = otpService.getActiveOtp(user)
                .orElseThrow(() -> {
                    log.warn("No active OTP found for user: {}", user.getId());
                    return new ResourceNotFoundException("OTP not found or already used");
                });

        otpService.validateOtp(otpRecord, submittedOtp);

        String resetToken = otpService.issueResetToken(otpRecord);

        log.info("OTP verified successfully for user: {}. Reset token issued.", user.getId());

        return OtpVerifyResponseDto.builder()
                .resetToken(resetToken)
                .expiresIn(otpService.getResetTokenExpirySeconds())
                .message("OTP verified successfully. Use the reset token to set your new password.")
                .build();
    }

    // ── 3. Reset Password (unauthenticated — uses reset token) ───────────────

    @Transactional
    public void resetPassword(ResetPasswordRequestDto requestDto) {
        String resetToken = requestDto.getResetToken().trim();

        PasswordResetOtp otpRecord = otpService.findByResetToken(resetToken)
                .orElseThrow(() -> {
                    log.warn("Reset password failed — invalid reset token");
                    return new ResourceNotFoundException("Invalid or expired reset token");
                });

        if (!otpRecord.getOtpVerified()) {
            log.warn("Reset attempted without OTP verification. User: {}", otpRecord.getUser().getId());
            throw new IllegalStateException("OTP must be verified before resetting password");
        }

        if (otpRecord.isResetTokenExpired()) {
            log.warn("Expired reset token for user: {}", otpRecord.getUser().getId());
            throw new IllegalStateException("Reset token has expired. Please start over.");
        }

        User user = otpRecord.getUser();

        if (passwordEncoder.matches(requestDto.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException(
                    "New password must be different from your current password."
            );
        }

        user.setPassword(passwordEncoder.encode(requestDto.getNewPassword()));
        userRepository.save(user);

        otpService.markUsed(otpRecord);

        emailService.sendPasswordChangedConfirmationEmail(user.getEmail(), user.getFullName());

        log.info("Password reset successfully for user: {}", user.getId());
    }

    // ── 4. Change Password (authenticated user) ───────────────────────────────

    @Transactional
    public void changePassword(String authenticatedEmail, ChangePasswordRequestDto requestDto) {
        log.info("Change password request for user: {}", authenticatedEmail);

        if (!requestDto.getNewPassword().equals(requestDto.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match.");
        }

        User user = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> {
                    log.warn("Change password failed — user not found: {}", authenticatedEmail);
                    return new ResourceNotFoundException("User not found");
                });

        if (user.getOauthProvider() != null && user.getPassword().isBlank()) {
            throw new IllegalStateException(
                    "OAuth users cannot change password. Please use your OAuth provider."
            );
        }

        if (!passwordEncoder.matches(requestDto.getCurrentPassword(), user.getPassword())) {
            log.warn("Change password failed — wrong current password for user: {}", user.getId());
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        if (passwordEncoder.matches(requestDto.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException(
                    "New password must be different from your current password."
            );
        }

        user.setPassword(passwordEncoder.encode(requestDto.getNewPassword()));
        userRepository.save(user);

        emailService.sendPasswordChangedConfirmationEmail(user.getEmail(), user.getFullName());

        log.info("Password changed successfully for user: {}", user.getId());
    }
}