package com.rewear.backend.user.service;

import com.rewear.backend.storage.SupabaseStorageService;
import com.rewear.backend.user.dto.request.UserUpdateRequestDto;
import com.rewear.backend.user.dto.response.UserResponseDto;
import com.rewear.backend.exception.ResourceNotFoundException;
import com.rewear.backend.user.mapper.UserMapper;
import com.rewear.backend.user.model.User;
import com.rewear.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final SupabaseStorageService storageService; // NEW — for profile picture upload

    @Transactional(readOnly = true)
    public List<UserResponseDto> getAllUsers() {
        log.debug("Fetching all users");
        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponseDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponseDto getUserById(Long id) {
        log.debug("Fetching user by id: {}", id);
        User user = findUserById(id);
        return userMapper.toResponseDto(user);
    }

    @Transactional(readOnly = true)
    public UserResponseDto getUserById(Long id, boolean includePrivateFields) {
        log.debug("Fetching user by id: {} (includePrivateFields={})", id, includePrivateFields);
        User user = findUserById(id);
        UserResponseDto full = userMapper.toResponseDto(user);

        if (includePrivateFields) {
            return full;
        }

        // Public/non-owner view — strip account-internal fields (email, phone).
        return UserResponseDto.builder()
                .id(full.getId())
                .fullName(full.getFullName())
                .profilePictureUrl(full.getProfilePictureUrl())
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponseDto getUserByEmail(String email) {
        log.debug("Fetching user by email: {}", email);
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> {
                    log.warn("User not found with email: {}", email);
                    return new ResourceNotFoundException("User not found");
                });
        return userMapper.toResponseDto(user);
    }

    @Transactional
    public UserResponseDto updateUser(Long id, UserUpdateRequestDto requestDto) {
        log.info("Updating user: {}", id);
        User user = findUserById(id);

        if (requestDto.getFullName() != null && !requestDto.getFullName().isBlank()) {
            String fullName = requestDto.getFullName().trim();
            user.setFullName(fullName);
            log.debug("Updated fullName for user: {}", id);
        }

        if (requestDto.getEmail() != null && !requestDto.getEmail().isBlank()) {
            String normalizedEmail = normalizeEmail(requestDto.getEmail());

            if (!user.getEmail().equals(normalizedEmail) && userRepository.existsByEmail(normalizedEmail)) {
                log.warn("Email already exists: {}", normalizedEmail);
                throw new ResourceNotFoundException("Email is already registered");
            }

            user.setEmail(normalizedEmail);
            log.debug("Updated email for user: {}", id);
        }

        if (requestDto.getPassword() != null && !requestDto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(requestDto.getPassword()));
            log.debug("Updated password for user: {}", id);
        }

        // NEW — phone. @Pattern on the DTO already guarantees this is exactly
        // 10 digits by the time it reaches here (or null, if not being changed).
        if (requestDto.getPhone() != null && !requestDto.getPhone().isBlank()) {
            user.setPhone(requestDto.getPhone().trim());
            log.debug("Updated phone for user: {}", id);
        }

        User updatedUser = userRepository.save(user);
        log.info("User {} successfully updated", id);
        return userMapper.toResponseDto(updatedUser);
    }

    /**
     * Uploads a new profile picture to Supabase Storage (under
     * users/{id}/photos/) and persists the resulting public URL on the user
     * row, replacing whatever was there before. If the previous picture was
     * itself a Supabase-hosted file, it's deleted after the new one is saved
     * successfully — if it was an external OAuth photo URL (Google, etc.),
     * deleteByUrl() silently no-ops since it can't be parsed as a Supabase
     * object path.
     *
     * @param id   user ID
     * @param file the new profile picture
     * @return updated UserResponseDto
     */
    @Transactional
    public UserResponseDto updateProfilePicture(Long id, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Profile picture file must not be empty");
        }

        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType) || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Profile picture must be an image file");
        }

        log.info("Updating profile picture for user: {}", id);
        User user = findUserById(id);
        String previousUrl = user.getProfilePictureUrl();

        String newUrl;
        try {
            newUrl = storageService.uploadPhoto(file, "users/" + id);
        } catch (IOException e) {
            log.error("Failed to upload profile picture for user: {}", id, e);
            throw new RuntimeException("Failed to upload profile picture", e);
        }

        user.setProfilePictureUrl(newUrl);
        User updatedUser = userRepository.save(user);

        // Best-effort cleanup — don't fail the request if the old file can't
        // be removed, the new picture is already saved either way.
        if (StringUtils.hasText(previousUrl)) {
            storageService.deleteByUrl(previousUrl);
        }

        log.info("Profile picture updated for user: {}", id);
        return userMapper.toResponseDto(updatedUser);
    }

    @Transactional
    public UserResponseDto deactivateUser(Long id) {
        log.info("Deactivating user: {}", id);
        User user = findUserById(id);
        user.setIsActive(false);

        User updatedUser = userRepository.save(user);
        log.info("User {} successfully deactivated", id);
        return userMapper.toResponseDto(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        log.info("Deleting user: {}", id);
        User user = findUserById(id);
        userRepository.delete(user);
        log.info("User {} successfully deleted", id);
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User not found with id: {}", id);
                    return new ResourceNotFoundException("User not found");
                });
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}