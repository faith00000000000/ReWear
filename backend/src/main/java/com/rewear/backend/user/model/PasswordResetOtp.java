package com.rewear.backend.user.model;

// src/main/java/com/rewear/backend/model/PasswordResetOtp.java
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_otps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The 6-digit OTP code sent via email */
    @Column(nullable = false, length = 6)
    private String otpCode;

    /**
     * After OTP is verified, a secure reset token is issued.
     * This token is what the client sends to /reset-password.
     * Null until OTP is verified.
     */
    @Column(unique = true)
    private String resetToken;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime otpExpiryDate;

    /** Populated only after successful OTP verification */
    @Column
    private LocalDateTime resetTokenExpiryDate;

    @Column(nullable = false)
    @Builder.Default
    private Boolean otpVerified = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean used = false;

    /** How many times the wrong OTP was submitted — max 5 attempts */
    @Column(nullable = false)
    @Builder.Default
    private Integer attemptCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ── Helper Methods ────────────────────────────────────────────
    public boolean isOtpExpired() {
        return LocalDateTime.now().isAfter(this.otpExpiryDate);
    }

    public boolean isResetTokenExpired() {
        if (this.resetTokenExpiryDate == null) return true;
        return LocalDateTime.now().isAfter(this.resetTokenExpiryDate);
    }

    public boolean isMaxAttemptsReached() {
        return this.attemptCount >= 5;
    }
}

