package com.rewear.backend.donation.controller.admin;
import com.rewear.backend.donation.dto.request.OrganizationRequestDto;
import com.rewear.backend.donation.dto.response.OrganizationResponseDto;
import com.rewear.backend.donation.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Admin-only — full CRUD so admins can manage which NGOs/INGOs appear on the donation form.
// Adjust @PreAuthorize to match however your project checks the admin role (JWT authority, etc.)
@RestController
@RequestMapping("/api/admin/organizations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrganizationController {

    private final OrganizationService organizationService;

    @GetMapping
    public ResponseEntity<List<OrganizationResponseDto>> getAll() {
        return ResponseEntity.ok(organizationService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrganizationResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(organizationService.getById(id));
    }

    @PostMapping
    public ResponseEntity<OrganizationResponseDto> create(
            @Valid @RequestBody OrganizationRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(organizationService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrganizationResponseDto> update(
            @PathVariable Long id, @Valid @RequestBody OrganizationRequestDto dto) {
        return ResponseEntity.ok(organizationService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        organizationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
