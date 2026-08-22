package com.rewear.backend.donation.dto.response;

import com.rewear.backend.donation.enums.DonationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationResponseDto {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String pickupAddress;
    private String packageCount;
    private Double estimatedWeightKg;
    private String notes;
    private OrganizationResponseDto organization;
    private boolean agreedToDisclaimer;
    private DonationStatus status;
    private LocalDateTime createdAt;
}