export type AdminUserRole = 'BUYER' | 'SELLER' | 'HYBRID';
export type AdminUserStatus = 'ACTIVE' | 'FLAGGED' | 'BANNED';

export interface AdminUser {
  id: number; // used only to target API calls (ban/inspect) — never render this in the UI
  fullName: string;
  email: string;
  phone: string | null;
  profilePictureUrl: string | null;
  role: AdminUserRole;
  status: AdminUserStatus;
  joinedDate: string; // ISO date string, e.g. "2026-07-01"
  totalOrders: number;
  totalListings: number;
  banReason: string | null;
}
