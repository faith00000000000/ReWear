import { ListingResponseDTO } from '@/lib/types/listing';

// Matches com.rewear.backend.listing.enums.ListingStatus exactly
export type BackendListingStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED';

export type AdminListingType = 'thrift' | 'rent';

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
  raw: ListingResponseDTO; // full DTO — powers the detail modal
}
