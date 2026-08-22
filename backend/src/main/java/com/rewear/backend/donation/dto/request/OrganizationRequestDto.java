package com.rewear.backend.donation.dto.request;

import com.rewear.backend.donation.enums.OrganizationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrganizationRequestDto {

    @NotBlank(message = "Organization name is required")
    private String name;

    @NotNull(message = "Organization type is required")
    private OrganizationType type;

    private String description;

    // Optional — defaults to true on create; used by admin to toggle visibility on update
    private Boolean active;
}