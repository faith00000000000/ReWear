// listing/dto/response/ListingResponseDTO.java
package com.rewear.backend.listing.dto.response;

import com.rewear.backend.listing.enums.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingResponseDTO {

    private Long id;

    // Section 1
    private String productTitle;
    private ListingMode listingMode;
    private String clothingType;
    private String gender;
    private String brand;
    private String styleOccasion;
    private String tags;

    // Section 2 — Supabase public URLs returned to frontend
    private String photoFrontUrl;
    private String photoBackUrl;
    private String photoLabelUrl;
    private String photoDetailUrl;
    private String videoUrl;

    // Section 3
    private String description;

    // Section 4
    private String size;
    private String condition;
    private String color;
    private String material;
    private BigDecimal originalPrice;
    private Availability availability;
    private ShippingOptions shippingOption;
    private String defectFlaws;

    // Section 5
    private BigDecimal thriftPrice;
    private BigDecimal rentPerDay;
    private BigDecimal securityDeposit;

    // Meta
    private ListingStatus status;
    private Long sellerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
