// listing/service/impl/ListingServiceImpl.java
package com.rewear.backend.listing.service.impl;

import com.rewear.backend.exception.MediaUploadException;
import com.rewear.backend.exception.ResourceNotFoundException;
import com.rewear.backend.listing.dto.request.ListingRequestDTO;
import com.rewear.backend.listing.dto.response.ListingResponseDTO;
import com.rewear.backend.listing.entity.Listing;
import com.rewear.backend.listing.enums.ListingStatus;
import com.rewear.backend.listing.mapper.ListingMapper;
import com.rewear.backend.listing.repository.ListingRepository;
import com.rewear.backend.listing.service.ListingService;
import com.rewear.backend.storage.SupabaseStorageService;
import com.rewear.backend.user.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ListingServiceImpl implements ListingService {

    private final ListingRepository      listingRepository;
    private final ListingMapper          listingMapper;
    private final SupabaseStorageService supabaseStorageService;

    // ── CREATE ─────────────────────────────────────────────────────────────

    @Override
    public ListingResponseDTO createListing(ListingRequestDTO request, User seller) {
        // 1. Map DTO to entity (status defaults to DRAFT inside mapper)
        Listing listing = listingMapper.toEntity(request, seller);

        // 2. Upload any provided media files to Supabase
        String folder = "seller-" + seller.getId();
        uploadMedia(listing, request, folder);

        // 3. Determine status from the "publish" button flag
        //    "Save Draft" -> DRAFT  |  "Publish Listing" -> PENDING_REVIEW
//        if (request.isPublish()) {
//            listing.setStatus(ListingStatus.PENDING_REVIEW);
//        }

        if (request.isPublish()) {
            listing.setStatus(ListingStatus.PUBLISHED);
        }

        Listing saved = listingRepository.save(listing);
        log.info("Listing created [id={}] [status={}]", saved.getId(), saved.getStatus());

        return listingMapper.toResponseDTO(saved);
    }

    // ── READ ──────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ListingResponseDTO getListingById(Long id) {
        // Uses the JOIN FETCH query so seller (name/photo) is loaded in the
        // same query — needed for the product detail page.
        Listing listing = listingRepository.findByIdWithSeller(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + id));
        return listingMapper.toResponseDTO(listing);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ListingResponseDTO> getAllListings(Pageable pageable) {
        return listingRepository
                .findByStatus(ListingStatus.PUBLISHED, pageable)
                .map(listingMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ListingResponseDTO> getListingsBySeller(Long sellerId) {
        return listingRepository
                .findBySeller_IdOrderByCreatedAtDesc(sellerId)
                .stream()
                .map(listingMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ListingResponseDTO> searchListings(String keyword, Pageable pageable) {
        return listingRepository
                .searchByTitle(keyword, pageable)
                .map(listingMapper::toResponseDTO);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────

    @Override
    public ListingResponseDTO updateListing(Long id, ListingRequestDTO request) {
        Listing existing = findOrThrow(id);

        // Apply changed text fields (nulls are skipped by the mapper)
        listingMapper.updateEntityFromDTO(request, existing);

        // Re-upload only the media files that were actually sent
        String folder = "seller-" + existing.getSeller().getId();
        replaceMediaIfProvided(existing, request, folder);

        // Promote from DRAFT to PENDING_REVIEW if publish button was pressed
//        if (request.isPublish() && existing.getStatus() == ListingStatus.DRAFT) {
//            existing.setStatus(ListingStatus.PENDING_REVIEW);
//        }

        if (request.isPublish() && existing.getStatus() == ListingStatus.DRAFT) {
            existing.setStatus(ListingStatus.PUBLISHED);
        }
        Listing updated = listingRepository.save(existing);
        log.info("Listing updated [id={}]", updated.getId());

        return listingMapper.toResponseDTO(updated);
    }

    @Override
    public ListingResponseDTO updateListingStatus(Long id, ListingStatus status) {
        Listing listing = findOrThrow(id);
        listing.setStatus(status);
        return listingMapper.toResponseDTO(listingRepository.save(listing));
    }

    // ── DELETE ────────────────────────────────────────────────────────────

    @Override
    public void deleteListing(Long id) {
        Listing listing = findOrThrow(id);

        // Remove all Supabase files before deleting the DB record
        deleteAllSupabaseMedia(listing);

        listingRepository.delete(listing);
        log.info("Listing deleted [id={}]", id);
    }

    // ──────────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────────

    private Listing findOrThrow(Long id) {
        return listingRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Listing not found with id: " + id));
    }

    /** Upload all provided files for a brand-new listing. */
    private void uploadMedia(Listing listing, ListingRequestDTO req, String folder) {
        try {
            if (present(req.getPhotoFront()))
                listing.setPhotoFrontUrl(supabaseStorageService.uploadPhoto(req.getPhotoFront(), folder));
            if (present(req.getPhotoBack()))
                listing.setPhotoBackUrl(supabaseStorageService.uploadPhoto(req.getPhotoBack(), folder));
            if (present(req.getPhotoLabel()))
                listing.setPhotoLabelUrl(supabaseStorageService.uploadPhoto(req.getPhotoLabel(), folder));
            if (present(req.getPhotoDetail()))
                listing.setPhotoDetailUrl(supabaseStorageService.uploadPhoto(req.getPhotoDetail(), folder));
            if (present(req.getVideo()))
                listing.setVideoUrl(supabaseStorageService.uploadVideo(req.getVideo(), folder));
        } catch (IOException e) {
            throw new MediaUploadException("Media upload failed: " + e.getMessage(), e);
        }
    }

    /** For updates: delete old Supabase file first, then upload the new one. */
    private void replaceMediaIfProvided(Listing existing, ListingRequestDTO req, String folder) {
        try {
            if (present(req.getPhotoFront())) {
                supabaseStorageService.deleteByUrl(existing.getPhotoFrontUrl());
                existing.setPhotoFrontUrl(supabaseStorageService.uploadPhoto(req.getPhotoFront(), folder));
            }
            if (present(req.getPhotoBack())) {
                supabaseStorageService.deleteByUrl(existing.getPhotoBackUrl());
                existing.setPhotoBackUrl(supabaseStorageService.uploadPhoto(req.getPhotoBack(), folder));
            }
            if (present(req.getPhotoLabel())) {
                supabaseStorageService.deleteByUrl(existing.getPhotoLabelUrl());
                existing.setPhotoLabelUrl(supabaseStorageService.uploadPhoto(req.getPhotoLabel(), folder));
            }
            if (present(req.getPhotoDetail())) {
                supabaseStorageService.deleteByUrl(existing.getPhotoDetailUrl());
                existing.setPhotoDetailUrl(supabaseStorageService.uploadPhoto(req.getPhotoDetail(), folder));
            }
            if (present(req.getVideo())) {
                supabaseStorageService.deleteByUrl(existing.getVideoUrl());
                existing.setVideoUrl(supabaseStorageService.uploadVideo(req.getVideo(), folder));
            }
        } catch (IOException e) {
            throw new MediaUploadException("Media update failed: " + e.getMessage(), e);
        }
    }

    private void deleteAllSupabaseMedia(Listing listing) {
        supabaseStorageService.deleteByUrl(listing.getPhotoFrontUrl());
        supabaseStorageService.deleteByUrl(listing.getPhotoBackUrl());
        supabaseStorageService.deleteByUrl(listing.getPhotoLabelUrl());
        supabaseStorageService.deleteByUrl(listing.getPhotoDetailUrl());
        supabaseStorageService.deleteByUrl(listing.getVideoUrl());
    }

    private boolean present(MultipartFile f) {
        return f != null && !f.isEmpty();
    }
}