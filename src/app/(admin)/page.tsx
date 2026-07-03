"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { DashboardStats, Page, TicketSummary } from "@/lib/types";
import StatCard from "@/components/support/StatCard";
import Badge from "@/components/support/Badge";
import Spinner from "@/components/support/Spinner";
import {
  PRIORITY_LABEL,
  TICKET_STATUS_LABEL,
  priorityTone,
  ticketStatusTone,
  timeAgo,
} from "@/lib/format";

export default function DashboardPage() {
  const { user, isAtLeast } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, r] = await Promise.all([
          api.get<DashboardStats>("/api/dashboard"),
          api.get<Page<TicketSummary>>("/api/tickets?size=5"),
        ]);
        setStats(s);
        setRecent(r.content);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner label="Loading dashboard…" />;

  const support = isAtLeast("SUPPORT_TEAM");
  const admin = isAtLeast("ADMIN");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here&apos;s an overview of your AzTU Support activity.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        <StatCard label="My tickets" value={stats?.myTickets ?? 0} icon="🎫" href="/tickets?mine=true" />
        <StatCard
          label="My open tickets"
          value={stats?.myOpenTickets ?? 0}
          icon="📬"
          tone="warning"
          href="/tickets?mine=true"
        />
        <StatCard
          label="Unread notifications"
          value={stats?.unreadNotifications ?? 0}
          icon="🔔"
          tone="accent"
          href="/notifications"
        />
        {support && (
          <StatCard
            label="Assigned to me"
            value={stats?.assignedToMe ?? 0}
            icon="👤"
            tone="brand"
            href="/tickets"
          />
        )}
        {support && (
          <>
            <StatCard label="Open (all)" value={stats?.openTickets ?? 0} icon="📂" tone="accent" href="/tickets?status=OPEN" />
            <StatCard
              label="In progress"
              value={stats?.inProgressTickets ?? 0}
              icon="🔄"
              tone="warning"
              href="/tickets?status=IN_PROGRESS"
            />
            <StatCard
              label="Resolved"
              value={stats?.resolvedTickets ?? 0}
              icon="✅"
              tone="success"
              href="/tickets?status=RESOLVED"
            />
          </>
        )}
        {admin && (
          <StatCard
            label="Pending approvals"
            value={stats?.pendingApprovals ?? 0}
            icon="⏳"
            tone="error"
            href="/admin/approvals"
          />
        )}
        {admin && (
          <StatCard label="Total users" value={stats?.totalUsers ?? 0} icon="👥" tone="brand" href="/admin/users" />
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/tickets/new"
          className="rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white hover:bg-brand-600"
        >
          + Open a new ticket
        </Link>
        <Link
          href="/tickets"
          className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
        >
          View all tickets
        </Link>
        {admin && (
          <Link
            href="/admin/approvals"
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
          >
            Review approvals
          </Link>
        )}
      </div>

      {/* Recent tickets */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-semibold text-gray-800 dark:text-white/90">Recent tickets</h2>
          <Link href="/tickets" className="text-sm text-brand-500 hover:text-brand-600">
            View all
          </Link>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800">
          {recent.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No tickets yet.{" "}
              <Link href="/tickets/new" className="text-brand-500">
                Open your first ticket
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {recent.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/tickets/${t.id}`}
                    className="flex flex-col gap-2 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-800 dark:text-white/90">
                        <span className="text-gray-400">{t.ticketNumber}</span> {t.subject}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t.platformName} · {timeAgo(t.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={priorityTone(t.priority)}>{PRIORITY_LABEL[t.priority]}</Badge>
                      <Badge tone={ticketStatusTone(t.status)}>{TICKET_STATUS_LABEL[t.status]}</Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
