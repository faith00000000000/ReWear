package com.rewear.backend.donation.dto.request;

import com.rewear.backend.donation.enums.DonationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DonationStatusUpdateRequestDto {

    @NotNull(message = "Status is required")
    private DonationStatus status;
}