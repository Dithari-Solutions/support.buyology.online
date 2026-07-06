"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { DashboardStats, Page, TicketSummary } from "@/lib/types";
import Badge from "@/components/support/Badge";
import Spinner from "@/components/support/Spinner";
import Icon3D, { Icon3DName, Icon3DTone } from "@/components/support/Icon3D";
import {
  PRIORITY_LABEL,
  TICKET_STATUS_LABEL,
  priorityTone,
  ticketStatusTone,
  timeAgo,
} from "@/lib/format";

type Tile = {
  label: string;
  value: number;
  icon: Icon3DName;
  tone: Icon3DTone;
  href: string;
};

export default function DashboardPage() {
  const { user, isAtLeast } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const heroIconsRef = useRef<HTMLDivElement>(null);

  const onHeroMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width - 0.5;
    const my = (e.clientY - r.top) / r.height - 0.5;
    heroIconsRef.current?.style.setProperty("--mx", mx.toFixed(3));
    heroIconsRef.current?.style.setProperty("--my", my.toFixed(3));
  };
  const onHeroLeave = () => {
    heroIconsRef.current?.style.setProperty("--mx", "0");
    heroIconsRef.current?.style.setProperty("--my", "0");
  };

  useEffect(() => {
    (async () => {
      try {
        const [s, r] = await Promise.all([
          api.get<DashboardStats>("/api/dashboard"),
          api.get<Page<TicketSummary>>("/api/tickets?size=6"),
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

  const tiles: Tile[] = [
    { label: "My tickets", value: stats?.myTickets ?? 0, icon: "ticket", tone: "brand", href: "/tickets?mine=true" },
    { label: "My open tickets", value: stats?.myOpenTickets ?? 0, icon: "inbox", tone: "warning", href: "/tickets?mine=true" },
    { label: "Unread notifications", value: stats?.unreadNotifications ?? 0, icon: "bell", tone: "accent", href: "/notifications" },
  ];
  if (support) {
    tiles.push(
      { label: "Assigned to me", value: stats?.assignedToMe ?? 0, icon: "users", tone: "cyan", href: "/tickets" },
      { label: "Open (all)", value: stats?.openTickets ?? 0, icon: "server", tone: "accent", href: "/tickets?status=OPEN" },
      { label: "In progress", value: stats?.inProgressTickets ?? 0, icon: "refresh", tone: "warning", href: "/tickets?status=IN_PROGRESS" },
      { label: "Resolved", value: stats?.resolvedTickets ?? 0, icon: "shieldCheck", tone: "success", href: "/tickets?status=RESOLVED" }
    );
  }
  if (admin) {
    tiles.push(
      { label: "Pending approvals", value: stats?.pendingApprovals ?? 0, icon: "hourglass", tone: "error", href: "/admin/approvals" },
      { label: "Total users", value: stats?.totalUsers ?? 0, icon: "layers", tone: "violet", href: "/admin/users" }
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        onMouseMove={onHeroMove}
        onMouseLeave={onHeroLeave}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 p-6 text-white shadow-theme-lg sm:p-8"
      >
        {/* glow blobs */}
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-accent-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-brand-400/20 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative flex items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-300" /> AzTU IT Support
            </span>
            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
              Welcome back, {user?.firstName} 👋
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Track your tickets, get help from the support team and stay on top of every update.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/tickets/new"
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 shadow-sm transition hover:bg-white/90"
              >
                + Open a ticket
              </Link>
              <Link
                href="/tickets"
                className="rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                View tickets
              </Link>
            </div>
          </div>

          {/* floating + parallax 3D icon cluster */}
          <div ref={heroIconsRef} className="relative hidden h-44 w-44 shrink-0 md:block">
            <div
              className="parallax-layer absolute left-1/2 top-1/2"
              style={{
                transform:
                  "translate(-50%,-50%) translate(calc(var(--mx,0) * 14px), calc(var(--my,0) * 14px))",
              }}
            >
              <Icon3D name="rocket" tone="accent" size={96} float delay={0} />
            </div>
            <div
              className="parallax-layer absolute left-0 top-3"
              style={{
                transform:
                  "rotate(-8deg) translate(calc(var(--mx,0) * 26px), calc(var(--my,0) * 26px))",
              }}
            >
              <Icon3D name="chip" tone="cyan" size={46} float delay={0.6} />
            </div>
            <div
              className="parallax-layer absolute bottom-1 right-0"
              style={{
                transform:
                  "rotate(10deg) translate(calc(var(--mx,0) * 20px), calc(var(--my,0) * 20px))",
              }}
            >
              <Icon3D name="shieldCheck" tone="violet" size={50} float delay={1.1} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat tiles ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t, i) => (
          <Link
            key={t.label}
            href={t.href}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:shadow-theme-lg dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-500/5 blur-2xl transition group-hover:bg-brand-500/10" />
            <div className="relative">
              <Icon3D name={t.icon} tone={t.tone} size={52} float delay={(i % 4) * 0.3} />
              <p className="mt-4 text-3xl font-bold tracking-tight text-gray-800 dark:text-white/90">
                {t.value}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Recent + side panel ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent tickets */}
        <div className="rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-white/[0.03] lg:col-span-2">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="font-semibold text-gray-800 dark:text-white/90">Recent tickets</h2>
            <Link href="/tickets" className="text-sm font-medium text-brand-500 hover:text-brand-600">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Icon3D name="ticket" tone="brand" size={56} className="mx-auto" />
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                No tickets yet.{" "}
                <Link href="/tickets/new" className="font-medium text-brand-500">
                  Open your first ticket
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {recent.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/tickets/${t.id}`}
                    className="flex flex-col gap-2 rounded-xl px-4 py-3 transition hover:bg-gray-50 dark:hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xs font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                        {t.ticketNumber.replace("AZTU-", "#").slice(0, 5)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-800 dark:text-white/90">
                          {t.subject}
                        </p>
                        <p className="text-xs text-gray-400">
                          {t.platformName} · {timeAgo(t.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-12 sm:pl-0">
                      <Badge tone={priorityTone(t.priority)}>{PRIORITY_LABEL[t.priority]}</Badge>
                      <Badge tone={ticketStatusTone(t.status)}>{TICKET_STATUS_LABEL[t.status]}</Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Side panel */}
        {support ? <StatusOverview stats={stats} /> : <QuickHelp />}
      </div>
    </div>
  );
}

function StatusOverview({ stats }: { stats: DashboardStats | null }) {
  const rows = [
    { label: "Open", value: stats?.openTickets ?? 0, cls: "bg-accent-400" },
    { label: "In progress", value: stats?.inProgressTickets ?? 0, cls: "bg-warning-400" },
    { label: "Resolved", value: stats?.resolvedTickets ?? 0, cls: "bg-success-400" },
    { label: "Closed", value: stats?.closedTickets ?? 0, cls: "bg-gray-400" },
  ];
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-5 flex items-center gap-3">
        <Icon3D name="gauge" tone="brand" size={44} />
        <div>
          <h2 className="font-semibold text-gray-800 dark:text-white/90">Ticket overview</h2>
          <p className="text-xs text-gray-400">{stats?.totalTickets ?? 0} total tickets</p>
        </div>
      </div>
      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">{r.label}</span>
              <span className="font-semibold text-gray-800 dark:text-white/90">{r.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
              <div
                className={`h-full rounded-full ${r.cls}`}
                style={{ width: `${(r.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickHelp() {
  const links: { label: string; desc: string; href: string; icon: Icon3DName; tone: Icon3DTone }[] = [
    { label: "Open a ticket", desc: "Report an issue or request", href: "/tickets/new", icon: "ticket", tone: "brand" },
    { label: "My tickets", desc: "Track your open requests", href: "/tickets?mine=true", icon: "inbox", tone: "accent" },
    { label: "Notifications", desc: "Latest updates", href: "/notifications", icon: "bell", tone: "cyan" },
    { label: "Account & security", desc: "Profile and password", href: "/account", icon: "shieldCheck", tone: "violet" },
  ];
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="mb-4 font-semibold text-gray-800 dark:text-white/90">Quick links</h2>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex items-center gap-3 rounded-xl border border-transparent p-2 transition hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-800 dark:hover:bg-white/[0.04]"
            >
              <Icon3D name={l.icon} tone={l.tone} size={40} />
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{l.label}</p>
                <p className="text-xs text-gray-400">{l.desc}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
