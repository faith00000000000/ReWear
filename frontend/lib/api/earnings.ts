import api from "@/lib/axios";
import type { EarningsDashboard } from "@/lib/types/earnings";
export async function fetchAdminEarnings(type: string, search: string, page: number, signal?: AbortSignal) {
  return (await api.get<EarningsDashboard>("/api/admin/earnings", { params: { type, search, page, size: 20 }, signal })).data;
}
