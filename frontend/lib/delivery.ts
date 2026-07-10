import type { Product } from "@/lib/types/product";

/* ══════════════════════════════════════════════════════════
   DELIVERY STRATEGY LAYER
   ------------------------------------------------------------
   Single place that turns the two raw DB columns

       delivery_option:   SHIPPING | PICKUP | FLEX
       shipping_fee_type: FREE_SHIPPING | FIXED_FEE | DYNAMIC_SHIPPING

   into one `DeliveryMode`. Every component (tags, Buy Now modal,
   checkout, price calculation) branches on that ONE value instead
   of re-deriving option/fee combinations locally.
══════════════════════════════════════════════════════════ */

/* ─── Bridge type — until Product officially carries these
   delivery fields. Values coming from the backend may be raw
   DB enums OR pretty display strings — every normalizer below
   accepts both shapes. ─────────────────────────────────────── */
export type ProductDeliveryFields = {
    shippingAvailability?: string;
    deliveryOption?: "SHIPPING" | "PICKUP" | "FLEX" | string;
    shippingFeeType?: string; // FREE_SHIPPING | FIXED_FEE | DYNAMIC_SHIPPING (or display strings)
    fixedShippingFee?: string | number;
    rateNationwide?: string | number;
    rateWithinDistrict?: string | number;
    rateWithinProvince?: string | number;
    dispatchTime?: string;
    pickupArea?: string;
    pickupLat?: string | number;
    pickupLng?: string | number;
    pickupResolvedAddress?: string;
    pickupContactNumber?: string;
    pickupInstructions?: string;
    pickupDays?: string[];
    pickupTimeFrom?: string;
    pickupTimeTo?: string;
    sameDayPickup?: boolean | number;
};

export type DeliverableProduct = Product & ProductDeliveryFields;

export type DeliveryMode =
    | "SHIPPING_FREE"
    | "SHIPPING_FIXED"
    | "SHIPPING_DYNAMIC"
    | "PICKUP"
    | "FLEX";

export type DistanceBucket = "DISTRICT" | "PROVINCE" | "NATIONWIDE";
export type DeliveryChannel = "shipping" | "pickup";

/* ─── Raw-value normalizers ──────────────────────────────────
   Handles BOTH shapes seen in the wild:
   - Raw DB enum: "SHIPPING" | "PICKUP" | "FLEX"
   - Display string: "Shipping" | "Pickup" | "Flex (Both)"
   Strips spaces/underscores/parens and uppercases before
   matching, so any casing/format variant lands correctly. ──── */
export function normalizeFulfillment(option?: string): DeliveryChannel | "flex" {
    const s = (option ?? "").toUpperCase().replace(/[\s_()]/g, "");
    if (s.includes("FLEX") || s.includes("BOTH")) return "flex";
    if (s.includes("PICKUP")) return "pickup";
    return "shipping";
}

/* Returns "unknown" (never silently "free") when the field is
   missing, so a listing never gets mislabeled as free shipping
   by default. */
export function normalizeShippingFeeType(value?: string): "free" | "fixed" | "dynamic" | "unknown" {
    if (!value) return "unknown";
    const s = value.toUpperCase().replace(/[\s_]/g, "");
    if (s.includes("FREE")) return "free";
    if (s.includes("FIXED")) return "fixed";
    if (s.includes("DYNAMIC")) return "dynamic";
    return "unknown";
}

/* ─── THE resolver — every other function in this file, and
   every component in the UI, derives its behaviour from this
   single value. ─────────────────────────────────────────────── */
export function getDeliveryMode(product: ProductDeliveryFields): DeliveryMode {
    const option = normalizeFulfillment(product.deliveryOption);

    if (option === "pickup") return "PICKUP";
    if (option === "flex") return "FLEX";

    // option === "shipping"
    const fee = normalizeShippingFeeType(product.shippingFeeType);
    if (fee === "free") return "SHIPPING_FREE";
    if (fee === "fixed") return "SHIPPING_FIXED";
    if (fee === "dynamic") return "SHIPPING_DYNAMIC";

    // Fee type missing on a shipping listing — treat as fixed
    // (defaulting to 0) rather than "free", since "free" is a
    // claim we never want to make without explicit backend data.
    return "SHIPPING_FIXED";
}

export function deliveryChannelsFor(product: ProductDeliveryFields): {
    hasShipping: boolean;
    hasPickup: boolean;
} {
    const mode = getDeliveryMode(product);
    return {
        hasShipping: mode !== "PICKUP",
        hasPickup: mode === "PICKUP" || mode === "FLEX",
    };
}

/* ─── Numeric coercion — DB may send numbers, strings, or
   comma-formatted strings ("1,499"). ────────────────────────── */
export function toNumber(value?: string | number): number {
    if (value === undefined || value === null) return 0;
    if (typeof value === "number") return value;
    return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
}

/* ─── Haversine distance (km) — used to bucket Dynamic Shipping
   into within-district / within-province / nationwide rates. ── */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function resolveDistanceBucket(km: number): DistanceBucket {
    if (km <= 15) return "DISTRICT";
    if (km <= 150) return "PROVINCE";
    return "NATIONWIDE";
}

/* ─── Fee calculator for the two "pure" modes (non-FLEX) ─────
   `bucket` is only consulted for SHIPPING_DYNAMIC. Returns
   `null` to mean "can't be calculated yet" (e.g. buyer hasn't
   pinned an address) — callers must NOT treat null as 0. ───── */
export function calculateDeliveryFee(
    product: ProductDeliveryFields,
    bucket?: DistanceBucket | null,
): number | null {
    const mode = getDeliveryMode(product);
    return calculateFeeForMode(product, mode, bucket);
}

/* FLEX has no single fee — it's really "shipping OR pickup" —
   so once the buyer picks a channel, resolve the fee as if the
   listing were a plain shipping/pickup listing on that channel. */
export function calculateFlexDeliveryFee(
    product: ProductDeliveryFields,
    channel: DeliveryChannel,
    bucket?: DistanceBucket | null,
): number | null {
    if (channel === "pickup") return 0;

    const feeKind = normalizeShippingFeeType(product.shippingFeeType);
    const syntheticMode: DeliveryMode =
        feeKind === "free" ? "SHIPPING_FREE" : feeKind === "dynamic" ? "SHIPPING_DYNAMIC" : "SHIPPING_FIXED";

    return calculateFeeForMode(product, syntheticMode, bucket);
}

function calculateFeeForMode(
    product: ProductDeliveryFields,
    mode: DeliveryMode,
    bucket?: DistanceBucket | null,
): number | null {
    switch (mode) {
        case "PICKUP":
            return 0;
        case "SHIPPING_FREE":
            return 0;
        case "SHIPPING_FIXED":
            return toNumber(product.fixedShippingFee);
        case "SHIPPING_DYNAMIC": {
            if (!bucket) return null; // not yet calculable — buyer hasn't pinned an address
            if (bucket === "DISTRICT") return toNumber(product.rateWithinDistrict) || toNumber(product.rateNationwide);
            if (bucket === "PROVINCE") return toNumber(product.rateWithinProvince) || toNumber(product.rateNationwide);
            return toNumber(product.rateNationwide);
        }
        case "FLEX":
            // Should never be reached directly — callers resolve FLEX via
            // calculateFlexDeliveryFee() once a channel is chosen.
            return null;
    }
}

export function isDynamicShipping(product: ProductDeliveryFields, channel?: DeliveryChannel): boolean {
    const mode = getDeliveryMode(product);
    if (mode === "SHIPPING_DYNAMIC") return true;
    if (mode === "FLEX" && channel === "shipping") {
        return normalizeShippingFeeType(product.shippingFeeType) === "dynamic";
    }
    return false;
}

/* ─── Pickup schedule formatter ───────────────────────────────
   "Mon, Wed, Fri" for a partial week, "All Days" when every day
   (or no explicit list) is provided. ─────────────────────────── */
const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function formatPickupDays(days?: string[]): string {
    if (!days || days.length === 0 || days.length >= 7) return "All Days";
    const normalized = days.map((d) => d.slice(0, 3));
    const isEveryDay = ALL_DAYS.every((d) => normalized.includes(d));
    return isEveryDay ? "All Days" : normalized.join(", ");
}