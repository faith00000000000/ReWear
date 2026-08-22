package com.rewear.backend.donation.controller.admin;

import com.rewear.backend.donation.dto.request.DonationStatusUpdateRequestDto;
import com.rewear.backend.donation.dto.response.DonationResponseDto;
import com.rewear.backend.donation.service.DonationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Admin-only — view submitted donations and move them through their lifecycle
@RestController
@RequestMapping("/api/admin/donations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDonationController {

    private final DonationService donationService;

    @GetMapping
    public ResponseEntity<List<DonationResponseDto>> getAll() {
        return ResponseEntity.ok(donationService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonationResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(donationService.getById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DonationResponseDto> updateStatus(
            @PathVariable Long id, @Valid @RequestBody DonationStatusUpdateRequestDto dto) {
        return ResponseEntity.ok(donationService.updateStatus(id, dto.getStatus()));
    }
}