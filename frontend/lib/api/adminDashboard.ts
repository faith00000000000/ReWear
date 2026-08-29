import api from "@/lib/axios";

export interface AdminDashboard {
  metrics: { totalListings: number; totalUsers: number; totalDonations: number; totalEarnings: number };
  donations: { pending: number; confirmed: number; completed: number; rejected: number };
  earnings: { thriftCommission: number; rentalCommission: number; totalCommission: number };
  recentListings: Array<{ id: number; title: string; owner: string; type: string; status: string; createdAt: string }>;
  recentReports: Array<{ id: number; listingId: number; listing: string; reason: string; reportedBy: string; status: string; reportedAt: string }>;
}

export async function fetchAdminDashboard(signal?: AbortSignal) {
  return (await api.get<AdminDashboard>("/api/admin/dashboard", { signal })).data;
}
