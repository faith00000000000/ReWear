package com.rewear.backend.donation.dto.response;

import com.rewear.backend.donation.enums.OrganizationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationResponseDto {

    private Long id;
    private String name;
    private OrganizationType type;
    private String description;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}