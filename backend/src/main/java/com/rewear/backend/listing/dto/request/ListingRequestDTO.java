// listing/dto/request/ListingRequestDTO.java
package com.rewear.backend.listing.dto.request;

import com.rewear.backend.listing.enums.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingRequestDTO {

    // ── Section 1 ────────────────────────────────────────────────────

    @NotBlank(message = "Product title is required")
    @Size(max = 80, message = "Title must not exceed 80 characters")
    private String productTitle;

    @NotNull(message = "Listing mode is required")
    private ListingMode listingMode;

    @NotBlank(message = "Clothing type is required")
    private String clothingType;

    @NotBlank(message = "Gender is required")
    private String gender;

    private String brand;
    private String styleOccasion;
    private String tags;

    // ── Section 2 — raw file uploads ─────────────────────────────────

    private MultipartFile photoFront;
    private MultipartFile photoBack;
    private MultipartFile photoLabel;
    private MultipartFile photoDetail;
    private MultipartFile video;

    // ── Section 3 ────────────────────────────────────────────────────

    @Size(max = 1500, message = "Description must not exceed 1500 characters")
    private String description;

    // ── Section 4 ────────────────────────────────────────────────────

    @NotBlank(message = "Size is required")
    private String size;

    @NotBlank(message = "Condition is required")
    private String condition;

    @NotBlank(message = "Color is required")
    private String color;

    @NotBlank(message = "Material is required")
    private String material;

    @DecimalMin(value = "0.0", inclusive = false,
            message = "Original price must be positive")
    private BigDecimal originalPrice;

    private Availability availability;

    private String defectFlaws;

    // ── Section 5: Delivery Options ──────────────────────────────────
    // Conditional-required fields (depending on deliveryOption) are
    // validated manually in ListingServiceImpl#validateDeliveryDetails,
    // not via annotations — mirrors the frontend's own conditional logic.

    @NotNull(message = "Delivery option is required")
    private DeliveryOption deliveryOption;

    private String shippingAvailability;
    private ShippingFeeType shippingFeeType;

    @DecimalMin(value = "0.0", inclusive = false,
            message = "Fixed shipping fee must be positive")
    private BigDecimal fixedShippingFee;

    private String sellerDistrict;
    private String sellerProvince;

    @DecimalMin(value = "0.0", inclusive = false,
            message = "Shipping rate must be positive")
    private BigDecimal rateWithinDistrict;

    @DecimalMin(value = "0.0", inclusive = false,
            message = "Shipping rate must be positive")
    private BigDecimal rateWithinProvince;

    @DecimalMin(value = "0.0", inclusive = false,
            message = "Shipping rate must be positive")
    private BigDecimal rateNationwide;

    private String dispatchTime;

    private String pickupArea;
    private Double pickupLat;
    private Double pickupLng;
    private String pickupResolvedAddress;
    private String pickupContactNumber;
    private String pickupDays;        // comma-separated: "Mon,Tue,Wed"
    private String pickupTimeFrom;    // "HH:mm"
    private String pickupTimeTo;      // "HH:mm"
    private String pickupInstructions;
    private Boolean sameDayPickup;

    // ── Section 6 ────────────────────────────────────────────────────

    @DecimalMin(value = "0.0", inclusive = false,
            message = "Thrift price must be positive")
    private BigDecimal thriftPrice;

    @DecimalMin(value = "0.0", inclusive = false,
            message = "Rent per day must be positive")
    private BigDecimal rentPerDay;

    @DecimalMin(value = "0.0", inclusive = false,
            message = "Security deposit must be positive")
    private BigDecimal securityDeposit;

    // ── Meta ──────────────────────────────────────────────────────────

    // Frontend now always sends true (Save Draft button removed), but the
    // field stays so DRAFT-via-other-callers (admin tools, future re-add
    // of drafts) keeps working without another DTO change.
    @Builder.Default
    private boolean publish = false;

    // NOTE: sellerId removed. The seller is resolved server-side from the
    // authenticated JWT principal in the controller and passed directly
    // into the service/mapper — never trusted from client input.
}