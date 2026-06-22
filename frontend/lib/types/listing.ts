// lib/types/listing.ts
export type ListingMode = "THRIFT" | "RENT" | "THRIFT_AND_RENT";
export type Availability = "AVAILABLE" | "RESERVED" | "SOLD_OUT";
export type ShippingOptions = "SHIPPING" | "PICKUP" | "FLEX";
export type ListingStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED";

export interface SellerSummaryDto {
    id: number;
    fullName: string;
    profilePictureUrl: string | null;
    initials: string;
}

export interface ListingResponseDTO {
    id: number;
    productTitle: string;
    listingMode: ListingMode;
    clothingType: string;
    gender: string;
    brand: string | null;
    styleOccasion: string | null;
    tags: string | null;

    photoFrontUrl: string | null;
    photoBackUrl: string | null;
    photoLabelUrl: string | null;
    photoDetailUrl: string | null;
    videoUrl: string | null;

    description: string | null;

    size: string;
    condition: string;
    color: string;
    material: string;
    originalPrice: number | null;
    availability: Availability;
    shippingOption: ShippingOptions;
    defectFlaws: string | null;

    thriftPrice: number | null;
    rentPerDay: number | null;
    securityDeposit: number | null;

    status: ListingStatus;
    seller: SellerSummaryDto;
    createdAt: string;
    updatedAt: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}