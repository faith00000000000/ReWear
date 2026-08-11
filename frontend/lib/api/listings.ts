import api from "@/lib/axios";
import { ListingResponseDTO } from "@/lib/types/listing";

// Extracted type union to match ListingResponseDTO['listingMode']
export type ListingMode = ListingResponseDTO["listingMode"];

// Standardized Spring Page response interface
export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface GetListingsParams {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: "asc" | "desc";
}

/**
 * Fetch paginated listings from backend
 */
export async function fetchListings(
    params: GetListingsParams = {}
): Promise<PageResponse<ListingResponseDTO>> {
    const { page = 0, size = 24, sortBy = "createdAt", direction = "desc" } = params;
    const { data } = await api.get<PageResponse<ListingResponseDTO>>("/api/listings", {
        params: { page, size, sortBy, direction },
    });
    return data;
}

/**
 * Fetch single listing by ID
 */
export async function fetchListingById(id: number | string): Promise<ListingResponseDTO> {
    const { data } = await api.get<ListingResponseDTO>(`/api/listings/${id}`);
    return data;
}

/**
 * Fetch listings published by a specific seller
 */
export async function fetchListingsBySeller(
    sellerId: number | string
): Promise<ListingResponseDTO[]> {
    const { data } = await api.get<ListingResponseDTO[]>(`/api/listings/seller/${sellerId}`);
    return data;
}

/**
 * Search listings using keyword query
 */
export async function searchListings(
    keyword: string,
    page = 0,
    size = 12
): Promise<PageResponse<ListingResponseDTO>> {
    const { data } = await api.get<PageResponse<ListingResponseDTO>>("/api/listings/search", {
        params: { keyword, page, size },
    });
    return data;
}

/**
 * Delete a listing and remove linked media assets
 */
export async function deleteListing(id: number | string): Promise<void> {
    await api.delete(`/api/listings/${id}`);
}

/**
 * Update listing metadata and media binaries
 */
export async function updateListing(
    id: number | string,
    formData: FormData
): Promise<ListingResponseDTO> {
    const { data } = await api.put<ListingResponseDTO>(`/api/listings/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
}

/**
 * Utility helper to filter listings matching a specific mode (or dual-mode listings)
 */
export function filterByMode(
    listings: ListingResponseDTO[],
    mode: ListingMode
): ListingResponseDTO[] {
    return listings.filter(
        (l) => l.listingMode === mode || l.listingMode === "THRIFT_AND_RENT"
    );
}