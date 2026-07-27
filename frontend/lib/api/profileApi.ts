import api from "@/lib/axios";
import { Profile, RentalListing, Donation, Order } from "@/lib/types/profile";

export async function fetchProfile(userId: number | string): Promise<Profile | null> {
    try {
        const { data } = await api.get<any>(`/api/users/${userId}`);
        return mapUserResponseToProfile(data);
    } catch (err: any) {
        if (err?.response?.status === 404 || err?.response?.status === 401) {
            return null;
        }
        throw err;
    }
}

function mapUserResponseToProfile(dto: any): Profile {
    return {
        id: dto.id,
        name: dto.fullName,
        avatarUrl: dto.profilePictureUrl,
        isVerified: false,
        joinedDate: dto.createdAt ?? "",
        location: undefined,
        shipsFrom: undefined,
        fulfillment: undefined,
        activeDays: undefined,
        stats: {
            listingsPosted: 0,
            activeItems: 0,
            soldOrRented: 0,
            savedByUsers: 0,
        },
        email: dto.email,
        phone: dto.phone,          // now populated from backend
        preferredSizes: undefined,
    };
}

// NEW — updates just the phone number via the existing PATCH /api/users/{id}.
// Backend validates the 10-digit format server-side too (defense in depth —
// never trust client-side validation alone), so this can still throw on a
// bad value even if the modal's own check passed.
export async function updateUserPhone(userId: number | string, phone: string): Promise<void> {
    await api.patch(`/api/users/${userId}`, { phone });
}

export async function fetchRentals(userId: number | string): Promise<RentalListing[]> {
    const { data } = await api.get<RentalListing[]>(`/api/users/${userId}/rentals`);
    return data;
}

export async function fetchDonations(userId: number | string): Promise<Donation[]> {
    const { data } = await api.get<Donation[]>(`/api/users/${userId}/donations`);
    return data;
}

export async function fetchOrders(userId: number | string): Promise<Order[]> {
    const { data } = await api.get<Order[]>(`/api/users/${userId}/orders`);
    return data;
}