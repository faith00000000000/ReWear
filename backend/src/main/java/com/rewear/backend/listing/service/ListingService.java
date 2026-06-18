// listing/service/ListingService.java
package com.rewear.backend.listing.service;

import com.rewear.backend.listing.dto.request.ListingRequestDTO;
import com.rewear.backend.listing.dto.response.ListingResponseDTO;
import com.rewear.backend.listing.enums.ListingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ListingService {

    // Create a new listing (Draft or Pending Review, depending on publish flag)
    ListingResponseDTO createListing(ListingRequestDTO request);

    // Get a single listing by ID
    ListingResponseDTO getListingById(Long id);

    // Get all published listings, paginated (for browse/homepage)
    Page<ListingResponseDTO> getAllListings(Pageable pageable);

    // Get all listings belonging to a specific seller (any status)
    List<ListingResponseDTO> getListingsBySeller(Long sellerId);

    // Search published listings by title keyword, paginated
    Page<ListingResponseDTO> searchListings(String keyword, Pageable pageable);

    // Update a listing — partial update, only changed fields applied
    ListingResponseDTO updateListing(Long id, ListingRequestDTO request);

    // Change listing status directly (e.g. admin moderation: PENDING_REVIEW -> PUBLISHED)
    ListingResponseDTO updateListingStatus(Long id, ListingStatus status);

    // Delete a listing and remove its associated Supabase media
    void deleteListing(Long id);
}