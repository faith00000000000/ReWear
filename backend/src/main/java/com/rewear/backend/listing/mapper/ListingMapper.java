// listing/mapper/ListingMapper.java
package com.rewear.backend.listing.mapper;

import com.rewear.backend.listing.dto.request.ListingRequestDTO;
import com.rewear.backend.listing.dto.response.ListingResponseDTO;
import com.rewear.backend.listing.entity.Listing;
import com.rewear.backend.listing.enums.Availability;
import com.rewear.backend.listing.enums.ListingStatus;
import com.rewear.backend.user.model.User;
import org.springframework.stereotype.Component;

@Component
public class ListingMapper {

    /**
     * RequestDTO -> new Listing entity.
     * Media URLs and status are intentionally excluded here;
     * they are set by the service after Supabase upload.
     * Seller is passed in separately by the service (resolved from JWT principal),
     * not taken from the DTO, to avoid trusting a client-supplied seller id.
     */
    public Listing toEntity(ListingRequestDTO dto, User seller) {
        return Listing.builder()
                .productTitle(dto.getProductTitle())
                .listingMode(dto.getListingMode())
                .clothingType(dto.getClothingType())
                .gender(dto.getGender())
                .brand(dto.getBrand())
                .styleOccasion(dto.getStyleOccasion())
                .tags(dto.getTags())
                .description(dto.getDescription())
                .size(dto.getSize())
                .condition(dto.getCondition())
                .color(dto.getColor())
                .material(dto.getMaterial())
                .originalPrice(dto.getOriginalPrice())
                .availability(
                        dto.getAvailability() != null
                                ? dto.getAvailability()
                                : Availability.AVAILABLE
                )
                .shippingOption(dto.getShippingOption())
                .defectFlaws(dto.getDefectFlaws())
                .thriftPrice(dto.getThriftPrice())
                .rentPerDay(dto.getRentPerDay())
                .securityDeposit(dto.getSecurityDeposit())
                .seller(seller)
                .status(ListingStatus.DRAFT)  // always starts as draft
                .build();
    }

    /**
     * Listing entity -> Response DTO.
     */
    public ListingResponseDTO toResponseDTO(Listing listing) {
        return ListingResponseDTO.builder()
                .id(listing.getId())
                .productTitle(listing.getProductTitle())
                .listingMode(listing.getListingMode())
                .clothingType(listing.getClothingType())
                .gender(listing.getGender())
                .brand(listing.getBrand())
                .styleOccasion(listing.getStyleOccasion())
                .tags(listing.getTags())
                .photoFrontUrl(listing.getPhotoFrontUrl())
                .photoBackUrl(listing.getPhotoBackUrl())
                .photoLabelUrl(listing.getPhotoLabelUrl())
                .photoDetailUrl(listing.getPhotoDetailUrl())
                .videoUrl(listing.getVideoUrl())
                .description(listing.getDescription())
                .size(listing.getSize())
                .condition(listing.getCondition())
                .color(listing.getColor())
                .material(listing.getMaterial())
                .originalPrice(listing.getOriginalPrice())
                .availability(listing.getAvailability())
                .shippingOption(listing.getShippingOption())
                .defectFlaws(listing.getDefectFlaws())
                .thriftPrice(listing.getThriftPrice())
                .rentPerDay(listing.getRentPerDay())
                .securityDeposit(listing.getSecurityDeposit())
                .status(listing.getStatus())
                .seller(SellerMapper.toSellerSummary(listing.getSeller()))
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }

    /**
     * Partial update: only overwrite non-null text fields from the DTO
     * onto an existing entity. Media URLs handled separately in service.
     * Seller is intentionally never reassigned on update.
     */
    public void updateEntityFromDTO(ListingRequestDTO dto, Listing listing) {
        if (dto.getProductTitle() != null)  listing.setProductTitle(dto.getProductTitle());
        if (dto.getListingMode()  != null)  listing.setListingMode(dto.getListingMode());
        if (dto.getClothingType() != null)  listing.setClothingType(dto.getClothingType());
        if (dto.getGender()       != null)  listing.setGender(dto.getGender());
        if (dto.getBrand()        != null)  listing.setBrand(dto.getBrand());
        if (dto.getStyleOccasion()!= null)  listing.setStyleOccasion(dto.getStyleOccasion());
        if (dto.getTags()         != null)  listing.setTags(dto.getTags());
        if (dto.getDescription()  != null)  listing.setDescription(dto.getDescription());
        if (dto.getSize()         != null)  listing.setSize(dto.getSize());
        if (dto.getCondition()    != null)  listing.setCondition(dto.getCondition());
        if (dto.getColor()        != null)  listing.setColor(dto.getColor());
        if (dto.getMaterial()     != null)  listing.setMaterial(dto.getMaterial());
        if (dto.getOriginalPrice()!= null)  listing.setOriginalPrice(dto.getOriginalPrice());
        if (dto.getAvailability() != null)  listing.setAvailability(dto.getAvailability());
        if (dto.getShippingOption()!= null) listing.setShippingOption(dto.getShippingOption());
        if (dto.getDefectFlaws()  != null)  listing.setDefectFlaws(dto.getDefectFlaws());
        if (dto.getThriftPrice()  != null)  listing.setThriftPrice(dto.getThriftPrice());
        if (dto.getRentPerDay()   != null)  listing.setRentPerDay(dto.getRentPerDay());
        if (dto.getSecurityDeposit()!= null) listing.setSecurityDeposit(dto.getSecurityDeposit());
    }
}