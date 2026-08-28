"use client";
import Link from "next/link";
import { Bell, Check, CheckCheck, RefreshCw } from "lucide-react";
import { useNotifications } from "@/lib/NotificationContext";
import { useAuth } from "@/lib/AuthContext";

export default function NotificationsPage() {
  const { authed, isMounted } = useAuth();
  const { items, unreadCount, loading, connected, error, hasMore, refresh, loadMore, markRead, markAllRead } = useNotifications();
  if (!isMounted) return <p className="p-8">Loading…</p>;
  if (!authed) return <div className="mx-auto max-w-3xl p-8"><Link href="/login?redirect=%2Fnotifications" className="underline">Sign in to view notifications</Link></div>;
  return (
    <main className="mx-auto min-h-[65vh] max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 font-serif text-3xl"><Bell size={26} /> Notifications</h1>
          <p className="mt-2 text-sm text-stone-600" aria-live="polite">{unreadCount} unread · {connected ? "Live updates connected" : "Connecting to live updates…"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void refresh()} aria-label="Refresh notifications" className="rounded-full border p-2"><RefreshCw size={18} /></button>
          <button disabled={unreadCount === 0 || loading} onClick={() => void markAllRead()} className="flex items-center gap-2 rounded-full bg-[#A33214] px-4 py-2 text-sm text-white disabled:opacity-40"><CheckCheck size={16} /> Mark all as read</button>
        </div>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {loading && <p className="py-8 text-center">Loading notifications…</p>}
      {!loading && !error && items.length === 0 && <div className="rounded-2xl border bg-white p-12 text-center text-stone-600">You are all caught up. Updates about your ReWear activity will appear here.</div>}
      <ul className="space-y-3">
        {items.map(item => (
          <li key={item.id} className={`rounded-xl border p-4 ${item.readAt ? "border-stone-200 bg-white" : "border-[#A33214]/30 bg-[#FFF5ED]"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">{!item.readAt && <span aria-label="Unread" className="h-2 w-2 shrink-0 rounded-full bg-red-600" />}<h2 className="font-semibold">{item.title}</h2></div>
                <p className="mt-1 text-sm text-stone-700">{item.message}</p>
                <time dateTime={item.createdAt} className="mt-2 block text-xs text-stone-500">{new Date(item.createdAt).toLocaleString()}</time>
                <Link href={item.href} onClick={() => void markRead(item.id)} className="mt-3 inline-block text-sm font-semibold text-[#A33214] underline">View update</Link>
              </div>
              {!item.readAt && <button onClick={() => void markRead(item.id)} aria-label={`Mark ${item.title} as read`} className="shrink-0 rounded-full border p-2"><Check size={16} /></button>}
            </div>
          </li>
        ))}
      </ul>
      {hasMore && <button onClick={() => void loadMore()} className="mt-6 w-full rounded-full border py-3 text-sm">Load older notifications</button>}
    </main>
  );
}
