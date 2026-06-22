// listing/dto/response/SellerSummaryDto.java
package com.rewear.backend.listing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerSummaryDto {
    private Long id;
    private String fullName;
    private String profilePictureUrl; // null if user hasn't uploaded one — frontend falls back to initials
    private String initials;          // computed server-side, e.g. "RW"
}
