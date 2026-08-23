// lib/api/reportApi.ts
import api from '@/lib/axios';

export type ReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

// Matches ListingMode on the backend exactly — THRIFT_AND_RENT is the real
// value; "FLEX" only ever appears as a display label (see listingTypeLabel below).
export type ListingType = 'THRIFT' | 'RENT' | 'THRIFT_AND_RENT';

export type ReportActionTaken =
    | 'NONE'
    | 'WARNING_ISSUED'
    | 'LISTING_HIDDEN'
    | 'LISTING_REMOVED'
    | 'SELLER_SUSPENDED';

export interface ReportResponse {
    id: number;
    listingId: number;
    itemTitle: string;
    itemImage: string;
    listingType: ListingType;
    price: number;
    sellerId: number;
    sellerName: string;
    reporterId: number;
    reporterName: string;
    reporterEmail: string;
    reason: string;
    details: string | null;
    status: ReportStatus;
    actionTaken: ReportActionTaken;
    adminNote: string | null;
    reviewedBy: string | null;
    reportedAt: string;
    resolvedAt: string | null;
    updatedAt: string | null;
}

export interface ReportStatsResponse {
    total: number;
    pending: number;
    investigating: number;
    resolved: number;
    dismissed: number;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface ReportFilters {
    status?: ReportStatus | 'all';
    listingType?: ListingType | 'all';
    search?: string;
    page?: number;
    size?: number;
}

// Single source of truth for the THRIFT_AND_RENT → "Flex" relabel.
// Import this anywhere you render a listingType instead of hardcoding strings.
export function listingTypeLabel(type: ListingType): string {
    switch (type) {
        case 'THRIFT_AND_RENT':
            return 'FLEX';
        case 'THRIFT':
            return 'THRIFT';
        case 'RENT':
            return 'RENT';
    }
}

export async function fetchReports(filters: ReportFilters = {}): Promise<PageResponse<ReportResponse>> {
    const params: Record<string, string | number> = {
        page: filters.page ?? 0,
        size: filters.size ?? 20,
    };
    if (filters.status && filters.status !== 'all') params.status = filters.status;
    if (filters.listingType && filters.listingType !== 'all') params.listingType = filters.listingType;
    if (filters.search) params.search = filters.search;

    const { data } = await api.get<PageResponse<ReportResponse>>('/api/reports', { params });
    return data;
}

export async function fetchReportStats(): Promise<ReportStatsResponse> {
    const { data } = await api.get<ReportStatsResponse>('/api/reports/stats');
    return data;
}

export interface UpdateReportStatusPayload {
    status: ReportStatus;
    actionTaken?: ReportActionTaken;
    adminNote?: string;
}

export async function updateReportStatus(
    id: number,
    payload: UpdateReportStatusPayload,
): Promise<ReportResponse> {
    const { data } = await api.patch<ReportResponse>(`/api/reports/${id}/status`, payload);
    return data;
}