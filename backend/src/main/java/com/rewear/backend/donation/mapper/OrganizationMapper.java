package com.rewear.backend.donation.mapper;

import com.rewear.backend.donation.dto.request.OrganizationRequestDto;
import com.rewear.backend.donation.dto.response.OrganizationResponseDto;
import com.rewear.backend.donation.model.Organization;

public class OrganizationMapper {

    private OrganizationMapper() {
    }

    public static Organization toEntity(OrganizationRequestDto dto) {
        return Organization.builder()
                .name(dto.getName())
                .type(dto.getType())
                .description(dto.getDescription())
                .active(dto.getActive() == null ? true : dto.getActive())
                .build();
    }

    // Applies request fields onto an existing entity for update — keeps id/timestamps intact
    public static void updateEntity(Organization organization, OrganizationRequestDto dto) {
        organization.setName(dto.getName());
        organization.setType(dto.getType());
        organization.setDescription(dto.getDescription());
        if (dto.getActive() != null) {
            organization.setActive(dto.getActive());
        }
    }

    public static OrganizationResponseDto toResponseDto(Organization organization) {
        return OrganizationResponseDto.builder()
                .id(organization.getId())
                .name(organization.getName())
                .type(organization.getType())
                .description(organization.getDescription())
                .active(organization.isActive())
                .createdAt(organization.getCreatedAt())
                .updatedAt(organization.getUpdatedAt())
                .build();
    }
}
