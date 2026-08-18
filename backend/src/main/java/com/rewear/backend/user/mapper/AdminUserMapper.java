package com.rewear.backend.user.mapper;

import com.rewear.backend.user.dto.response.AdminUserResponseDto;
import com.rewear.backend.user.enums.AdminUserRole;
import com.rewear.backend.user.model.User;
import org.springframework.stereotype.Component;

@Component
public class AdminUserMapper {

    public AdminUserResponseDto toAdminResponseDto(User user, int totalOrders, int totalListings) {
        return AdminUserResponseDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profilePictureUrl(user.getProfilePictureUrl())
                .role(deriveRole(totalListings))
                .status(user.getStatus())
                .joinedDate(user.getCreatedAt() != null ? user.getCreatedAt().toLocalDate() : null)
                .totalOrders(totalOrders)
                .totalListings(totalListings)
                .banReason(user.getBanReason())
                .build();
    }

    // Role is purely a function of whether the user has ever listed an item.
    // Buying activity does not affect it.
    private AdminUserRole deriveRole(int totalListings) {
        return totalListings > 0 ? AdminUserRole.SELLER : AdminUserRole.BUYER;
    }
}