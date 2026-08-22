package com.rewear.backend.donation.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DonationRequestDto {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;

    @NotBlank(message = "Package count is required")
    private String packageCount;

    @NotNull(message = "Estimated weight is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Weight must be greater than 0")
    private Double estimatedWeightKg;

    private String notes;

    @NotNull(message = "Organization must be selected")
    private Long organizationId;

    @AssertTrue(message = "You must agree to the donation guidelines")
    private boolean agreedToDisclaimer;
}