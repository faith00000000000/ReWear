// lib/types/admin-listing.ts

// NOTE: Adjust these string literals to EXACTLY match your backend's
// com.rewear.backend.listing.enums.ListingStatus constants.
// Assumed here based on what ListingServiceImpl references (DRAFT, PUBLISHED)
// plus the moderation states this page needs (PENDING_REVIEW, REJECTED, REMOVED).
// If your real enum uses different names, just edit this union — every other
// file below reads status generically and doesn't hardcode the strings except
// where noted in adminListings.ts.
export type BackendListingStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'REMOVED';

export type AdminListingType = 'thrift' | 'rent';

// Minimal shape the admin table/modal actually needs — matches the
// ListingItem interface you specified, plus an `id` (required to call
// the status/delete endpoints).
export interface AdminListingItem {
  id: number;
  title: string;
  image: string;
  type: AdminListingType;
  price: number;
  sellerName: string;
  sellerAvatar: string;
  status: BackendListingStatus;
  reportsCount: number;
  createdAt: string;
}
