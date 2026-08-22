import api from "@/lib/axios";
import { Profile, RentalListing, Order } from "@/lib/types/profile";

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

export type UserStats = {
    listingsPosted: number;
    activeItems: number;
    soldOrRented: number;
};

export async function fetchUserStats(userId: string | number): Promise<UserStats> {
    const { data } = await api.get<UserStats>(`/api/users/${userId}/stats`);
    return data;
}
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

function formatJoinedDate(createdAt: string | undefined): string {
    if (!createdAt) return "";
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return "";
    // "May 2023" — matches the Profile type's documented format
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function mapUserResponseToProfile(dto: any): Profile {
    return {
        id: dto.id,
        name: dto.fullName,
        avatarUrl: dto.profilePictureUrl,
        isVerified: false,
        joinedDate: formatJoinedDate(dto.createdAt), // was: dto.createdAt ?? ""
        location: undefined,
        shipsFrom: undefined,
        fulfillment: undefined,
        activeDays: undefined,
        stats: {
            // Real values computed client-side in ProfileClient.tsx from the
            // `listings` prop it already has — see Fix 2. Left at 0 here only
            // as a safe default for the brief window before that runs, and
            // for soldOrRented/savedByUsers, which have no data source yet
            // (see note below).
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

/* ── Profile picture upload — sends the raw File as multipart/form-data
   to the backend, which uploads it to Supabase Storage and persists the
   resulting public URL against the user row (same `profilePictureUrl`
   field that mapUserResponseToProfile already reads on GET /api/users/{id}).
   Frontend never talks to Supabase directly — it only ever sees the URL
   the backend hands back, same as any other field on the user record.

   NOTE: endpoint path/method assumed as PATCH /api/users/{id}/profile-picture
   to mirror the existing PATCH /api/users/{id} pattern above — adjust the
   path here if the actual backend controller uses a different route. */
export async function updateUserAvatar(
    userId: string | number,
    file: File
): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.patch<{ profilePictureUrl: string }>(
        `/api/users/${userId}/profile-picture`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );

    return { avatarUrl: data.profilePictureUrl };
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