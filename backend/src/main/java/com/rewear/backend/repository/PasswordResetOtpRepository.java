// src/main/java/com/rewear/backend/repository/PasswordResetOtpRepository.java

package com.rewear.backend.repository;

import com.rewear.backend.model.PasswordResetOtp;
import com.rewear.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {

    /** Find the latest active (not used) OTP record for a user */
    Optional<PasswordResetOtp> findTopByUserAndUsedFalseOrderByCreatedAtDesc(User user);

    /** Find by the reset token (issued after OTP verification) */
    Optional<PasswordResetOtp> findByResetTokenAndUsedFalse(String resetToken);

    /** Clean up all old OTP records for a user before issuing a new one */
    @Modifying
    @Query("DELETE FROM PasswordResetOtp p WHERE p.user = :user")
    void deleteAllByUser(@Param("user") User user);
}

