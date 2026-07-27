// lib/types/product.ts

export type Status = "THRIFT" | "RENT" | "THRIFT + RENT";

export interface ProductSeller {
    id: number;
    name: string;
    avatarUrl: string | null;
    initials: string;
}

export interface Product {
    id: number;
    name: string;
    status: Status;

    category?: string; // <--- ADD THIS LINE HERE

    image: string;
    videoUrl?: string;
    gallery: string[];

    price: string;
    priceValue: number;
    oldPrice?: string;
    rentalPrice?: string;
    rentPerDay?: number;

    securityDeposit?: string;
    securityDepositValue?: number;

    brand?: string;
    size: string;
    condition: string;
    color: string;
    material: string;
    description?: string;
    care: string[];

    availability: "Available" | "Reserved" | "Sold Out";

    // ==========================
    // Delivery Fields
    // ==========================
    deliveryOption?: "SHIPPING" | "PICKUP" | "FLEX";

    shippingAvailability?: string;
    shippingFeeType?:
        | "FREE_SHIPPING"
        | "FIXED_FEE"
        | "DYNAMIC_SHIPPING";

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
    pickupDays?: string[];
    pickupTimeFrom?: string;
    pickupTimeTo?: string;
    pickupInstructions?: string;
    sameDayPickup?: boolean;

    // ==========================
    // Misc
    // ==========================
    defectFlaws?: string;
    rentDuration?: string;

    seller: ProductSeller;
}