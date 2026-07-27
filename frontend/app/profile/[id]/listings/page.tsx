import { notFound } from "next/navigation";
import { fetchProfile } from "@/lib/api/profileApi";
import { fetchListingsBySeller } from "@/lib/api/listings";
import { mapListingsToProducts } from "@/lib/mappers/listingMapper";
import SellerListingsClient from "./SellerListingsClient";

export default async function SellerListingsPage({
                                                     params,
                                                 }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const profile = await fetchProfile(id);
    if (!profile) notFound();

    const rawListings = await fetchListingsBySeller(id);
    const listings = mapListingsToProducts(rawListings);

    return <SellerListingsClient profile={profile} listings={listings} />;
}