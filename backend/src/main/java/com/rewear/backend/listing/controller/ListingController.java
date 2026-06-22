// listing/controller/ListingController.java
package com.rewear.backend.listing.controller;

import com.rewear.backend.exception.ResourceNotFoundException;
import com.rewear.backend.listing.dto.request.ListingRequestDTO;
import com.rewear.backend.listing.dto.response.ListingResponseDTO;
import com.rewear.backend.listing.enums.*;
import com.rewear.backend.listing.service.ListingService;
import com.rewear.backend.user.model.User;
import com.rewear.backend.user.repository.UserRepository;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;
    private final UserRepository userRepository;

    // ── POST /api/v1/listings ─────────────────────────────────────────────
    // multipart/form-data because request carries file uploads

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ListingResponseDTO> createListing(

            // Section 1
            @RequestParam("productTitle")                        String productTitle,
            @RequestParam("listingMode")                         String listingMode,
            @RequestParam("clothingType")                        String clothingType,
            @RequestParam("gender")                              String gender,
            @RequestParam(value = "brand",          required = false) String brand,
            @RequestParam(value = "styleOccasion",  required = false) String styleOccasion,
            @RequestParam(value = "tags",           required = false) String tags,

            // Section 2 — file parts
            @RequestParam(value = "photoFront",  required = false) MultipartFile photoFront,
            @RequestParam(value = "photoBack",   required = false) MultipartFile photoBack,
            @RequestParam(value = "photoLabel",  required = false) MultipartFile photoLabel,
            @RequestParam(value = "photoDetail", required = false) MultipartFile photoDetail,
            @RequestParam(value = "video",       required = false) MultipartFile video,

            // Section 3
            @RequestParam(value = "description", required = false) String description,

            // Section 4
            @RequestParam("size")                                String size,
            @RequestParam("condition")                           String condition,
            @RequestParam("color")                               String color,
            @RequestParam("material")                            String material,
            @RequestParam(value = "originalPrice",   required = false) BigDecimal originalPrice,
            @RequestParam(value = "availability",    required = false) String availability,
            @RequestParam("shippingOption")                      String shippingOption,
            @RequestParam(value = "defectFlaws",     required = false) String defectFlaws,

            // Section 5
            @RequestParam(value = "thriftPrice",     required = false) BigDecimal thriftPrice,
            @RequestParam(value = "rentPerDay",      required = false) BigDecimal rentPerDay,
            @RequestParam(value = "securityDeposit", required = false) BigDecimal securityDeposit,

            // Meta
            @RequestParam(value = "publish", defaultValue = "false") boolean publish,

            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User seller = resolveSellerFromPrincipal(userDetails);

        ListingRequestDTO request = buildRequest(
                productTitle, listingMode, clothingType, gender, brand,
                styleOccasion, tags, photoFront, photoBack, photoLabel,
                photoDetail, video, description, size, condition, color,
                material, originalPrice, availability, shippingOption,
                defectFlaws, thriftPrice, rentPerDay, securityDeposit,
                publish
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(listingService.createListing(request, seller));
    }

    // ── GET /api/v1/listings/{id} ─────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<ListingResponseDTO> getListing(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.getListingById(id));
    }

    // ── GET /api/v1/listings ──────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<Page<ListingResponseDTO>> getAllListings(
            @RequestParam(defaultValue = "0")          int    page,
            @RequestParam(defaultValue = "12")         int    size,
            @RequestParam(defaultValue = "createdAt")  String sortBy,
            @RequestParam(defaultValue = "desc")       String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        return ResponseEntity.ok(
                listingService.getAllListings(PageRequest.of(page, size, sort)));
    }

    // ── GET /api/v1/listings/seller/{sellerId} ────────────────────────────

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<ListingResponseDTO>> getBySeller(
            @PathVariable Long sellerId
    ) {
        return ResponseEntity.ok(listingService.getListingsBySeller(sellerId));
    }

    // ── GET /api/v1/listings/search?keyword=... ───────────────────────────

    @GetMapping("/search")
    public ResponseEntity<Page<ListingResponseDTO>> search(
            @RequestParam                      String keyword,
            @RequestParam(defaultValue = "0")  int    page,
            @RequestParam(defaultValue = "12") int    size
    ) {
        return ResponseEntity.ok(
                listingService.searchListings(keyword, PageRequest.of(page, size)));
    }

    // ── PUT /api/v1/listings/{id} ─────────────────────────────────────────

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ListingResponseDTO> updateListing(
            @PathVariable Long id,

            @RequestParam(value = "productTitle",    required = false) String productTitle,
            @RequestParam(value = "listingMode",     required = false) String listingMode,
            @RequestParam(value = "clothingType",    required = false) String clothingType,
            @RequestParam(value = "gender",          required = false) String gender,
            @RequestParam(value = "brand",           required = false) String brand,
            @RequestParam(value = "styleOccasion",   required = false) String styleOccasion,
            @RequestParam(value = "tags",            required = false) String tags,
            @RequestParam(value = "photoFront",      required = false) MultipartFile photoFront,
            @RequestParam(value = "photoBack",       required = false) MultipartFile photoBack,
            @RequestParam(value = "photoLabel",      required = false) MultipartFile photoLabel,
            @RequestParam(value = "photoDetail",     required = false) MultipartFile photoDetail,
            @RequestParam(value = "video",           required = false) MultipartFile video,
            @RequestParam(value = "description",     required = false) String description,
            @RequestParam(value = "size",            required = false) String size,
            @RequestParam(value = "condition",       required = false) String condition,
            @RequestParam(value = "color",           required = false) String color,
            @RequestParam(value = "material",        required = false) String material,
            @RequestParam(value = "originalPrice",   required = false) BigDecimal originalPrice,
            @RequestParam(value = "availability",    required = false) String availability,
            @RequestParam(value = "shippingOption",  required = false) String shippingOption,
            @RequestParam(value = "defectFlaws",     required = false) String defectFlaws,
            @RequestParam(value = "thriftPrice",     required = false) BigDecimal thriftPrice,
            @RequestParam(value = "rentPerDay",      required = false) BigDecimal rentPerDay,
            @RequestParam(value = "securityDeposit", required = false) BigDecimal securityDeposit,
            @RequestParam(value = "publish", defaultValue = "false")   boolean publish,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Principal resolved to confirm caller is authenticated; ownership
        // check (seller actually owns listing {id}) belongs in the service
        // layer — flagging this as a TODO since it's outside today's scope.
        resolveSellerFromPrincipal(userDetails);

        ListingRequestDTO request = buildRequest(
                productTitle, listingMode, clothingType, gender, brand,
                styleOccasion, tags, photoFront, photoBack, photoLabel,
                photoDetail, video, description, size, condition, color,
                material, originalPrice, availability, shippingOption,
                defectFlaws, thriftPrice, rentPerDay, securityDeposit,
                publish
        );

        return ResponseEntity.ok(listingService.updateListing(id, request));
    }

    // ── PATCH /api/v1/listings/{id}/status ───────────────────────────────

    @PatchMapping("/{id}/status")
    public ResponseEntity<ListingResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam @NotNull ListingStatus status
    ) {
        return ResponseEntity.ok(listingService.updateListingStatus(id, status));
    }

    // ── DELETE /api/v1/listings/{id} ──────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(@PathVariable Long id) {
        listingService.deleteListing(id);
        return ResponseEntity.noContent().build();
    }

    // ──────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────

    /** Converts raw string params into a typed ListingRequestDTO. */
    private ListingRequestDTO buildRequest(
            String productTitle, String listingMode, String clothingType,
            String gender, String brand, String styleOccasion, String tags,
            MultipartFile photoFront, MultipartFile photoBack,
            MultipartFile photoLabel, MultipartFile photoDetail, MultipartFile video,
            String description, String size, String condition, String color,
            String material, BigDecimal originalPrice, String availability,
            String shippingOption, String defectFlaws,
            BigDecimal thriftPrice, BigDecimal rentPerDay, BigDecimal securityDeposit,
            boolean publish
    ) {
        return ListingRequestDTO.builder()
                .productTitle(productTitle)
                .listingMode(parseListingMode(listingMode))
                .clothingType(clothingType)
                .gender(gender)
                .brand(brand)
                .styleOccasion(styleOccasion)
                .tags(tags)
                .photoFront(photoFront)
                .photoBack(photoBack)
                .photoLabel(photoLabel)
                .photoDetail(photoDetail)
                .video(video)
                .description(description)
                .size(size)
                .condition(condition)
                .color(color)
                .material(material)
                .originalPrice(originalPrice)
                .availability(parseAvailability(availability))
                .shippingOption(parseShippingOption(shippingOption))
                .defectFlaws(defectFlaws)
                .thriftPrice(thriftPrice)
                .rentPerDay(rentPerDay)
                .securityDeposit(securityDeposit)
                .publish(publish)
                .build();
    }

    // Frontend sends "Thrift", "Rent", "Thrift + Rent"
    private ListingMode parseListingMode(String value) {
        if (value == null) return null;
        return switch (value.trim().toUpperCase()) {
            case "THRIFT"        -> ListingMode.THRIFT;
            case "RENT"          -> ListingMode.RENT;
            case "THRIFT + RENT",
                 "THRIFT_AND_RENT" -> ListingMode.THRIFT_AND_RENT;
            default -> ListingMode.valueOf(value.trim().toUpperCase());
        };
    }

    // Frontend sends "Shipping", "Pickup", "Flex (Both)"
    private ShippingOptions parseShippingOption(String value) {
        if (value == null) return null;
        return switch (value.trim().toUpperCase()) {
            case "SHIPPING"     -> ShippingOptions.SHIPPING;
            case "PICKUP"       -> ShippingOptions.PICKUP;
            case "FLEX (BOTH)",
                 "FLEX"         -> ShippingOptions.FLEX;
            default -> ShippingOptions.valueOf(value.trim().toUpperCase());
        };
    }

    // Frontend sends "Available", "Reserved", "Sold Out"
    private Availability parseAvailability(String value) {
        if (value == null) return null;
        return switch (value.trim().toUpperCase()) {
            case "AVAILABLE"  -> Availability.AVAILABLE;
            case "RESERVED"   -> Availability.RESERVED;
            case "SOLD OUT",
                 "SOLD_OUT"   -> Availability.SOLD_OUT;
            default -> Availability.valueOf(value.trim().toUpperCase());
        };
    }

    /**
     * Resolves the authenticated User entity from the JWT principal.
     * Assumes UserDetails#getUsername() returns the user's email —
     * matches your JwtAuthFilter / UserDetailsService convention.
     * If your JwtAuthFilter wires a custom UserPrincipal carrying the
     * User id directly, swap this for a simpler cast instead of a DB hit.
     */
    private User resolveSellerFromPrincipal(UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResourceNotFoundException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found: " + userDetails.getUsername()));
    }
}