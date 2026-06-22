package com.rewear.backend.user.controller;

import com.rewear.backend.user.dto.request.UserUpdateRequestDto;
import com.rewear.backend.user.dto.response.UserResponseDto;
import com.rewear.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Get current authenticated user's profile
     * 
     * @param principal the authenticated user principal
     * @return UserResponseDto
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(Principal principal) {
        log.info("Fetching current user profile: {}", principal.getName());
        UserResponseDto user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(user);
    }

    /**
     * Get all users (Admin endpoint)
     * 
     * @return List of all users
     */
    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        log.info("Fetching all users");
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * Get user by ID
     * 
     * @param id user ID
     * @return UserResponseDto
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        log.info("Fetching user by id: {}", id);
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /**
     * Update user profile information
     * 
     * @param id user ID
     * @param requestDto update request
     * @param principal authenticated user
     * @return UserResponseDto
     */
    @PatchMapping("/{id}")
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequestDto requestDto,
            Principal principal
    ) {
        log.info("Updating user: {} by {}", id, principal.getName());
        return ResponseEntity.ok(userService.updateUser(id, requestDto));
    }

    /**
     * Deactivate user account
     * 
     * @param id user ID
     * @return UserResponseDto
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<UserResponseDto> deactivateUser(@PathVariable Long id) {
        log.info("Deactivating user: {}", id);
        return ResponseEntity.ok(userService.deactivateUser(id));
    }

    /**
     * Delete user account (permanent)
     * 
     * @param id user ID
     * @return ResponseEntity
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("Deleting user: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
