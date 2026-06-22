// listing/mapper/SellerMapper.java
package com.rewear.backend.listing.mapper;

import com.rewear.backend.listing.dto.response.SellerSummaryDto;
import com.rewear.backend.user.model.User;

public class SellerMapper {

    public static SellerSummaryDto toSellerSummary(User user) {
        if (user == null) return null;

        return SellerSummaryDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .profilePictureUrl(user.getProfilePictureUrl())
                .initials(computeInitials(user.getFullName()))
                .build();
    }

    private static String computeInitials(String fullName) {
        if (fullName == null || fullName.isBlank()) return "?";

        String[] parts = fullName.trim().split("\\s+");
        String first = String.valueOf(parts[0].charAt(0));

        if (parts.length == 1) {
            return first.toUpperCase();
        }

        String last = String.valueOf(parts[parts.length - 1].charAt(0));
        return (first + last).toUpperCase();
    }
}