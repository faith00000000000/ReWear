// lib/api/adminListings.ts
import api from '@/lib/axios'; // <-- adjust import path to wherever your axios instance from the snippet actually lives
import { ListingResponseDTO } from '@/lib/types/listing';
import { BackendListingStatus } from '@/lib/types/admin-listing';

/**
 * Fetches listings for the admin moderation table.
 *
 * ⚠️ IMPORTANT BACKEND GAP:
 * Your current `ListingServiceImpl.getAllListings()` filters to
 * `status = PUBLISHED` only (see `findByStatus(ListingStatus.PUBLISHED, ...)`
 * in the service you pasted). That means DRAFT / PENDING_REVIEW / REJECTED
 * listings will NEVER show up here for an admin to moderate — the table
 * will only ever show already-approved items.
 *
 * You need one small backend change, e.g. either:
 *   - a new admin endpoint: GET /api/admin/listings (no status filter, or
 *     an optional ?status= param), or
 *   - modify GET /api/listings to accept an optional status query param
 *     that admins can use to see everything.
 *
 * Until that exists, this hits the same /api/listings endpoint — swap the
 * URL below the moment the admin endpoint exists.
 */
export async function fetchAdminListings(page = 0, size = 50) {
  const { data } = await api.get('/api/admin/listings', {
    params: { page, size, sortBy: 'createdAt', direction: 'desc' },
  });
  return data.content as ListingResponseDTO[];
}

async function updateListingStatus(id: number, status: BackendListingStatus) {
  const { data } = await api.patch<ListingResponseDTO>(
    `/api/listings/${id}/status`,
    null,
    { params: { status } },
  );
  return data;
}

export function approveListing(id: number) {
  return updateListingStatus(id, 'PUBLISHED');
}

export function rejectListing(id: number) {
  return updateListingStatus(id, 'REJECTED');
}

export async function deleteListingById(id: number) {
  await api.delete(`/api/listings/${id}`);
}
