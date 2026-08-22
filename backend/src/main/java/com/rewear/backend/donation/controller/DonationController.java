// DonationController.java — add the /mine endpoint next to the existing POST.
// @PreAuthorize here needs @EnableMethodSecurity active, same as your admin
// controllers already rely on.
package com.rewear.backend.donation.controller;

import com.rewear.backend.donation.dto.request.DonationRequestDto;
import com.rewear.backend.donation.dto.response.DonationResponseDto;
import com.rewear.backend.donation.service.DonationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
public class DonationController {

    private final DonationService donationService;

    // Public — no auth required, guests can donate too
    @PostMapping
    public ResponseEntity<DonationResponseDto> create(@Valid @RequestBody DonationRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(donationService.create(dto));
    }

    // NEW — any logged-in user, scoped to their own donations only
    @GetMapping("/mine")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DonationResponseDto>> getMine() {
        return ResponseEntity.ok(donationService.getMine());
    }
}