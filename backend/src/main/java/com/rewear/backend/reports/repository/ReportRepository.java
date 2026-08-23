package com.rewear.backend.reports.repository;
import com.rewear.backend.reports.enums.ReportStatus;
import com.rewear.backend.reports.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

// JpaSpecificationExecutor lets the service build dynamic filters
// (status + listingType + search) without a pile of finder methods.
public interface ReportRepository extends JpaRepository<Report, Long>, JpaSpecificationExecutor<Report> {
    long countByStatus(ReportStatus status);
}