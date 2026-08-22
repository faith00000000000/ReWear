package com.rewear.backend.donation.service;

import com.rewear.backend.donation.dto.request.DonationRequestDto;
import com.rewear.backend.donation.dto.response.DonationResponseDto;
import com.rewear.backend.donation.enums.DonationStatus;

import java.util.List;

public interface DonationService {

    DonationResponseDto create(DonationRequestDto dto);

    List<DonationResponseDto> getAll();

    DonationResponseDto getById(Long id);

    DonationResponseDto updateStatus(Long id, DonationStatus status);

    List<DonationResponseDto> getMine();
}
