package com.rewear.backend.admin.dashboard.dto;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
public record AdminDashboardResponse(Metrics metrics,DonationPipeline donations,Earnings earnings,List<RecentListing> recentListings,List<RecentReport> recentReports) {
 public record Metrics(long totalListings,long totalUsers,long totalDonations,BigDecimal totalEarnings){}
 public record DonationPipeline(long pending,long confirmed,long completed,long rejected){}
 public record Earnings(BigDecimal thriftCommission,BigDecimal rentalCommission,BigDecimal totalCommission){}
 public record RecentListing(Long id,String title,String owner,String type,String status,LocalDateTime createdAt){}
 public record RecentReport(Long id,Long listingId,String listing,String reason,String reportedBy,String status,LocalDateTime reportedAt){}
}
