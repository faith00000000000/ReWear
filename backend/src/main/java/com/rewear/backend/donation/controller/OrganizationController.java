package com.rewear.backend.donation.controller;

import com.rewear.backend.donation.dto.response.OrganizationResponseDto;
import com.rewear.backend.donation.enums.OrganizationType;
import com.rewear.backend.donation.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Public — feeds the NGO/INGO dropdown on the donation form, e.g. GET /api/organizations?type=NGO
@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping
    public ResponseEntity<List<OrganizationResponseDto>> getActiveByType(
            @RequestParam OrganizationType type) {
        return ResponseEntity.ok(organizationService.getActiveByType(type));
    }
}