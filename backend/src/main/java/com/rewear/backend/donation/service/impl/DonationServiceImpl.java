// DonationServiceImpl.java — set donorUserId on create, add getMine()
// Adjust the `UserRepository` import/package and `findByEmail` method name
// to match whatever you're already using for the Listing seller resolution
// you mentioned wiring earlier — this follows the same pattern.
package com.rewear.backend.donation.service.impl;

import com.rewear.backend.donation.dto.request.DonationRequestDto;
import com.rewear.backend.donation.dto.response.DonationResponseDto;
import com.rewear.backend.donation.enums.DonationStatus;
import com.rewear.backend.donation.mapper.DonationMapper;
import com.rewear.backend.donation.model.Donation;
import com.rewear.backend.donation.model.Organization;
import com.rewear.backend.donation.repository.DonationRepository;
import com.rewear.backend.donation.repository.OrganizationRepository;
import com.rewear.backend.donation.service.DonationService;
import com.rewear.backend.exception.ResourceNotFoundException;
// TODO: point these two at your actual User entity/repository package
import com.rewear.backend.user.model.User;
import com.rewear.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DonationServiceImpl implements DonationService {
    private final com.rewear.backend.notification.service.NotificationService notificationService;

    private final DonationRepository donationRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository; // NEW dependency

    @Override
    public DonationResponseDto create(DonationRequestDto dto) {
        Organization organization = organizationRepository.findById(dto.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Organization not found with id: " + dto.getOrganizationId()));

        if (!organization.isActive()) {
            throw new IllegalStateException(
                    "This organization is no longer accepting donations. Please choose another.");
        }

        Donation donation = DonationMapper.toEntity(dto, organization);
        donation.setDonorUserId(resolveCurrentUserId()); // null for guests — that's fine
        Donation saved = donationRepository.save(donation);
        notificationService.notifyUser(saved.getDonorUserId(), "donation-created:" + saved.getId(),
            com.rewear.backend.notification.enums.NotificationType.DONATION,
            "Donation submitted", "Your donation request has been received.", "/profile/donations");
        notificationService.notifyAdmins("donation-created:" + saved.getId(),
            com.rewear.backend.notification.enums.NotificationType.DONATION,
            "New donation", "A donation request is waiting for review.", "/admin/donations");
        return DonationMapper.toResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonationResponseDto> getAll() {
        return donationRepository.findAll().stream()
                .map(DonationMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DonationResponseDto getById(Long id) {
        return DonationMapper.toResponseDto(findOrThrow(id));
    }

    @Override
    public DonationResponseDto updateStatus(Long id, DonationStatus status) {
        Donation donation = findOrThrow(id);
        if (donation.getStatus() != status) {
            notificationService.notifyUser(donation.getDonorUserId(),
                "donation-status:" + id + ":" + java.util.UUID.randomUUID(),
                com.rewear.backend.notification.enums.NotificationType.DONATION,
                "Donation status updated", "Your donation is now " + status.name().toLowerCase() + ".", "/profile/donations");
        }
        donation.setStatus(status);
        return DonationMapper.toResponseDto(donationRepository.save(donation));
    }

    // NEW — powers GET /api/donations/mine
    @Override
    @Transactional(readOnly = true)
    public List<DonationResponseDto> getMine() {
        Long userId = resolveCurrentUserId();
        if (userId == null) {
            // Shouldn't happen behind @PreAuthorize("isAuthenticated()"), but
            // fail safe rather than leaking someone else's donations.
            return List.of();
        }
        return donationRepository.findByDonorUserIdOrderByCreatedAtDesc(userId).stream()
                .map(DonationMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    // Mirrors how JwtAuthFilter sets the principal (username = email) —
    // returns null for anonymous/unauthenticated requests instead of throwing,
    // since donation submission must keep working for guests.
    private Long resolveCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String email = ((UserDetails) auth.getPrincipal()).getUsername();
        return userRepository.findByEmail(email).map(User::getId).orElse(null);
    }

    private Donation findOrThrow(Long id) {
        return donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + id));
    }
}