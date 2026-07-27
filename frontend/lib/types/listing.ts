export interface ListingResponseDTO {
    id: number;
    productTitle: string;
    listingMode: "THRIFT" | "RENT" | "THRIFT_AND_RENT";
    clothingType?: string; // <--- Matches Java String clothingType
    gender?: string;
    brand?: string;
    styleOccasion?: string;
    tags?: string;

    // Photos & Media
    photoFrontUrl?: string;
    photoBackUrl?: string;
    photoLabelUrl?: string;
    photoDetailUrl?: string;
    videoUrl?: string;

    description?: string;
    size: string;
    condition: string;
    color: string;
    material: string;
    originalPrice?: number;
    availability: "AVAILABLE" | "RESERVED" | "SOLD_OUT";
    defectFlaws?: string;

    // Delivery
    deliveryOption?: "SHIPPING" | "PICKUP" | "FLEX";
    shippingAvailability?: string;
    shippingFeeType?: "FREE_SHIPPING" | "FIXED_FEE" | "DYNAMIC_SHIPPING";
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

    // Pricing
    thriftPrice?: number;
    rentPerDay?: number;
    securityDeposit?: number;

    status: string;
    seller: {
        id: number;
        fullName: string;
        profilePictureUrl: string | null;
        initials: string;
    };
    createdAt?: string;
    updatedAt?: string;
}