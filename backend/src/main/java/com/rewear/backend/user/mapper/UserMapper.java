package com.rewear.backend.user.mapper;

import com.rewear.backend.user.dto.request.UserRequestDto;
import com.rewear.backend.user.dto.response.UserResponseDto;
import com.rewear.backend.user.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(UserRequestDto requestDto) {
        return User.builder()
                .fullName(requestDto.getFullName().trim())
                .email(requestDto.getEmail().trim().toLowerCase())
                .password(requestDto.getPassword())
                .isActive(true)
                .build();
        // NOTE: role intentionally not set here — relies on User.role's
        // @Builder.Default (Role.USER). Public signup must never be able
        // to self-assign ADMIN, so don't add a role param to this method.
    }

    public UserResponseDto toResponseDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .profilePictureUrl(user.getProfilePictureUrl()) // Google photo URL or null
                .phone(user.getPhone())
                .role(user.getRole().name())                     // NEW — "USER" or "ADMIN"
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}