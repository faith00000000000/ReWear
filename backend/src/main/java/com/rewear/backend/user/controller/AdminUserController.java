package com.rewear.backend.user.controller;

import com.rewear.backend.user.dto.request.AdminBanUserRequestDto;
import com.rewear.backend.user.dto.response.AdminUserResponseDto;
import com.rewear.backend.user.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // requires @EnableMethodSecurity + ROLE_ADMIN authority — adjust to your security config
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsersForAdmin());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserResponseDto> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.getUserForAdmin(id));
    }

    @PatchMapping("/{id}/ban")
    public ResponseEntity<AdminUserResponseDto> banUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminBanUserRequestDto requestDto
    ) {
        return ResponseEntity.ok(adminUserService.banUser(id, requestDto.getReason()));
    }

    @PatchMapping("/{id}/unban")
    public ResponseEntity<AdminUserResponseDto> unbanUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.unbanUser(id));
    }
}