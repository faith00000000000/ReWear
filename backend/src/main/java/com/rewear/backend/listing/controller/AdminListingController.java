package com.rewear.backend.listing.controller;

import com.rewear.backend.listing.dto.response.ListingResponseDTO;
import com.rewear.backend.listing.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/listings")
@RequiredArgsConstructor
public class AdminListingController {

    private final ListingService listingService;

    @GetMapping
    public ResponseEntity<Page<ListingResponseDTO>> getAllListingsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        return ResponseEntity.ok(
                listingService.getAllListingsForAdmin(PageRequest.of(page, size, sort)));
    }
}