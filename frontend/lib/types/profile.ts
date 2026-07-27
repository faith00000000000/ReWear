export type Profile = {
    id: number;
    name: string;
    avatarUrl?: string;
    isVerified: boolean;
    joinedDate: string;              // e.g. "May 2023"
    location?: string;
    shipsFrom?: string;
    fulfillment?: string;            // e.g. "Shipping & Local Pickup"
    activeDays?: string;             // e.g. "Mon – Sun"
    stats: {
        listingsPosted: number;
        activeItems: number;
        soldOrRented: number;
        savedByUsers: number;
    };
    /** Owner-only — must never be sent by the API for a public viewer */
    email?: string;
    phone?: string;
    preferredSizes?: string[];
};

export type RentalListing = {
    id: string;
    name: string;
    image: string;
    dueDate: string;                 // e.g. "Due in 2 days"
};

export type Donation = {
    id: string;
    name: string;
    image: string;
};

export type OrderStatus = "Delivered" | "Shipped" | "Completed" | "Processing";

export type Order = {
    id: string;
    orderNumber: string;             // e.g. "RW12345"
    itemName: string;
    itemImage: string;
    status: OrderStatus;
    date: string;                    // e.g. "May 15, 2025"
};