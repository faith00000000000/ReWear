package com.rewear.backend.user.service;

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

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

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

        User updatedUser = userRepository.save(user);
        log.info("User {} successfully updated", id);
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
