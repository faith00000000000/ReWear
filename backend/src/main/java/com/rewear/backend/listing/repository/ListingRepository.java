// listing/repository/ListingRepository.java
package com.rewear.backend.listing.repository;

import com.rewear.backend.listing.entity.Listing;
import com.rewear.backend.listing.enums.Availability;
import com.rewear.backend.listing.enums.ListingMode;
import com.rewear.backend.listing.enums.ListingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select l from Listing l where l.id=:id")
    Optional<Listing> lockListing(@Param("id") Long id);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths="seller")
    java.util.List<Listing> findTop5ByOrderByCreatedAtDesc();

    // All listings by seller, newest first
    List<Listing> findBySeller_IdOrderByCreatedAtDesc(Long sellerId);

    // Paginated listings filtered by status
    Page<Listing> findByStatus(ListingStatus status, Pageable pageable);

    // Filter by listing mode AND status
    Page<Listing> findByListingModeAndStatus(
            ListingMode listingMode,
            ListingStatus status,
            Pageable pageable
    );

    // Filter by availability AND status
    Page<Listing> findByAvailabilityAndStatus(
            Availability availability,
            ListingStatus status,
            Pageable pageable
    );

    // Ownership check (seller can only touch their own listings)
    Optional<Listing> findByIdAndSeller_Id(Long id, Long sellerId);

    // Single-listing fetch WITH seller eagerly loaded — use this for the
    // product detail page endpoint so seller name/image come in one query
    // and you avoid LazyInitializationException outside the transaction.
    @Query("SELECT l FROM Listing l JOIN FETCH l.seller WHERE l.id = :id")
    Optional<Listing> findByIdWithSeller(@Param("id") Long id);

    // Full-text title search on published listings
    @Query("""
            SELECT l FROM Listing l
            WHERE l.status = 'PUBLISHED'
            AND LOWER(l.productTitle) LIKE LOWER(CONCAT('%', :keyword, '%'))
            """)
    Page<Listing> searchByTitle(@Param("keyword") String keyword, Pageable pageable);

    // Count active listings per seller (useful for dashboard)
    long countBySeller_IdAndStatus(Long sellerId, ListingStatus status);

    // in ListingRepository
        long countBySellerId(Long sellerId);


    // Powers the "Active Items" stat
    long countBySellerIdAndAvailability(Long sellerId, Availability availability);

    // Powers the "Sold / Rented" stat — RESERVED covers active rentals,
    // SOLD_OUT covers completed thrift sales
    long countBySellerIdAndAvailabilityIn(Long sellerId, Collection<Availability> availabilities);

    // Public browse feed: published AND not sold out. RESERVED rent items
    // stay visible (with a "Reserved" tag on the frontend) — only SOLD_OUT
    // thrift items disappear.
    @Query("""
        SELECT l FROM Listing l
        WHERE l.status = :status
        AND l.availability <> :hiddenAvailability
        """)
    Page<Listing> findByStatusAndAvailabilityNot(
            @Param("status") ListingStatus status,
            @Param("hiddenAvailability") Availability hiddenAvailability,
            Pageable pageable
    );
}
