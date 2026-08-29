package com.rewear.backend.admin.dashboard.service;
import com.rewear.backend.admin.dashboard.dto.AdminDashboardResponse;
import com.rewear.backend.listing.repository.ListingRepository;
import com.rewear.backend.user.repository.UserRepository;
import com.rewear.backend.donation.repository.DonationRepository;
import com.rewear.backend.donation.enums.DonationStatus;
import com.rewear.backend.reports.repository.ReportRepository;
import com.rewear.backend.earnings.service.EarningsService;
import com.rewear.backend.user.enums.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
@Service @RequiredArgsConstructor
public class AdminDashboardService {
 private final ListingRepository listings;private final UserRepository users;private final DonationRepository donations;private final ReportRepository reports;private final EarningsService earnings;
 @Transactional(readOnly=true)
 public AdminDashboardResponse overview(String email) {
  var admin=users.findByEmail(email).orElseThrow(()->new ResponseStatusException(HttpStatus.FORBIDDEN));
  if(admin.getRole()!=Role.ADMIN||!Boolean.TRUE.equals(admin.getIsActive())||admin.getStatus()==UserStatus.BANNED)throw new ResponseStatusException(HttpStatus.FORBIDDEN);
  var income=earnings.dashboard(email,"all","",0,1).metrics();
  return new AdminDashboardResponse(
   new AdminDashboardResponse.Metrics(listings.count(),users.count(),donations.count(),income.totalCommission()),
   new AdminDashboardResponse.DonationPipeline(donations.countByStatus(DonationStatus.PENDING),donations.countByStatus(DonationStatus.CONFIRMED),donations.countByStatus(DonationStatus.COMPLETED),donations.countByStatus(DonationStatus.REJECTED)),
   new AdminDashboardResponse.Earnings(income.thriftCommission(),income.rentCommission(),income.totalCommission()),
   listings.findTop5ByOrderByCreatedAtDesc().stream().map(l->new AdminDashboardResponse.RecentListing(l.getId(),l.getProductTitle(),l.getSeller().getFullName(),l.getListingMode().name(),l.getStatus().name(),l.getCreatedAt())).toList(),
   reports.findTop5ByOrderByReportedAtDesc().stream().map(x->new AdminDashboardResponse.RecentReport(x.getId(),x.getListingId(),x.getItemTitle(),x.getReason(),x.getReporterName(),x.getStatus().name(),x.getReportedAt())).toList());
 }
}
