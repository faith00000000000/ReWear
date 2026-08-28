"use client";
import { Client } from "@stomp/stompjs";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getAccessToken } from "@/lib/auth";
import { fetchNotifications, markNotificationRead, markNotificationsRead } from "@/lib/api/notifications";
import type { NotificationEvent, NotificationItem, NotificationState } from "@/lib/types/notification";

interface NotificationContextValue {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  connected: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
}
const Context = createContext<NotificationContextValue | null>(null);
const EMPTY: NotificationState = { unreadCount: 0, revision: -1, watermark: 0 };

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { authed, user } = useAuth();
  const userId = authed ? user?.id : undefined;
  return <NotificationSession key={userId ?? "anonymous"} userId={userId}>{children}</NotificationSession>;
}

function NotificationSession({ children, userId }: { children: ReactNode; userId?: number }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [state, setState] = useState<NotificationState>(EMPTY);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(Boolean(userId));
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef<NotificationState>(EMPTY);
  const epoch = useRef(0);
  const morePending = useRef(false);

  const applyState = useCallback((next: NotificationState) => {
    if (next.revision < latest.current.revision) return false;
    latest.current = next;
    setState(next);
    return true;
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const run = epoch.current;
    try {
      const page = await fetchNotifications();
      if (run !== epoch.current) return;
      if (applyState(page.state)) {
        setItems(page.items);
        setCursor(page.nextCursor);
      }
      setError(null);
    } catch {
      if (run === epoch.current) setError("Could not load notifications. Please retry.");
    } finally {
      if (run === epoch.current) setLoading(false);
    }
  }, [userId, applyState]);

  useEffect(() => {
    epoch.current += 1;
    const run = epoch.current;
    if (!userId) return;
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
    const endpoint = new URL(base, window.location.origin);
    endpoint.protocol = endpoint.protocol === "https:" ? "wss:" : "ws:";
    endpoint.pathname = endpoint.pathname.replace(/\/$/, "") + "/ws/notifications";
    endpoint.search = "";
    endpoint.hash = "";
    const client = new Client({
      brokerURL: endpoint.toString(),
      reconnectDelay: 5000,
      connectionTimeout: 10000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 10000,
      debug: () => {},
    });
    client.beforeConnect = async () => {
      // Uses the existing HTTP refresh interceptor before reconnecting an expired JWT.
      try {
        await refresh();
        if (epoch.current !== run) return;
        const token = getAccessToken();
        if (!token) throw new Error("No session");
        client.connectHeaders = { Authorization: `Bearer ${token}` };
      } catch {
        client.connectHeaders = {};
        if (epoch.current === run) setError("Live notifications disconnected. Reconnecting…");
      }
    };
    client.onConnect = () => {
      if (epoch.current !== run) { void client.deactivate(); return; }
      setConnected(true);
      client.subscribe("/user/queue/notifications", message => {
        if (epoch.current !== run) return;
        try {
          const event = JSON.parse(message.body) as NotificationEvent;
          if (event.type !== "INBOX_CHANGED" || !Number.isSafeInteger(event.revision)) return;
          if (event.revision > latest.current.revision) {
            applyState(event);
            void refresh();
          }
        } catch { void refresh(); }
      });
      // Subscribe before snapshot so events during the fetch are revision-reconciled.
      void refresh();
    };
    client.onWebSocketClose = () => { if (epoch.current === run) setConnected(false); };
    client.onStompError = () => {
      if (epoch.current === run) setError("Live notifications reconnecting…");
      client.forceDisconnect();
    };
    client.activate();
    const resync = () => { if (document.visibilityState === "visible") void refresh(); };
    window.addEventListener("focus", resync);
    document.addEventListener("visibilitychange", resync);
    return () => {
      epoch.current += 1;
      void client.deactivate();
      window.removeEventListener("focus", resync);
      document.removeEventListener("visibilitychange", resync);
    };
  }, [userId, refresh, applyState]);

  const loadMore = useCallback(async () => {
    if (!userId || cursor === null || morePending.current) return;
    morePending.current = true;
    const run = epoch.current;
    try {
      const page = await fetchNotifications(cursor);
      if (run !== epoch.current) return;
      if (page.state.revision < latest.current.revision) { await refresh(); return; }
      applyState(page.state);
      setItems(current => {
        const ids = new Set(current.map(item => item.id));
        return [...current, ...page.items.filter(item => !ids.has(item.id))];
      });
      setCursor(page.nextCursor);
      setError(null);
    } catch { if (run === epoch.current) setError("Could not load more notifications."); }
    finally { morePending.current = false; }
  }, [userId, cursor, applyState, refresh]);

  const markRead = useCallback(async (id: number) => {
    const run = epoch.current;
    try {
      const next = await markNotificationRead(id);
      if (run !== epoch.current) return;
      if (applyState(next)) setItems(current => current.map(item => item.id === id ? { ...item, readAt: item.readAt ?? new Date().toISOString() } : item));
      await refresh();
    } catch { if (run === epoch.current) setError("Could not mark notification read. Please retry."); }
  }, [applyState, refresh]);

  const markAllRead = useCallback(async () => {
    const run = epoch.current;
    const through = latest.current.watermark;
    try {
      const next = await markNotificationsRead(through);
      if (run !== epoch.current) return;
      if (applyState(next)) setItems(current => current.map(item => item.sequence <= through ? { ...item, readAt: item.readAt ?? new Date().toISOString() } : item));
      await refresh();
    } catch { if (run === epoch.current) setError("Could not mark notifications read. Please retry."); }
  }, [applyState, refresh]);

  return <Context.Provider value={{ items: userId ? items : [], unreadCount: userId ? state.unreadCount : 0,
    loading, connected, error, hasMore: cursor !== null, refresh, loadMore, markRead, markAllRead }}>{children}</Context.Provider>;
}
export function useNotifications() {
  const context = useContext(Context);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
}
