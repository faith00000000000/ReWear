package com.rewear.backend.donation.repository;

import com.rewear.backend.donation.model.Donation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DonationRepository extends JpaRepository<Donation, Long> {
    // DonationRepository.java — add this alongside whatever's already there
    List<Donation> findByDonorUserIdOrderByCreatedAtDesc(Long donorUserId);
    long countByStatus(com.rewear.backend.donation.enums.DonationStatus status);
}