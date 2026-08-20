// Adjust this import to wherever your shared axios instance lives
// (the one with the auth interceptors you already have).
import api from '@/lib/axios';
import { AdminUser } from '@/lib/types/admin-user';

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[]>('/api/admin/users', {
    params: { excludeRole: 'ADMIN' },
  });
  return data;
}

export async function banAdminUser(
  userId: number,
  reason: string,
): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(
    `/api/admin/users/${userId}/ban`,
    {
      reason,
    },
  );
  return data;
}

export async function unbanAdminUser(userId: number): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(
    `/api/admin/users/${userId}/unban`,
  );
  return data;
}
