// frontend/lib/mappers/listingMapper.ts

import { ListingResponseDTO } from "@/lib/types/listing";
import { Product, Status } from "@/lib/types/product";
import { CARE_INSTRUCTIONS } from "@/lib/constants/care";

function formatMoney(value: number | null | undefined): string | undefined {
    if (value == null) return undefined;
    return `Rs. ${value.toLocaleString("en-IN")}`;
}

function toDisplayStatus(
    mode: ListingResponseDTO["listingMode"]
): Status {
    switch (mode) {
        case "THRIFT":
            return "THRIFT";

        case "RENT":
            return "RENT";

        case "THRIFT_AND_RENT":
            return "THRIFT + RENT";

        default:
            return "THRIFT";
    }
}

function toDisplayAvailability(
    availability: ListingResponseDTO["availability"]
): Product["availability"] {
    switch (availability) {
        case "AVAILABLE":
            return "Available";

        case "RESERVED":
            return "Reserved";

        case "SOLD_OUT":
            return "Sold Out";

        default:
            return "Available";
    }
}

function formatRentDuration(from?: string | null, to?: string | null): string | undefined {
    if (!from || !to) return undefined;
    const fmt = (iso: string) =>
        new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    return `${fmt(from)} to ${fmt(to)}`;
}

export function mapListingToProduct(
    dto: ListingResponseDTO
): Product {
    const gallery: string[] = [
        dto.photoFrontUrl,
        dto.photoBackUrl,
        dto.photoLabelUrl,
        dto.photoDetailUrl,
    ].filter((url): url is string => Boolean(url));

    return {
        id: dto.id,
        name: dto.productTitle,
        category: dto.clothingType ?? undefined,
        gender: dto.gender ?? undefined,
        styleOccasion: dto.styleOccasion ?? undefined,
        status: toDisplayStatus(dto.listingMode),

        image:
            dto.photoFrontUrl ??
            gallery[0] ??
            "/images/placeholder.png",

        videoUrl: dto.videoUrl ?? undefined,
        gallery,

        price:
            formatMoney(dto.thriftPrice) ??
            "Price unavailable",

        priceValue: dto.thriftPrice ?? 0,

        oldPrice: formatMoney(dto.originalPrice),
        rentalPrice: formatMoney(dto.rentPerDay),
        rentPerDay: dto.rentPerDay ?? undefined,
        rentDuration: formatRentDuration(dto.rentedFrom, dto.rentedTo),

        securityDeposit: formatMoney(dto.securityDeposit),
        securityDepositValue: dto.securityDeposit ?? 0,

        brand: dto.brand ?? undefined,
        size: dto.size,
        condition: dto.condition,
        color: dto.color,
        material: dto.material,
        description: dto.description ?? undefined,

        care: CARE_INSTRUCTIONS,
        availability: toDisplayAvailability(
            dto.availability
        ),

        // ==========================
        // Delivery Fields
        // ==========================
        deliveryOption: dto.deliveryOption,

        sellerDistrict:
            dto.sellerDistrict ?? undefined,

        sellerProvince:
            dto.sellerProvince ?? undefined,

        shippingAvailability:
            dto.shippingAvailability ?? undefined,

        shippingFeeType:
            dto.shippingFeeType ?? undefined,

        fixedShippingFee:
            dto.fixedShippingFee ?? undefined,

        rateWithinDistrict:
            dto.rateWithinDistrict ?? undefined,

        rateWithinProvince:
            dto.rateWithinProvince ?? undefined,

        rateNationwide:
            dto.rateNationwide ?? undefined,

        dispatchTime:
            dto.dispatchTime ?? undefined,

        pickupArea:
            dto.pickupArea ?? undefined,

        pickupLat:
            dto.pickupLat ?? undefined,

        pickupLng:
            dto.pickupLng ?? undefined,

        pickupResolvedAddress:
            dto.pickupResolvedAddress ?? undefined,

        pickupContactNumber:
            dto.pickupContactNumber ?? undefined,

        pickupDays: dto.pickupDays
            ? dto.pickupDays
                .split(",")
                .map((d: string) => d.trim())
                .filter(Boolean)
            : undefined,

        pickupTimeFrom:
            dto.pickupTimeFrom ?? undefined,

        pickupTimeTo:
            dto.pickupTimeTo ?? undefined,

        pickupInstructions:
            dto.pickupInstructions ?? undefined,

        sameDayPickup:
            dto.sameDayPickup ?? false,

        // ==========================
        // Misc
        // ==========================
        defectFlaws:
            dto.defectFlaws ?? undefined,

        seller: {
            id: dto.seller.id,
            name: dto.seller.fullName,
            avatarUrl:
            dto.seller.profilePictureUrl,
            initials: dto.seller.initials,
        },
    };
}

export function mapListingsToProducts(
    dtos: ListingResponseDTO[]
): Product[] {
    return dtos.map((dto) => mapListingToProduct(dto));
}