// Mirrors backend `ListingResponseDTO.java`. Keep these two in sync —
// whenever a field is added on the backend, add it here too, or TS will
// silently type it as `any`/`undefined` instead of catching the drift.

export type ListingMode = "THRIFT" | "RENT" | "THRIFT_AND_RENT";
export type Availability = "AVAILABLE" | "RESERVED" | "SOLD_OUT";
export type DeliveryOption = "SHIPPING" | "PICKUP" | "FLEX";
export type ShippingFeeType = "FREE_SHIPPING" | "FIXED_FEE" | "DYNAMIC_SHIPPING";

export interface SellerSummaryDto {
    id: number;
    fullName: string;
    profilePictureUrl: string | null;
    initials: string;
}

export interface ListingResponseDTO {
    id: number;

    // Section 1 — Basic info
    productTitle: string;
    listingMode: ListingMode;
    clothingType?: string;
    gender?: string;
    brand?: string;
    styleOccasion?: string;
    tags?: string;

    // Section 2 — Media (Supabase public URLs)
    photoFrontUrl?: string;
    photoBackUrl?: string;
    photoLabelUrl?: string;
    photoDetailUrl?: string;
    videoUrl?: string;

    // Section 3 — Description
    description?: string;

    // Section 4 — Item attributes
    size: string;
    condition: string;
    color: string;
    material: string;
    originalPrice?: number;
    availability: Availability;
    defectFlaws?: string;

    // Section 5 — Delivery options
    deliveryOption?: DeliveryOption;

    // Dynamic Shipping origin, resolved from the seller's map pin
    sellerDistrict?: string;
    sellerProvince?: string;

    shippingAvailability?: string;
    shippingFeeType?: ShippingFeeType;
    fixedShippingFee?: number;
    rateWithinDistrict?: number;
    rateWithinProvince?: number;
    rateNationwide?: number;
    dispatchTime?: string;

    pickupArea?: string;
    pickupLat?: number;
    pickupLng?: number;
    pickupResolvedAddress?: string;
    pickupContactNumber?: string;
    pickupDays?: string;
    pickupTimeFrom?: string;
    pickupTimeTo?: string;
    pickupInstructions?: string;
    sameDayPickup?: boolean;

    // Section 6 — Pricing
    thriftPrice?: number;
    rentPerDay?: number;
    rentedFrom?: string | null;
    rentedTo?: string | null;
    securityDeposit?: number;

    // Meta
    status: string;
    seller: SellerSummaryDto;
    createdAt?: string;
    updatedAt?: string;
}