package com.rewear.backend.donation.repository;

import com.rewear.backend.donation.model.Organization;
import com.rewear.backend.donation.enums.OrganizationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {

    // Powers the public donation-form dropdown — only active orgs of the chosen type
    List<Organization> findByTypeAndActiveTrueOrderByNameAsc(OrganizationType type);
}
