import api from "@/lib/axios";
import { Profile, RentalListing, Donation, Order } from "@/lib/types/profile";

/* ══════════════════════════════════════════════════════════
   Shared raw shape returned by GET /api/orders (matches backend
   OrderResponse DTO). Defined ONCE here so ActiveRentals, the
   profile summary card, and the full Order History page all
   read from the same contract instead of drifting independently.
══════════════════════════════════════════════════════════ */
export type OrderItemStatus = "THRIFT" | "RENT" | "THRIFT + RENT";

export type RawOrderItem = {
    listingId: number;
    name: string;
    image: string;
    price: string;
    status: OrderItemStatus;
    rentalStart?: string | null;
    rentalEnd?: string | null;
    rentalDays?: number | null;
    returnDeadline?: string | null;
};

export type RawOrder = {
    id: number;
    status: string; // "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED"
    totalAmountNpr: number;
    createdAt: string;
    items: RawOrderItem[];
};

/* /api/orders is scoped to the authenticated user server-side (via the
   auth principal in OrderController), so it always returns "my" orders.
   Everything below just filters/reshapes this one response. */
async function fetchConfirmedOrders(): Promise<RawOrder[]> {
    const { data } = await api.get<RawOrder[]>("/api/orders");
    return data.filter((o) => o.status === "CONFIRMED");
}

export async function fetchProfile(userId: string | number): Promise<Profile | null> {
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
        phone: dto.phone,
        preferredSizes: undefined,
    };
}

export async function updateUserPhone(userId: string | number, phone: string): Promise<void> {
    await api.patch(`/api/users/${userId}`, { phone });
}

/* ── Active Rentals — derived from real orders, not a separate endpoint
   Filters confirmed orders down to RENT / THRIFT+RENT line items.
   `userId` is unused now (kept for call-site compatibility / possible
   future admin-viewing-another-user use case) since /api/orders is
   scoped to the caller by the backend. */
export async function fetchRentals(userId: string | number): Promise<RentalListing[]> {
    const orders = await fetchConfirmedOrders();
    return orders
        .flatMap((o) => o.items)
        .filter((i) => i.status === "RENT" || i.status === "THRIFT + RENT")
        .map((i) => ({
            id: String(i.listingId),
            name: i.name,
            image: i.image,
            dueDate: i.rentalEnd ?? "N/A",
        }));
}

/* Donations still hit their own dedicated endpoint — unchanged, no
   /api/orders overlap for these. */
export async function fetchDonations(userId: string | number): Promise<Donation[]> {
    const { data } = await api.get<Donation[]>(`/api/users/${userId}/donations`);
    return data;
}

/* ── Order History (summary) — flattens each confirmed order's items into
   individual rows for the profile dashboard preview card. Full detail
   lives on /order-history via fetchOrderHistory below. ── */
export async function fetchOrders(userId: string | number): Promise<Order[]> {
    const orders = await fetchConfirmedOrders();
    return orders
        .flatMap((o) =>
            o.items.map((item, idx) => ({
                id: `${o.id}-${idx}`,
                orderNumber: String(o.id),
                itemName: item.name,
                itemImage: item.image,
                status: "Completed" as const,
                date: new Date(o.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                }),
            }))
        )
        .reverse();
}

/* ── Order History (full detail) — for the dedicated /order-history page.
   Returns the raw confirmed orders with all item fields (price, rental
   dates, etc.) intact, instead of each page redefining its own copy of
   the /api/orders response shape. */
export async function fetchOrderHistory(): Promise<RawOrder[]> {
    return fetchConfirmedOrders();
}