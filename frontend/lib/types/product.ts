// lib/types/product.ts
// Mirrors the original Product shape from products.ts, sourced from
// ListingResponseDTO now instead of a static array.

export type Status = "THRIFT" | "RENT" | "THRIFT + RENT";

export interface ProductSeller {
    id: number;
    name: string;
    avatarUrl: string | null;
    initials: string;
}

export interface Product {
    id: number;
    name: string;          // ← productTitle
    status: Status;        // ← listingMode, converted to display string
    image: string;          // ← photoFrontUrl (primary)
    videoUrl?: string;
    gallery: string[];       // ← all photo*Url fields, non-null only
    price: string;          // ← thriftPrice, formatted "Rs. X"
    oldPrice?: string;       // ← originalPrice, formatted (only if present)
    rentalPrice?: string;     // ← rentPerDay, formatted "Rs. X" (only if present)
    brand?: string;
    size: string;
    condition: string;
    color: string;
    material: string;
    description?: string;
    care: string[];          // static constant, NOT from backend — see CARE_INSTRUCTIONS
    availability: "Available" | "Reserved" | "Sold Out"; // ← availability enum, display string
    shippingOption: "Shipping" | "Pickup" | "Flex (Both)"; // ← shippingOption enum, display string
    defectFlaws?: string;     // ← defectFlaws (replaces old hardcoded note)
    rentDuration?: string;    // no backend source yet — always undefined, kept for future booking feature
    seller: ProductSeller;
}