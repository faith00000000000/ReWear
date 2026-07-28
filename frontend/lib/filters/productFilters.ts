// frontend/lib/filters/productFilters.ts

import { Product } from "@/lib/types/product";

export interface FilterSectionConfig {
    id: string;
    title: string;
    options: string[];
}

export const DELIVERY_OPTION_LABELS: Record<string, string> = {
    SHIPPING: "Shipping",
    PICKUP: "Pickup",
    FLEX: "Flex (Both)",
};

// section id -> which Product field it reads
export const FILTER_FIELD_MAP: Record<string, keyof Product> = {
    category: "category",
    gender: "gender",
    brand: "brand",
    size: "size",
    condition: "condition",
    color: "color",
    material: "material",
    occasion: "styleOccasion",
    listingMode: "status",
    availability: "availability",
    delivery: "deliveryOption",
};

const SECTION_TITLES: Record<string, string> = {
    category: "Category",
    gender: "Gender",
    brand: "Brand",
    size: "Size",
    condition: "Condition",
    color: "Color",
    material: "Material",
    occasion: "Style / Occasion",
    listingMode: "Listing Mode",
    availability: "Availability",
    delivery: "Delivery Option",
};

function displayValue(product: Product, sectionId: string): string | undefined {
    const field = FILTER_FIELD_MAP[sectionId];
    if (!field) return undefined;
    const raw = product[field];
    if (typeof raw !== "string" || !raw.trim()) return undefined;
    if (sectionId === "delivery") return DELIVERY_OPTION_LABELS[raw] ?? raw;
    return raw;
}

/**
 * Builds filter sections dynamically from whatever attribute values
 * actually exist on the fetched listings, instead of hardcoded options.
 * A section only appears if at least one product has a value for it —
 * so if a seller lists a brand/color/etc that's never been seen before,
 * it shows up automatically with zero code changes.
 */
export function buildFilterSections(
    products: Product[],
    sectionIds: string[]
): FilterSectionConfig[] {
    const sections: FilterSectionConfig[] = [];

    for (const id of sectionIds) {
        const values = new Set<string>();
        for (const product of products) {
            const v = displayValue(product, id);
            if (v) values.add(v);
        }
        if (values.size > 0) {
            sections.push({
                id,
                title: SECTION_TITLES[id] ?? id,
                options: Array.from(values).sort((a, b) => a.localeCompare(b)),
            });
        }
    }

    return sections;
}

/** True if a product matches ALL currently-selected filter groups. */
export function matchesSelectedFilters(
    product: Product,
    selectedFilters: Record<string, string[]>
): boolean {
    for (const [sectionId, selectedOptions] of Object.entries(selectedFilters)) {
        if (!selectedOptions.length) continue;
        const productValue = displayValue(product, sectionId);
        if (!productValue) return false;
        const match = selectedOptions.some(
            (opt) => opt.toLowerCase() === productValue.toLowerCase()
        );
        if (!match) return false;
    }
    return true;
}