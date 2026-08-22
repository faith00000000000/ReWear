// Donation.java — add ONE nullable field. Nullable because a donation can
// still be submitted by a guest who isn't logged in; only donations made
// while authenticated get a donor_user_id and show up in "My Donations".
package com.rewear.backend.donation.model;

import com.rewear.backend.donation.enums.DonationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(name = "pickup_address", nullable = false)
    private String pickupAddress;

    @Column(name = "package_count", nullable = false)
    private String packageCount;

    @Column(name = "estimated_weight_kg", nullable = false)
    private Double estimatedWeightKg;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "agreed_to_disclaimer", nullable = false)
    private boolean agreedToDisclaimer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DonationStatus status = DonationStatus.PENDING;

    // NEW — nullable, set only when the donor was authenticated at submission
    // time. This is what "My Donations" filters on.
    @Column(name = "donor_user_id")
    private Long donorUserId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}