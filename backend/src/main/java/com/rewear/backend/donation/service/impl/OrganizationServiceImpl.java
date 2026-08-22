package com.rewear.backend.donation.service.impl;

import com.rewear.backend.donation.dto.request.OrganizationRequestDto;
import com.rewear.backend.donation.dto.response.OrganizationResponseDto;
import com.rewear.backend.donation.model.Organization;
import com.rewear.backend.donation.enums.OrganizationType;
import com.rewear.backend.exception.ResourceNotFoundException;
import com.rewear.backend.donation.mapper.OrganizationMapper;
import com.rewear.backend.donation.repository.OrganizationRepository;
import com.rewear.backend.donation.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrganizationResponseDto> getActiveByType(OrganizationType type) {
        return organizationRepository.findByTypeAndActiveTrueOrderByNameAsc(type)
                .stream()
                .map(OrganizationMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrganizationResponseDto> getAll() {
        return organizationRepository.findAll()
                .stream()
                .map(OrganizationMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizationResponseDto getById(Long id) {
        return OrganizationMapper.toResponseDto(findOrThrow(id));
    }

    @Override
    public OrganizationResponseDto create(OrganizationRequestDto dto) {
        Organization organization = OrganizationMapper.toEntity(dto);
        return OrganizationMapper.toResponseDto(organizationRepository.save(organization));
    }

    @Override
    public OrganizationResponseDto update(Long id, OrganizationRequestDto dto) {
        Organization organization = findOrThrow(id);
        OrganizationMapper.updateEntity(organization, dto);
        return OrganizationMapper.toResponseDto(organizationRepository.save(organization));
    }

    @Override
    public void delete(Long id) {
        organizationRepository.delete(findOrThrow(id));
    }

    private Organization findOrThrow(Long id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));
    }
}