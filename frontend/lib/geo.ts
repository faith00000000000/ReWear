// Shared between the List Item and Edit Listing pages. Both pin a seller's
// origin on a map and need to resolve that pin to a Nepali district/province
// via reverse geocoding — this used to be copy-pasted in both places.

export const NEPAL_PROVINCES = [
    "Koshi",
    "Madhesh",
    "Bagmati",
    "Gandaki",
    "Lumbini",
    "Karnali",
    "Sudurpashchim",
] as const;

export type NepalProvince = (typeof NEPAL_PROVINCES)[number];

function normalizeForMatch(s: string): string {
    return s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z]/g, "");
}

function levenshteinDistance(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] =
                a[i - 1] === b[j - 1]
                    ? dp[i - 1][j - 1]
                    : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[m][n];
}

/**
 * Best-effort fuzzy match of a free-text "state" string (from Nominatim's
 * reverse-geocode response) to one of Nepal's seven provinces. Falls back to
 * matching "Province No. 1" / "Province No. 2" style names for provinces
 * that haven't fully transitioned to their official names in OSM data.
 */
export function matchProvince(raw: string | undefined): NepalProvince | "" {
    if (!raw) return "";

    const words = raw
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z\s]/g, "")
        .split(/\s+/)
        .filter(Boolean);

    let best: NepalProvince | "" = "";
    let bestDist = Infinity;
    for (const word of words) {
        for (const province of NEPAL_PROVINCES) {
            const dist = levenshteinDistance(word, province.toLowerCase());
            if (dist <= 2 && dist < bestDist) {
                bestDist = dist;
                best = province;
            }
        }
    }
    if (best) return best;

    const flat = normalizeForMatch(raw);
    const lower = raw.toLowerCase();
    if (/province\s*(no\.?\s*)?1\b/.test(lower) || flat.includes("provinceno1")) return "Koshi";
    if (/province\s*(no\.?\s*)?2\b/.test(lower) || flat.includes("provinceno2")) return "Madhesh";
    return "";
}

interface ReverseGeocodeResult {
    district: string;
    province: NepalProvince | "";
    displayName: string;
}

/**
 * Reverse-geocode a lat/lng via Nominatim and resolve it to a
 * district + matched Nepali province. Returns null on any network/parse
 * failure — callers should treat that as "couldn't resolve" and fall back
 * to whatever the form already has, rather than throwing.
 */
export async function reverseGeocodeToDistrictProvince(
    lat: number,
    lng: number
): Promise<ReverseGeocodeResult | null> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            { headers: { Accept: "application/json" } }
        );
        if (!res.ok) return null;

        const data = await res.json();
        const addr = data.address ?? {};
        const districtCandidates: (string | undefined)[] = [
            addr.state_district,
            addr.county,
            addr.city_district,
            addr.district,
            addr.city,
            addr.town,
        ];
        const district =
            districtCandidates.find((v) => v && !normalizeForMatch(v).includes("province")) ?? "";

        return {
            district,
            province: matchProvince(addr.state),
            displayName: data.display_name ?? "",
        };
    } catch {
        return null;
    }
}