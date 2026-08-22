import api from '@/lib/axios';

/* ============================================================
   TYPES — mirror donation.md exactly (Organization / Donation)
============================================================ */

export type OrganizationType = 'NGO' | 'INGO';

export type DonationStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'COMPLETED'
    | 'REJECTED';

export interface Organization {
    id: number;
    name: string;
    type: OrganizationType;
    description: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface OrganizationRequest {
    name: string;
    type: OrganizationType;
    description?: string;
    // Optional/nullable so `update` can distinguish "not provided" from
    // "explicitly set to false" — omit on create to default to true.
    active?: boolean;
}

export interface Donation {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    pickupAddress: string;
    packageCount: string;
    estimatedWeightKg: number;
    notes: string | null;
    organization: Organization;
    agreedToDisclaimer: boolean;
    status: DonationStatus;
    createdAt: string;
}

export interface DonationRequest {
    fullName: string;
    email: string;
    phone: string;
    pickupAddress: string;
    packageCount: string;
    estimatedWeightKg: number;
    notes?: string;
    organizationId: number;
    agreedToDisclaimer: boolean;
}


export const DONATION_STATUS_STYLES: Record<DonationStatus, string> = {
    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
    CONFIRMED: "bg-blue-50 text-blue-800 border-blue-200",
    COMPLETED: "bg-[#EAF2E8] text-[#3D5C30] border-[#CFE3C8]",
    REJECTED: "bg-red-50 text-[#9E2A1B] border-red-200",
};
/* ============================================================
   PUBLIC ENDPOINTS — no auth required
============================================================ */

// GET /api/organizations?type=NGO|INGO — active orgs only, for the form dropdown
export async function getActiveOrganizations(
    type: OrganizationType,
): Promise<Organization[]> {
    const { data } = await api.get<Organization[]>('/api/organizations', {
        params: { type },
    });
    return data;
}

// POST /api/donations — public form submission
export async function createDonation(
    payload: DonationRequest,
): Promise<Donation> {
    const { data } = await api.post<Donation>('/api/donations', payload);
    return data;
}

/* ============================================================
   ADMIN ENDPOINTS — require Bearer token w/ ROLE_ADMIN
============================================================ */

// --- Organizations ---

export async function getAllOrganizations(): Promise<Organization[]> {
    const { data } = await api.get<Organization[]>(
        '/api/admin/organizations',
    );
    return data;
}

export async function getOrganizationById(
    id: number,
): Promise<Organization> {
    const { data } = await api.get<Organization>(
        `/api/admin/organizations/${id}`,
    );
    return data;
}

export async function createOrganization(
    payload: OrganizationRequest,
): Promise<Organization> {
    const { data } = await api.post<Organization>(
        '/api/admin/organizations',
        payload,
    );
    return data;
}

export async function updateOrganization(
    id: number,
    payload: OrganizationRequest,
): Promise<Organization> {
    const { data } = await api.put<Organization>(
        `/api/admin/organizations/${id}`,
        payload,
    );
    return data;
}

export async function deleteOrganization(id: number): Promise<void> {
    await api.delete(`/api/admin/organizations/${id}`);
}

// --- Donations ---

export async function getAllDonations(): Promise<Donation[]> {
    const { data } = await api.get<Donation[]>('/api/admin/donations');
    return data;
}

export async function getDonationById(id: number): Promise<Donation> {
    const { data } = await api.get<Donation>(`/api/admin/donations/${id}`);
    return data;
}

export async function updateDonationStatus(
    id: number,
    status: DonationStatus,
): Promise<Donation> {
    const { data } = await api.patch<Donation>(
        `/api/admin/donations/${id}/status`,
        { status },
    );
    return data;
}

// Add to the PUBLIC/user-scoped section of donationApi.ts
// GET /api/donations/mine — requires the user to be logged in (JWT attached
// automatically by the axios interceptor in lib/axios.ts)
export async function getMyDonations(): Promise<Donation[]> {
    const { data } = await api.get<Donation[]>('/api/donations/mine');
    return data;
}