// hooks/useListings.ts
"use client";

import { useEffect, useState } from "react";
import { fetchListings, GetListingsParams } from "@/lib/api/listings";
import { mapListingsToProducts } from "@/lib/mappers/listingMapper";
import { Product } from "@/lib/types/product";

interface UseListingsResult {
    products: Product[];
    loading: boolean;
    error: string | null;
}

export function useListings(params: GetListingsParams = {}): UseListingsResult {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Stringify params so the effect doesn't refire on every render from a
    // new object literal with the same values.
    const paramsKey = JSON.stringify(params);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const page = await fetchListings(params);
                if (!cancelled) {
                    setProducts(mapListingsToProducts(page.content));
                }
            } catch (err) {
                if (!cancelled) {
                    setError("Failed to load listings. Please try again.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramsKey]);

    return { products, loading, error };
}