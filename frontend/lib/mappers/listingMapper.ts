// lib/mappers/listingMapper.ts
import { ListingResponseDTO } from "@/lib/types/listing";
import { Product, Status } from "@/lib/types/product";
import { CARE_INSTRUCTIONS } from "@/lib/constants/care";

function formatMoney(value: number | null): string | undefined {
    if (value === null || value === undefined) return undefined;
    return `Rs. ${value.toLocaleString("en-IN")}`;
}

function toDisplayStatus(mode: ListingResponseDTO["listingMode"]): Status {
    switch (mode) {
        case "THRIFT": return "THRIFT";
        case "RENT": return "RENT";
        case "THRIFT_AND_RENT": return "THRIFT + RENT";
    }
}

function toDisplayAvailability(
    a: ListingResponseDTO["availability"],
): Product["availability"] {
    switch (a) {
        case "AVAILABLE": return "Available";
        case "RESERVED": return "Reserved";
        case "SOLD_OUT": return "Sold Out";
    }
}

function toDisplayShipping(
    s: ListingResponseDTO["shippingOption"],
): Product["shippingOption"] {
    switch (s) {
        case "SHIPPING": return "Shipping";
        case "PICKUP": return "Pickup";
        case "FLEX": return "Flex (Both)";
    }
}

export function mapListingToProduct(dto: ListingResponseDTO): Product {
    // Gallery: only non-null photo URLs, front first since it's the
    // "primary" image used for card thumbnails elsewhere.
    const gallery = [
        dto.photoFrontUrl,
        dto.photoBackUrl,
        dto.photoLabelUrl,
        dto.photoDetailUrl,
    ].filter((url): url is string => Boolean(url));

    return {
        id: dto.id,
        name: dto.productTitle,
        status: toDisplayStatus(dto.listingMode),
        image: dto.photoFrontUrl ?? gallery[0] ?? "/images/placeholder.png",
        videoUrl: dto.videoUrl ?? undefined,
        gallery,
        price: formatMoney(dto.thriftPrice) ?? "Price unavailable",
        oldPrice: formatMoney(dto.originalPrice),
        rentalPrice: formatMoney(dto.rentPerDay),
        brand: dto.brand ?? undefined,
        size: dto.size,
        condition: dto.condition,
        color: dto.color,
        material: dto.material,
        description: dto.description ?? undefined,
        care: CARE_INSTRUCTIONS, // static — see lib/constants/care.ts
        availability: toDisplayAvailability(dto.availability),
        shippingOption: toDisplayShipping(dto.shippingOption),
        defectFlaws: dto.defectFlaws ?? undefined,
        rentDuration: undefined, // no booking system yet — keep undefined, never set
        seller: {
            id: dto.seller.id,
            name: dto.seller.fullName,
            avatarUrl: dto.seller.profilePictureUrl,
            initials: dto.seller.initials,
        },
    };
}

export function mapListingsToProducts(dtos: ListingResponseDTO[]): Product[] {
    return dtos.map(mapListingToProduct);
}