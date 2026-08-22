package com.rewear.backend.donation.service;

import com.rewear.backend.donation.dto.request.OrganizationRequestDto;
import com.rewear.backend.donation.dto.response.OrganizationResponseDto;
import com.rewear.backend.donation.enums.OrganizationType;

import java.util.List;

public interface OrganizationService {

    List<OrganizationResponseDto> getActiveByType(OrganizationType type);

    List<OrganizationResponseDto> getAll();

    OrganizationResponseDto getById(Long id);

    OrganizationResponseDto create(OrganizationRequestDto dto);

    OrganizationResponseDto update(Long id, OrganizationRequestDto dto);

    void delete(Long id);
}