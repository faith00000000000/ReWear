// lib/types/listing.ts

export type ListingMode =
    | "THRIFT"
    | "RENT"
    | "THRIFT_AND_RENT";

export type Availability =
    | "AVAILABLE"
    | "RESERVED"
    | "SOLD_OUT";

export type DeliveryOption =
    | "SHIPPING"
    | "PICKUP"
    | "FLEX";

export type ShippingFeeType =
    | "FREE_SHIPPING"
    | "FIXED_FEE"
    | "DYNAMIC_SHIPPING";

export type ListingStatus =
    | "DRAFT"
    | "PENDING_REVIEW"
    | "PUBLISHED"
    | "REJECTED";

export interface SellerSummaryDto {
    id: number;
    fullName: string;
    profilePictureUrl: string | null;
    initials: string;
}

export interface ListingResponseDTO {
    id: number;

    // Section 1
    productTitle: string;
    listingMode: ListingMode;
    clothingType: string;
    gender: string;
    brand: string | null;
    styleOccasion: string | null;
    tags: string | null;

    // Section 2
    photoFrontUrl: string | null;
    photoBackUrl: string | null;
    photoLabelUrl: string | null;
    photoDetailUrl: string | null;
    videoUrl: string | null;

    // Section 3
    description: string | null;

    // Section 4
    size: string;
    condition: string;
    color: string;
    material: string;
    originalPrice: number | null;
    availability: Availability;
    defectFlaws: string | null;

    // ==========================
    // Section 5 - Delivery
    // ==========================
    deliveryOption: DeliveryOption;

    shippingAvailability: string | null;
    shippingFeeType: ShippingFeeType | null;

    fixedShippingFee: number | null;
    rateWithinDistrict: number | null;
    rateWithinProvince: number | null;
    rateNationwide: number | null;

    dispatchTime: string | null;

    pickupArea: string | null;
    pickupLat: number | null;
    pickupLng: number | null;
    pickupResolvedAddress: string | null;
    pickupContactNumber: string | null;
    pickupDays: string | null;
    pickupTimeFrom: string | null;
    pickupTimeTo: string | null;
    pickupInstructions: string | null;
    sameDayPickup: boolean;

    // ==========================
    // Section 6
    // ==========================
    thriftPrice: number | null;
    rentPerDay: number | null;
    securityDeposit: number | null;

    // Meta
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