package com.rewear.backend.donation.mapper;

import com.rewear.backend.donation.dto.request.DonationRequestDto;
import com.rewear.backend.donation.dto.response.DonationResponseDto;
import com.rewear.backend.donation.model.Donation;
import com.rewear.backend.donation.model.Organization;

public class DonationMapper {

    private DonationMapper() {
    }

    // organization is resolved separately by the service (needs a DB lookup), so it's passed in
    public static Donation toEntity(DonationRequestDto dto, Organization organization) {
        return Donation.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .pickupAddress(dto.getPickupAddress())
                .packageCount(dto.getPackageCount())
                .estimatedWeightKg(dto.getEstimatedWeightKg())
                .notes(dto.getNotes())
                .organization(organization)
                .agreedToDisclaimer(dto.isAgreedToDisclaimer())
                .build();
    }

    public static DonationResponseDto toResponseDto(Donation donation) {
        return DonationResponseDto.builder()
                .id(donation.getId())
                .fullName(donation.getFullName())
                .email(donation.getEmail())
                .phone(donation.getPhone())
                .pickupAddress(donation.getPickupAddress())
                .packageCount(donation.getPackageCount())
                .estimatedWeightKg(donation.getEstimatedWeightKg())
                .notes(donation.getNotes())
                .organization(OrganizationMapper.toResponseDto(donation.getOrganization()))
                .agreedToDisclaimer(donation.isAgreedToDisclaimer())
                .status(donation.getStatus())
                .createdAt(donation.getCreatedAt())
                .build();
    }
}