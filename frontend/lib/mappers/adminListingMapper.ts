// lib/mappers/adminListingMapper.ts
import { ListingResponseDTO } from '@/lib/types/listing';
import { AdminListingItem, AdminListingType } from '@/lib/types/admin-listing';

function toAdminType(
  mode: ListingResponseDTO['listingMode'],
): AdminListingType {
  // THRIFT_AND_RENT (hybrid) listings collapse to "thrift" here since the
  // admin table has one type/price column. rentPerDay is still on the DTO
  // if you ever need to surface both prices for hybrids.
  return mode === 'RENT' ? 'rent' : 'thrift';
}

function toAdminPrice(dto: ListingResponseDTO): number {
  if (dto.listingMode === 'RENT') return dto.rentPerDay ?? 0;
  return dto.thriftPrice ?? dto.rentPerDay ?? 0;
}

export function mapListingToAdminItem(
  dto: ListingResponseDTO,
): AdminListingItem {
  return {
    id: dto.id,
    title: dto.productTitle,
    image: dto.photoFrontUrl || '/images/placeholder.png',
    type: toAdminType(dto.listingMode),
    price: toAdminPrice(dto),
    sellerName: dto.seller?.fullName ?? 'Unknown seller',
    sellerAvatar:
      dto.seller?.profilePictureUrl ?? '/images/avatar-placeholder.png',
    status: dto.status as AdminListingItem['status'],
    reportsCount:
      (dto as unknown as { reportsCount?: number }).reportsCount ?? 0,
    createdAt: dto.createdAt as unknown as string,
    raw: dto,
  };
}
export function mapListingsToAdminItems(
  dtos: ListingResponseDTO[],
): AdminListingItem[] {
  return dtos.map(mapListingToAdminItem);
}
