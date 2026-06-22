// src/main/java/com/rewear/backend/service/OtpService.java

package com.rewear.backend.user.service;

import com.rewear.backend.user.model.PasswordResetOtp;
import com.rewear.backend.user.model.User;
import com.rewear.backend.user.repository.PasswordResetOtpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Generic OTP generation, validation, and reset-token issuance.
 * Reusable across password reset, email verification, 2FA, etc.
 * Currently backed by PasswordResetOtpRepository — if you add OTP
 * for other purposes (e.g. signup email verification), consider
 * adding a "purpose" field to the entity to distinguish flows.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final PasswordResetOtpRepository otpRepository;

    @Value("${app.otp.expiry-minutes:10}")
    private int otpExpiryMinutes;

    @Value("${app.otp.reset-token-expiry-minutes:15}")
    private int resetTokenExpiryMinutes;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * Generates a cryptographically secure 6-digit OTP.
     */
    public String generateOtpCode() {
        int otp = 100000 + SECURE_RANDOM.nextInt(900000); // range: 100000–999999
        return String.valueOf(otp);
    }

    /**
     * Creates and persists a new OTP record for the given user,
     * deleting any previous unused OTP records first.
     *
     * @return the generated OTP record (with plain otpCode set)
     */
    @Transactional
    public PasswordResetOtp createOtp(User user) {
        otpRepository.deleteAllByUser(user);

        String otpCode = generateOtpCode();
        LocalDateTime otpExpiry = LocalDateTime.now().plusMinutes(otpExpiryMinutes);

        PasswordResetOtp otpRecord = PasswordResetOtp.builder()
                .otpCode(otpCode)
                .user(user)
                .otpExpiryDate(otpExpiry)
                .build();

        return otpRepository.save(otpRecord);
    }

    /**
     * Fetches the latest active OTP record for a user.
     */
    public Optional<PasswordResetOtp> getActiveOtp(User user) {
        return otpRepository.findTopByUserAndUsedFalseOrderByCreatedAtDesc(user);
    }

    /**
     * Validates a submitted OTP against the stored record.
     * Increments attemptCount on mismatch and persists the change.
     *
     * @throws IllegalStateException   if max attempts reached or OTP expired
     * @throws IllegalArgumentException if the OTP code doesn't match
     */
    @Transactional
    public void validateOtp(PasswordResetOtp otpRecord, String submittedOtp) {
        if (otpRecord.isMaxAttemptsReached()) {
            log.warn("Max OTP attempts reached for user: {}", otpRecord.getUser().getId());
            throw new IllegalStateException("Too many failed attempts. Please request a new OTP.");
        }

        if (otpRecord.isOtpExpired()) {
            log.warn("Expired OTP attempt for user: {}", otpRecord.getUser().getId());
            throw new IllegalStateException("OTP has expired. Please request a new one.");
        }

        if (!otpRecord.getOtpCode().equals(submittedOtp)) {
            otpRecord.setAttemptCount(otpRecord.getAttemptCount() + 1);
            otpRepository.save(otpRecord);
            int remaining = 5 - otpRecord.getAttemptCount();
            log.warn("Invalid OTP submitted for user: {} (attempt {})",
                    otpRecord.getUser().getId(), otpRecord.getAttemptCount());
            throw new IllegalArgumentException("Invalid OTP. " + remaining + " attempt(s) remaining.");
        }
    }

    /**
     * Marks an OTP record as verified and issues a short-lived reset token.
     *
     * @return the generated reset token
     */
    @Transactional
    public String issueResetToken(PasswordResetOtp otpRecord) {
        String resetToken = UUID.randomUUID().toString();
        LocalDateTime resetTokenExpiry = LocalDateTime.now().plusMinutes(resetTokenExpiryMinutes);

        otpRecord.setOtpVerified(true);
        otpRecord.setResetToken(resetToken);
        otpRecord.setResetTokenExpiryDate(resetTokenExpiry);
        otpRepository.save(otpRecord);

        return resetToken;
    }

    /**
     * Returns the configured reset-token expiry, in seconds.
     */
    public long getResetTokenExpirySeconds() {
        return (long) resetTokenExpiryMinutes * 60;
    }

    /**
     * Fetches an unused OTP record by its reset token.
     */
    public Optional<PasswordResetOtp> findByResetToken(String resetToken) {
        return otpRepository.findByResetTokenAndUsedFalse(resetToken);
    }

    /**
     * Marks an OTP record as used (prevents replay).
     */
    @Transactional
    public void markUsed(PasswordResetOtp otpRecord) {
        otpRecord.setUsed(true);
        otpRepository.save(otpRecord);
    }
}