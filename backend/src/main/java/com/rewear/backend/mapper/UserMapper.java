package com.rewear.backend.mapper;

import com.rewear.backend.dto.request.UserRequestDto;
import com.rewear.backend.dto.response.UserResponseDto;
import com.rewear.backend.model.User;
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
    }

    public UserResponseDto toResponseDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .profilePictureUrl(user.getProfilePictureUrl()) // Google photo URL or null
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
