export interface NotificationItem {
  id: number;
  sequence: number;
  type: string;
  title: string;
  message: string;
  href: string;
  createdAt: string;
  readAt: string | null;
}
export interface NotificationState { unreadCount: number; revision: number; watermark: number }
export interface NotificationPage { items: NotificationItem[]; nextCursor: number | null; state: NotificationState }
export interface NotificationEvent extends NotificationState { eventId: string; type: "INBOX_CHANGED" }
