import api from "@/lib/axios";
import type { NotificationPage, NotificationState } from "@/lib/types/notification";
export async function fetchNotifications(cursor?: number): Promise<NotificationPage> {
  return (await api.get<NotificationPage>("/api/notifications", { params: { cursor, size: 20 } })).data;
}
export async function fetchUnreadState(): Promise<NotificationState> {
  return (await api.get<NotificationState>("/api/notifications/unread-count")).data;
}
export async function markNotificationRead(id: number): Promise<NotificationState> {
  return (await api.patch<NotificationState>(`/api/notifications/${id}/read`)).data;
}
export async function markNotificationsRead(throughSequence: number): Promise<NotificationState> {
  return (await api.patch<NotificationState>("/api/notifications/read-all", { throughSequence })).data;
}
