package com.rewear.backend.user.dto.response;

import com.rewear.backend.user.enums.AdminUserRole;
import com.rewear.backend.user.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponseDto {
    private Long id;                     // kept for admin API calls (ban/unban/inspect) — frontend must not render it
    private String fullName;
    private String email;
    private String phone;
    private String profilePictureUrl;
    private AdminUserRole role;          // derived: BUYER / SELLER / HYBRID
    private UserStatus status;           // ACTIVE / FLAGGED / BANNED
    private LocalDate joinedDate;
    private Integer totalOrders;
    private Integer totalListings;
    private String banReason;            // null unless status = BANNED
}