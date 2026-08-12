import { notFound } from "next/navigation";
import { fetchProfile } from "@/lib/api/profileApi";
import { fetchListingsBySeller } from "@/lib/api/listings";
import { mapListingsToProducts } from "@/lib/mappers/listingMapper";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage({
                                              params,
                                          }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const sellerListings = await fetchListingsBySeller(id);
    const listings = mapListingsToProducts(sellerListings);

    return (
        <ProfileClient
            userId={id}
            listings={listings}
        />
    );
}