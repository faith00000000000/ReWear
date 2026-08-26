import api from "@/lib/axios";
import { ListingMode, ListingResponseDTO } from "@/lib/types/listing";

export type { ListingMode };

/** Standard Spring Data `Page<T>` shape, as serialized to JSON. */
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

export type SortDirection = "asc" | "desc";

export interface GetListingsParams {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: SortDirection;
}

/** Centralized defaults so every paginated call agrees on the same shape. */
const DEFAULT_LISTINGS_PARAMS: Required<GetListingsParams> = {
    page: 0,
    size: 24,
    sortBy: "createdAt",
    direction: "desc",
};

const DEFAULT_SEARCH_PAGE_SIZE = 12;

const LISTINGS_BASE_PATH = "/api/listings";

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/**
 * Fetch a paginated page of listings.
 */
export async function fetchListings(
    params: GetListingsParams = {}
): Promise<PageResponse<ListingResponseDTO>> {
    const query = { ...DEFAULT_LISTINGS_PARAMS, ...params };
    const { data } = await api.get<PageResponse<ListingResponseDTO>>(
        LISTINGS_BASE_PATH,
        { params: query }
    );
    return data;
}

/**
 * Fetch a single listing by its id.
 */
export async function fetchListingById(
    id: number | string
): Promise<ListingResponseDTO> {
    const { data } = await api.get<ListingResponseDTO>(
        `${LISTINGS_BASE_PATH}/${id}`
    );
    return data;
}

/**
 * Fetch every listing published by a given seller.
 * Note: unlike `fetchListings`, this endpoint returns a plain array, not a page.
 */
export async function fetchListingsBySeller(
    sellerId: number | string
): Promise<ListingResponseDTO[]> {
    const { data } = await api.get<ListingResponseDTO[]>(
        `${LISTINGS_BASE_PATH}/seller/${sellerId}`
    );
    return data;
}

/**
 * Search listings by free-text keyword.
 */
export async function searchListings(
    keyword: string,
    page = 0,
    size = DEFAULT_SEARCH_PAGE_SIZE
): Promise<PageResponse<ListingResponseDTO>> {
    const { data } = await api.get<PageResponse<ListingResponseDTO>>(
        `${LISTINGS_BASE_PATH}/search`,
        { params: { keyword, page, size } }
    );
    return data;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

/**
 * Update a listing's metadata and any replaced media files.
 */
export async function updateListing(
    id: number | string,
    formData: FormData
): Promise<ListingResponseDTO> {
    const { data } = await api.put<ListingResponseDTO>(
        `${LISTINGS_BASE_PATH}/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
}

/**
 * Delete a listing and its linked media assets.
 */
export async function deleteListing(id: number | string): Promise<void> {
    await api.delete(`${LISTINGS_BASE_PATH}/${id}`);
}

// ---------------------------------------------------------------------------
// Client-side helpers
// ---------------------------------------------------------------------------

/**
 * Filter a list of listings down to a specific mode, always including
 * dual-mode listings since they satisfy either mode.
 */
export function filterByMode(
    listings: ListingResponseDTO[],
    mode: ListingMode
): ListingResponseDTO[] {
    return listings.filter(
        (listing) =>
            listing.listingMode === mode || listing.listingMode === "THRIFT_AND_RENT"
    );
}