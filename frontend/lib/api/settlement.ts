import api from "@/lib/axios";
import { isAxiosError } from "axios";
export const npr = (value: number | null) => value == null ? "Needs review" : new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", minimumFractionDigits: 2 }).format(value);
export function apiError(error: unknown) {
  if (isAxiosError(error)) return error.response?.data?.message || error.response?.data?.detail || "Request failed. Please refresh and retry.";
  return "Request failed. Please try again.";
}
export interface Rental {
 id: number; listingId: number; name: string; image: string; startDate: string; endDate: string;
 buyerName: string; sellerName: string; buyerSide: boolean; sellerSide: boolean;
 state: "ACTIVE" | "CANCELLED" | "RETURNED"; canCancel: boolean; canReturn: boolean;
 actionBlockReason: string | null; rentalFee: number | null; deposit: number | null;
 cancellationFee: number | null; refundDue: number | null; refundState: string | null;
}
export interface Withdrawal { id: number; amount: number; gateway: string; account: string; status: string; createdAt: string; }
export interface Wallet {
 totalEarned: number; pendingRentalEarnings: number; availableBalance: number; reservedForWithdrawal: number; withdrawn: number;
 entries: { itemId: number; name: string; type: string; state: string; fee: number; commission: number; net: number; available: boolean }[];
 withdrawals: Withdrawal[]; reviewCount: number; providerPayoutEnabled: boolean; providerNotice: string;
}
export interface Settlement {
 depositsHeld: number; depositsAwaitingReturn: number; refundsDue: number; cancellationFees: number; reservedWithdrawals: number; reviewCount: number;
 rentals: { itemId: number; itemName: string; buyerName: string; state: string; deposit: number; refundDue: number; refundState: string | null; gateway: string; providerReference: string | null }[];
 withdrawals: Withdrawal[];
}
export const getRentals = (signal?: AbortSignal) => api.get<Rental[]>("/api/rentals", { signal }).then(r => r.data);
export const closeRental = (id: number, action: "cancel" | "return") => api.post<Rental>(`/api/rentals/${id}/${action}`).then(r => r.data);
export const getWallet = (signal?: AbortSignal) => api.get<Wallet>("/api/seller/earnings", { signal }).then(r => r.data);
export const requestWithdrawal = (body: { amount: number; gateway: string; account: string; requestKey: string }) => api.post<Withdrawal>("/api/seller/earnings/withdrawals", body).then(r => r.data);
export const cancelWithdrawal = (id: number) => api.post(`/api/seller/earnings/withdrawals/${id}/cancel`);
export const getSettlement = (signal?: AbortSignal) => api.get<Settlement>("/api/admin/earnings/settlement", { signal }).then(r => r.data);

export const confirmExternalRefund = (id: number, body: { providerReference: string; refundedAmount: number; externallyRefunded: boolean }) => api.post(`/api/admin/earnings/refunds/${id}/confirm`, body);
