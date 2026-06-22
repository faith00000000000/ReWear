// lib/api/listings.ts
import api from "@/lib/axios"; // adjust to your actual axios instance path
import { ListingResponseDTO, PageResponse, ListingMode, Availability } from "@/lib/types/listing";

export interface GetListingsParams {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: "asc" | "desc";
}

export async function fetchListings(
    params: GetListingsParams = {},
): Promise<PageResponse<ListingResponseDTO>> {
    const { page = 0, size = 24, sortBy = "createdAt", direction = "desc" } = params;
    const { data } = await api.get<PageResponse<ListingResponseDTO>>("/api/listings", {
        params: { page, size, sortBy, direction },
    });
    return data;
}

export async function fetchListingById(id: number | string): Promise<ListingResponseDTO> {
    const { data } = await api.get<ListingResponseDTO>(`/api/listings/${id}`);
    return data;
}

export async function fetchListingsBySeller(
    sellerId: number | string,
): Promise<ListingResponseDTO[]> {
    const { data } = await api.get<ListingResponseDTO[]>(`/api/listings/seller/${sellerId}`);
    return data;
}

export async function searchListings(
    keyword: string,
    page = 0,
    size = 12,
): Promise<PageResponse<ListingResponseDTO>> {
    const { data } = await api.get<PageResponse<ListingResponseDTO>>("/api/listings/search", {
        params: { keyword, page, size },
    });
    return data;
}

export function filterByMode(
    listings: ListingResponseDTO[],
    mode: ListingMode,
): ListingResponseDTO[] {
    return listings.filter(
        (l) => l.listingMode === mode || l.listingMode === "THRIFT_AND_RENT",
    );
}