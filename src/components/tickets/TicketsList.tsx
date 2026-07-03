"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Page, TicketPriority, TicketStatus, TicketSummary } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Badge from "@/components/support/Badge";
import Spinner from "@/components/support/Spinner";
import SelectField from "@/components/support/SelectField";
import PageHeader from "@/components/support/PageHeader";
import Input from "@/components/form/input/InputField";
import {
  PRIORITY_LABEL,
  TICKET_STATUS_LABEL,
  priorityTone,
  ticketStatusTone,
  formatDate,
} from "@/lib/format";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  ...(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED_WITHOUT_RESOLVE", "REJECTED"] as TicketStatus[]).map(
    (s) => ({ value: s, label: TICKET_STATUS_LABEL[s] })
  ),
];

const PRIORITY_OPTIONS = [
  { value: "", label: "All priorities" },
  ...(["LOW", "MEDIUM", "HIGH", "URGENT"] as TicketPriority[]).map((p) => ({
    value: p,
    label: PRIORITY_LABEL[p],
  })),
];

export default function TicketsList() {
  const params = useSearchParams();
  const { isAtLeast } = useAuth();
  const support = isAtLeast("SUPPORT_TEAM");

  const [status, setStatus] = useState(params.get("status") ?? "");
  const [priority, setPriority] = useState("");
  const [mine, setMine] = useState(params.get("mine") === "true");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [data, setData] = useState<Page<TicketSummary> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    qs.set("page", String(page));
    qs.set("size", "15");
    if (status) qs.set("status", status);
    if (priority) qs.set("priority", priority);
    if (mine) qs.set("mine", "true");
    if (search) qs.set("q", search);
    try {
      const res = await api.get<Page<TicketSummary>>(`/api/tickets?${qs.toString()}`);
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [page, status, priority, mine, search]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to first page whenever a filter changes.
  useEffect(() => {
    setPage(0);
  }, [status, priority, mine, search]);

  return (
    <div>
      <PageHeader
        title="Tickets"
        subtitle={support ? "All support tickets" : "Tickets you have opened"}
        action={
          <Link
            href="/tickets/new"
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            + Open ticket
          </Link>
        }
      />

      {/* Filters */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q);
          }}
          className="lg:col-span-2"
        >
          <Input
            placeholder="Search subject or ticket number…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>
        <SelectField options={STATUS_OPTIONS} value={status} onChange={setStatus} placeholder="Status" />
        <SelectField
          options={PRIORITY_OPTIONS}
          value={priority}
          onChange={setPriority}
          placeholder="Priority"
        />
      </div>

      {support && (
        <label className="mb-4 flex w-fit cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input
            type="checkbox"
            checked={mine}
            onChange={(e) => setMine(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
          />
          Only tickets I opened
        </label>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <Spinner label="Loading tickets…" />
        ) : !data || data.content.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            No tickets match your filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3 font-medium">Ticket</th>
                  <th className="px-5 py-3 font-medium">Platform</th>
                  {support && <th className="px-5 py-3 font-medium">Opened by</th>}
                  <th className="px-5 py-3 font-medium">Assignee</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.content.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <Link href={`/tickets/${t.id}`} className="block">
                        <span className="block font-medium text-gray-800 dark:text-white/90">
                          {t.subject}
                        </span>
                        <span className="text-xs text-gray-400">{t.ticketNumber}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{t.platformName ?? "—"}</td>
                    {support && (
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                        {t.createdByName ?? "—"}
                      </td>
                    )}
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {t.assignedToName ?? <span className="text-gray-400">Unassigned</span>}
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={priorityTone(t.priority)}>{PRIORITY_LABEL[t.priority]}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={ticketStatusTone(t.status)}>{TICKET_STATUS_LABEL[t.status]}</Badge>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(t.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>
            Page {data.page + 1} of {data.totalPages} · {data.totalElements} total
          </span>
          <div className="flex gap-2">
            <button
              disabled={data.first}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
            >
              Previous
            </button>
            <button
              disabled={data.last}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
