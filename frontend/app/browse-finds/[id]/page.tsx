// app/product-detail/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchListingById, fetchListings } from "@/lib/api/listings";
import { mapListingToProduct, mapListingsToProducts } from "@/lib/mappers/listingMapper";
import { Product } from "@/lib/types/product";
import ProductDetailClient from "./product-detail-client";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [dto, recsPage] = await Promise.all([
          fetchListingById(id),
          fetchListings({ page: 0, size: 8 }),
        ]);
        if (!cancelled) {
          setProduct(mapListingToProduct(dto));
          // Exclude the current item from its own recommendations row
          const recs = mapListingsToProducts(
              recsPage.content.filter((l) => String(l.id) !== String(id)),
          );
          setRecommendations(recs);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Listing not found or failed to load.");
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
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center">Loading listing…</div>;
  }

  if (error || !product) {
    return <div className="p-8 text-center text-red-600">{error ?? "Listing not found."}</div>;
  }

  return <ProductDetailClient product={product} recommendations={recommendations} />;
}