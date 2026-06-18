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

    @NotNull(message = "Shipping option is required")
    private ShippingOptions shippingOption;

    private String defectFlaws;

    // ── Section 5 ────────────────────────────────────────────────────

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

    // true = "Publish Listing" button, false = "Save Draft" button
    private boolean publish = false;

    // Resolved from JWT in SecurityContext in the controller
    private Long sellerId;
}
