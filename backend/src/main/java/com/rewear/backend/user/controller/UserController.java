package com.rewear.backend.user.controller;

import com.rewear.backend.exception.ResourceNotFoundException;
import com.rewear.backend.user.dto.request.UserUpdateRequestDto;
import com.rewear.backend.user.dto.response.UserResponseDto;
import com.rewear.backend.user.dto.response.UserStatsDto;
import com.rewear.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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
//    @GetMapping("/me")
//    public ResponseEntity<UserResponseDto> getCurrentUser(Principal principal) {
//        log.info("Fetching current user profile: {}", principal.getName());
//        UserResponseDto user = userService.getUserByEmail(principal.getName());
//        return ResponseEntity.ok(user);
//    }
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(Principal principal) {
        if (principal == null) {
            throw new ResourceNotFoundException("No authenticated user found");
        }
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
//    @GetMapping("/{id}")
//    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
//        log.info("Fetching user by id: {}", id);
//        return ResponseEntity.ok(userService.getUserById(id));
//    }
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        boolean isOwner = false;
        if (userDetails != null) {
            UserResponseDto caller = userService.getUserByEmail(userDetails.getUsername());
            isOwner = caller.getId().equals(id);
        }
        log.info("Fetching user by id: {} (isOwner={})", id, isOwner);
        return ResponseEntity.ok(userService.getUserById(id, isOwner));
    }

    /**
     * Update user profile information
     *
     * @param id user ID
     * @param requestDto update request
     * @param principal authenticated user
     * @return UserResponseDto
     */
//    @PatchMapping("/{id}")
//    public ResponseEntity<UserResponseDto> updateUser(
//            @PathVariable Long id,
//            @Valid @RequestBody UserUpdateRequestDto requestDto,
//            Principal principal
//    ) {
//        log.info("Updating user: {} by {}", id, principal.getName());
//        return ResponseEntity.ok(userService.updateUser(id, requestDto));
//    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequestDto requestDto,
            Principal principal
    ) {
        UserResponseDto caller = userService.getUserByEmail(principal.getName());
        if (!caller.getId().equals(id)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You may only update your own account.");
        }
        log.info("Updating user: {} by {}", id, principal.getName());
        return ResponseEntity.ok(userService.updateUser(id, requestDto));
    }

    /**
     * Update the authenticated user's profile picture. Accepts a single
     * multipart file, uploads it to Supabase Storage via SupabaseStorageService,
     * and persists the resulting public URL. Own-account only, same
     * owner-check pattern as updateUser/deactivateUser/deleteUser below.
     *
     * @param id        user ID
     * @param file      the new profile picture (multipart/form-data, field name "file")
     * @param principal authenticated user
     * @return UserResponseDto with the updated profilePictureUrl
     */
    @PatchMapping(value = "/{id}/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponseDto> updateProfilePicture(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            Principal principal
    ) {
        UserResponseDto caller = userService.getUserByEmail(principal.getName());
        if (!caller.getId().equals(id)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You may only update your own profile picture.");
        }
        log.info("Updating profile picture for user: {} by {}", id, principal.getName());
        return ResponseEntity.ok(userService.updateProfilePicture(id, file));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<UserResponseDto> deactivateUser(
            @PathVariable Long id,
            Principal principal
    ) {
        UserResponseDto caller = userService.getUserByEmail(principal.getName());
        if (!caller.getId().equals(id)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You may only deactivate your own account.");
        }
        log.info("Deactivating user: {}", id);
        return ResponseEntity.ok(userService.deactivateUser(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            Principal principal
    ) {
        UserResponseDto caller = userService.getUserByEmail(principal.getName());
        if (!caller.getId().equals(id)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You may only delete your own account.");
        }
        log.info("Deleting user: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // Add alongside the other @GetMapping methods
    @GetMapping("/{id}/stats")
    public ResponseEntity<UserStatsDto> getUserStats(@PathVariable Long id) {
        log.info("Fetching stats for user: {}", id);
        return ResponseEntity.ok(userService.getUserStats(id));
    }
}