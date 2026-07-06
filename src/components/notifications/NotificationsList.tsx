"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { NotificationItem, Page } from "@/lib/types";
import Spinner from "@/components/support/Spinner";
import PageHeader from "@/components/support/PageHeader";
import Button from "@/components/ui/button/Button";
import { NOTIFICATION_ICON, timeAgo } from "@/lib/format";

export default function NotificationsList() {
  const router = useRouter();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<NotificationItem> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Page<NotificationItem>>(
        `/api/notifications?unreadOnly=${unreadOnly}&page=${page}&size=20`
      );
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [unreadOnly, page]);

  useEffect(() => {
    load();
  }, [load]);

  const markAllRead = async () => {
    await api.post("/api/notifications/read-all");
    load();
  };

  const open = async (n: NotificationItem) => {
    if (!n.read) {
      try {
        await api.post(`/api/notifications/${n.id}/read`);
      } catch {
        /* ignore */
      }
    }
    if (n.link) router.push(n.link);
    else load();
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Updates on your tickets, approvals and account."
        action={
          <Button type="button" size="sm" variant="outline" onClick={markAllRead}>
            Mark all read
          </Button>
        }
      />

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => {
            setUnreadOnly(false);
            setPage(0);
          }}
          className={`rounded-xl px-3 py-1.5 text-sm ${
            !unreadOnly
              ? "bg-accent-500 text-white"
              : "border border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300"
          }`}
        >
          All
        </button>
        <button
          onClick={() => {
            setUnreadOnly(true);
            setPage(0);
          }}
          className={`rounded-xl px-3 py-1.5 text-sm ${
            unreadOnly
              ? "bg-accent-500 text-white"
              : "border border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300"
          }`}
        >
          Unread
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <Spinner label="Loading notifications…" />
        ) : !data || data.content.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            {unreadOnly ? "No unread notifications." : "You have no notifications yet."}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.content.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => open(n)}
                  className={`flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-white/[0.02] ${
                    n.read ? "" : "bg-accent-50 dark:bg-accent-500/[0.06]"
                  }`}
                >
                  <span className="mt-0.5 text-xl">{NOTIFICATION_ICON[n.type] ?? "🔔"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-medium text-gray-800 dark:text-white/90">
                      {n.title}
                      {!n.read && <span className="h-2 w-2 rounded-full bg-accent-500" />}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">{n.message}</p>
                    <p className="mt-1 text-xs text-gray-400">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>
            Page {data.page + 1} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={data.first}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-xl border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
            >
              Previous
            </button>
            <button
              disabled={data.last}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
