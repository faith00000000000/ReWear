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
                .defectFlaws(dto.getDefectFlaws())

                // Delivery Options
                .deliveryOption(dto.getDeliveryOption())
                .shippingAvailability(dto.getShippingAvailability())
                .shippingFeeType(dto.getShippingFeeType())
                .fixedShippingFee(dto.getFixedShippingFee())
                .rateWithinDistrict(dto.getRateWithinDistrict())
                .rateWithinProvince(dto.getRateWithinProvince())
                .rateNationwide(dto.getRateNationwide())
                .dispatchTime(dto.getDispatchTime())
                .pickupArea(dto.getPickupArea())
                .pickupLat(dto.getPickupLat())
                .pickupLng(dto.getPickupLng())
                .pickupResolvedAddress(dto.getPickupResolvedAddress())
                .pickupContactNumber(dto.getPickupContactNumber())
                .pickupDays(dto.getPickupDays())
                .pickupTimeFrom(dto.getPickupTimeFrom())
                .pickupTimeTo(dto.getPickupTimeTo())
                .pickupInstructions(dto.getPickupInstructions())
                .sameDayPickup(dto.isSameDayPickup())

                .thriftPrice(dto.getThriftPrice())
                .rentPerDay(dto.getRentPerDay())
                .securityDeposit(dto.getSecurityDeposit())
                .seller(seller)
                .status(ListingStatus.DRAFT)  // always starts as draft; service promotes if publish=true
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
                .defectFlaws(listing.getDefectFlaws())

                // Delivery Options
                .deliveryOption(listing.getDeliveryOption())
                .shippingAvailability(listing.getShippingAvailability())
                .shippingFeeType(listing.getShippingFeeType())
                .fixedShippingFee(listing.getFixedShippingFee())
                .rateWithinDistrict(listing.getRateWithinDistrict())
                .rateWithinProvince(listing.getRateWithinProvince())
                .rateNationwide(listing.getRateNationwide())
                .dispatchTime(listing.getDispatchTime())
                .pickupArea(listing.getPickupArea())
                .pickupLat(listing.getPickupLat())
                .pickupLng(listing.getPickupLng())
                .pickupResolvedAddress(listing.getPickupResolvedAddress())
                .pickupContactNumber(listing.getPickupContactNumber())
                .pickupDays(listing.getPickupDays())
                .pickupTimeFrom(listing.getPickupTimeFrom())
                .pickupTimeTo(listing.getPickupTimeTo())
                .pickupInstructions(listing.getPickupInstructions())
                .sameDayPickup(listing.isSameDayPickup())

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
     * Partial update: only overwrite non-null fields from the DTO
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
        if (dto.getDefectFlaws()  != null)  listing.setDefectFlaws(dto.getDefectFlaws());

        // Delivery Options
        if (dto.getDeliveryOption()        != null) listing.setDeliveryOption(dto.getDeliveryOption());
        if (dto.getShippingAvailability()  != null) listing.setShippingAvailability(dto.getShippingAvailability());
        if (dto.getShippingFeeType()       != null) listing.setShippingFeeType(dto.getShippingFeeType());
        if (dto.getFixedShippingFee()      != null) listing.setFixedShippingFee(dto.getFixedShippingFee());
        if (dto.getRateWithinDistrict()    != null) listing.setRateWithinDistrict(dto.getRateWithinDistrict());
        if (dto.getRateWithinProvince()    != null) listing.setRateWithinProvince(dto.getRateWithinProvince());
        if (dto.getRateNationwide()        != null) listing.setRateNationwide(dto.getRateNationwide());
        if (dto.getDispatchTime()          != null) listing.setDispatchTime(dto.getDispatchTime());
        if (dto.getPickupArea()            != null) listing.setPickupArea(dto.getPickupArea());
        if (dto.getPickupLat()             != null) listing.setPickupLat(dto.getPickupLat());
        if (dto.getPickupLng()             != null) listing.setPickupLng(dto.getPickupLng());
        if (dto.getPickupResolvedAddress() != null) listing.setPickupResolvedAddress(dto.getPickupResolvedAddress());
        if (dto.getPickupContactNumber()   != null) listing.setPickupContactNumber(dto.getPickupContactNumber());
        if (dto.getPickupDays()            != null) listing.setPickupDays(dto.getPickupDays());
        if (dto.getPickupTimeFrom()        != null) listing.setPickupTimeFrom(dto.getPickupTimeFrom());
        if (dto.getPickupTimeTo()          != null) listing.setPickupTimeTo(dto.getPickupTimeTo());
        if (dto.getPickupInstructions()    != null) listing.setPickupInstructions(dto.getPickupInstructions());
        listing.setSameDayPickup(dto.isSameDayPickup());

        if (dto.getThriftPrice()  != null)  listing.setThriftPrice(dto.getThriftPrice());
        if (dto.getRentPerDay()   != null)  listing.setRentPerDay(dto.getRentPerDay());
        if (dto.getSecurityDeposit()!= null) listing.setSecurityDeposit(dto.getSecurityDeposit());
    }
}