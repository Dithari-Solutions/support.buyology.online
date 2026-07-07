"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError, API_URL, getAccessToken } from "@/lib/api";
import { Category, Platform, TicketDetail, TicketPriority, TicketStatus, UserSummary } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Badge from "@/components/support/Badge";
import Spinner from "@/components/support/Spinner";
import SelectField from "@/components/support/SelectField";
import FormAlert from "@/components/support/FormAlert";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import {
  CLOSING_STATUSES,
  PRIORITY_LABEL,
  ROLE_LABEL,
  TICKET_STATUS_LABEL,
  formatDate,
  priorityTone,
  ticketStatusTone,
  roleTone,
} from "@/lib/format";

const STATUS_OPTIONS = (
  ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED_WITHOUT_RESOLVE", "REJECTED"] as TicketStatus[]
).map((s) => ({ value: s, label: TICKET_STATUS_LABEL[s] }));

const PRIORITY_OPTIONS = (["LOW", "MEDIUM", "HIGH", "URGENT"] as TicketPriority[]).map((p) => ({
  value: p,
  label: PRIORITY_LABEL[p],
}));

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function TicketDetailView({ ticketId }: { ticketId: number }) {
  const router = useRouter();
  const { user, isAtLeast } = useAuth();
  const support = isAtLeast("SUPPORT_TEAM");
  const admin = isAtLeast("ADMIN");

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const t = await api.get<TicketDetail>(`/api/tickets/${ticketId}`);
      setTicket(t);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 403)) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Spinner label="Loading ticket…" />;
  if (notFound || !ticket)
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-600 dark:text-gray-300">
          This ticket doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link href="/tickets" className="mt-3 inline-block text-accent-600 hover:text-accent-500 dark:text-accent-400 dark:hover:text-accent-300">
          ← Back to tickets
        </Link>
      </div>
    );

  const owner = !!user && !!ticket.createdBy && user.id === ticket.createdBy.id;
  const canEdit = support || (owner && !CLOSING_STATUSES.includes(ticket.status));

  const deleteTicket = async () => {
    if (
      !confirm(
        `Delete ticket ${ticket.ticketNumber}? This permanently removes it and all its replies and attachments. This cannot be undone.`
      )
    )
      return;
    setActionError(null);
    try {
      await api.del(`/api/tickets/${ticket.id}`);
      router.push("/tickets");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to delete ticket.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/tickets" className="text-sm text-accent-600 hover:text-accent-500 dark:text-accent-400 dark:hover:text-accent-300">
          ← Back to tickets
        </Link>
      </div>

      {actionError && <FormAlert type="error" message={actionError} />}

      {/* Header */}
      {editing ? (
        <EditTicketForm
          ticket={ticket}
          onCancel={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            load();
          }}
        />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs font-medium text-accent-600 dark:text-accent-400/80">{ticket.ticketNumber}</p>
              <h1 className="mt-1 text-xl font-semibold text-gray-800 dark:text-white/90">
                {ticket.subject}
              </h1>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={priorityTone(ticket.priority)}>{PRIORITY_LABEL[ticket.priority]}</Badge>
                <Badge tone={ticketStatusTone(ticket.status)}>
                  {TICKET_STATUS_LABEL[ticket.status]}
                </Badge>
              </div>
              {(canEdit || admin) && (
                <div className="flex gap-2">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/[0.04]"
                    >
                      Edit
                    </button>
                  )}
                  {admin && (
                    <button
                      type="button"
                      onClick={deleteTicket}
                      className="rounded-xl border border-error-300 px-3 py-1.5 text-sm font-medium text-error-600 transition hover:bg-error-50 dark:border-error-500/30 dark:text-error-400 dark:hover:bg-error-500/10"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <Meta label="Platform" value={ticket.platformName ?? "—"} />
            <Meta label="Category" value={ticket.categoryName ?? "—"} />
            <Meta label="Opened by" value={ticket.createdBy?.fullName ?? "—"} />
            <Meta label="Assignee" value={ticket.assignedTo?.fullName ?? "Unassigned"} />
            <Meta label="Created" value={formatDate(ticket.createdAt)} />
            <Meta label="Last updated" value={formatDate(ticket.updatedAt)} />
            {ticket.closedAt && <Meta label="Closed" value={formatDate(ticket.closedAt)} />}
          </dl>

          <div className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-800">
            <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
              {ticket.description}
            </p>
          </div>

          {ticket.resolutionNote && (
            <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-white/[0.03]">
              <p className="text-xs font-semibold uppercase text-gray-400">Resolution note</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                {ticket.resolutionNote}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Support controls */}
      {support && <SupportControls ticket={ticket} onChanged={load} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Conversation */}
        <div className="space-y-6 lg:col-span-2">
          <Conversation ticket={ticket} support={support} onAdded={load} />
          <Attachments ticket={ticket} onAdded={load} />
        </div>

        {/* History */}
        <div>
          <StatusHistoryPanel ticket={ticket} />
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-gray-700 dark:text-gray-300">{value}</dd>
    </div>
  );
}

// ── Edit ticket ───────────────────────────────────────────────────────────────

function EditTicketForm({
  ticket,
  onCancel,
  onSaved,
}: {
  ticket: TicketDetail;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [platformId, setPlatformId] = useState(ticket.platformId ? String(ticket.platformId) : "");
  const [categoryId, setCategoryId] = useState(ticket.categoryId ? String(ticket.categoryId) : "");
  const [subject, setSubject] = useState(ticket.subject);
  const [description, setDescription] = useState(ticket.description);
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Platform[]>("/api/platforms").then(setPlatforms).catch(() => setPlatforms([]));
  }, []);

  useEffect(() => {
    if (!platformId) {
      setCategories([]);
      return;
    }
    api
      .get<Category[]>(`/api/platforms/${platformId}/categories`)
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [platformId]);

  const changePlatform = (v: string) => {
    setPlatformId(v);
    setCategoryId(""); // the category must belong to the selected platform
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!platformId || !subject.trim() || !description.trim()) {
      setError("Platform, subject and description are required.");
      return;
    }
    setBusy(true);
    try {
      await api.put(`/api/tickets/${ticket.id}`, {
        platformId: Number(platformId),
        categoryId: categoryId ? Number(categoryId) : null,
        subject: subject.trim(),
        description,
        priority,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save changes.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={save}
      className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <h2 className="mb-4 font-semibold text-gray-800 dark:text-white/90">Edit ticket</h2>
      {error && <div className="mb-4"><FormAlert type="error" message={error} /></div>}
      <div className="space-y-4">
        <div>
          <Label>Subject</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label>Platform</Label>
            <SelectField
              options={platforms.map((p) => ({ value: String(p.id), label: p.name }))}
              value={platformId}
              onChange={changePlatform}
              placeholder="Select platform"
            />
          </div>
          <div>
            <Label>Category</Label>
            <SelectField
              options={[
                { value: "", label: "None" },
                ...categories.map((c) => ({ value: String(c.id), label: c.name })),
              ]}
              value={categoryId}
              onChange={setCategoryId}
            />
          </div>
          <div>
            <Label>Priority</Label>
            <SelectField
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={(v) => setPriority(v as TicketPriority)}
            />
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <TextArea rows={5} value={description} onChange={setDescription} />
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Support controls: status + assignment ─────────────────────────────────────

function SupportControls({ ticket, onChanged }: { ticket: TicketDetail; onChanged: () => void }) {
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [reason, setReason] = useState("");
  const [agents, setAgents] = useState<UserSummary[]>([]);
  const [assignee, setAssignee] = useState<string>(ticket.assignedTo ? String(ticket.assignedTo.id) : "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<UserSummary[]>("/api/tickets/assignable-agents")
      .then(setAgents)
      .catch(() => setAgents([]));
  }, []);

  const needsReason = CLOSING_STATUSES.includes(status);

  const updateStatus = async () => {
    setError(null);
    if (needsReason && !reason.trim()) {
      setError("A resolution / reason note is required to close this ticket.");
      return;
    }
    setBusy(true);
    try {
      await api.patch(`/api/tickets/${ticket.id}/status`, {
        status,
        reason: reason.trim() || null,
      });
      setReason("");
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update status.");
    } finally {
      setBusy(false);
    }
  };

  const updateAssignee = async () => {
    setError(null);
    setBusy(true);
    try {
      await api.patch(`/api/tickets/${ticket.id}/assign`, {
        assigneeId: assignee ? Number(assignee) : null,
      });
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to assign ticket.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="mb-4 font-semibold text-gray-800 dark:text-white/90">Support actions</h2>
      {error && <div className="mb-4"><FormAlert type="error" message={error} /></div>}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status */}
        <div>
          <Label>Change status</Label>
          <SelectField
            options={STATUS_OPTIONS}
            value={status}
            onChange={(v) => setStatus(v as TicketStatus)}
          />
          {needsReason && (
            <div className="mt-3">
              <Label>
                Resolution / reason note <span className="text-error-500">*</span>
              </Label>
              <TextArea
                rows={3}
                placeholder="Explain how this ticket was resolved or why it's being closed…"
                value={reason}
                onChange={setReason}
              />
            </div>
          )}
          <Button type="button" size="sm" className="mt-3" onClick={updateStatus} disabled={busy}>
            Update status
          </Button>
        </div>

        {/* Assignment */}
        <div>
          <Label>Assign to</Label>
          <SelectField
            options={[
              { value: "", label: "Unassigned" },
              ...agents.map((a) => ({ value: String(a.id), label: `${a.fullName} · ${ROLE_LABEL[a.role]}` })),
            ]}
            value={assignee}
            onChange={setAssignee}
          />
          <Button type="button" size="sm" variant="outline" className="mt-3" onClick={updateAssignee} disabled={busy}>
            Save assignee
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Conversation ──────────────────────────────────────────────────────────────

function Conversation({
  ticket,
  support,
  onAdded,
}: {
  ticket: TicketDetail;
  support: boolean;
  onAdded: () => void;
}) {
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/tickets/${ticket.id}/comments`, { body, internal });
      setBody("");
      setInternal(false);
      onAdded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to post reply.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="mb-4 font-semibold text-gray-800 dark:text-white/90">
        Conversation ({ticket.comments.length})
      </h2>

      <div className="space-y-4">
        {ticket.comments.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">No replies yet.</p>
        )}
        {ticket.comments.map((c) => (
          <div
            key={c.id}
            className={`rounded-xl border p-4 ${
              c.internal
                ? "border-warning-200 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/10"
                : "border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.02]"
            }`}
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                {c.authorName}
              </span>
              <Badge tone={roleTone(c.authorRole)}>{ROLE_LABEL[c.authorRole]}</Badge>
              {c.internal && <Badge tone="warning">Internal note</Badge>}
              <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{c.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-800">
        {error && <div className="mb-3"><FormAlert type="error" message={error} /></div>}
        <TextArea rows={3} placeholder="Write a reply…" value={body} onChange={setBody} />
        <div className="mt-3 flex items-center justify-between">
          {support ? (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={internal}
                onChange={(e) => setInternal(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-accent-500 focus:ring-accent-500"
              />
              Internal note (hidden from the requester)
            </label>
          ) : (
            <span />
          )}
          <Button size="sm" disabled={busy || !body.trim()}>
            {busy ? "Sending…" : "Send reply"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── Attachments ───────────────────────────────────────────────────────────────

function Attachments({ ticket, onAdded }: { ticket: TicketDetail; onAdded: () => void }) {
  const [busy, setBusy] = useState(false);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        await api.postForm(`/api/tickets/${ticket.id}/attachments`, form);
      }
      onAdded();
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const download = async (id: number, filename: string) => {
    const res = await fetch(`${API_URL}/api/tickets/attachments/${id}`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="mb-4 font-semibold text-gray-800 dark:text-white/90">
        Attachments ({ticket.attachments.length})
      </h2>
      <ul className="space-y-2">
        {ticket.attachments.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-2.5 text-sm dark:border-gray-800"
          >
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => download(a.id, a.originalFilename)}
                className="truncate font-medium text-accent-600 hover:text-accent-500 dark:text-accent-400 dark:hover:text-accent-300"
              >
                {a.originalFilename}
              </button>
              <p className="text-xs text-gray-400">
                {formatBytes(a.fileSize)} · {a.uploadedByName}
              </p>
            </div>
          </li>
        ))}
        {ticket.attachments.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">No attachments.</p>
        )}
      </ul>
      <div className="mt-4">
        <input
          type="file"
          multiple
          disabled={busy}
          onChange={upload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-xl file:border-0 file:bg-accent-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent-700 hover:file:bg-accent-100 dark:text-gray-400 dark:file:bg-accent-500/10 dark:file:text-accent-300"
        />
      </div>
    </div>
  );
}

// ── Status history ────────────────────────────────────────────────────────────

function StatusHistoryPanel({ ticket }: { ticket: TicketDetail }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="mb-4 font-semibold text-gray-800 dark:text-white/90">Activity</h2>
      <ol className="relative space-y-5 border-l border-gray-200 pl-5 dark:border-gray-700">
        {ticket.statusHistory.map((h) => (
          <li key={h.id} className="relative">
            <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full bg-accent-500" />
            <div className="flex items-center gap-2">
              {h.fromStatus && (
                <Badge tone={ticketStatusTone(h.fromStatus)}>
                  {TICKET_STATUS_LABEL[h.fromStatus]}
                </Badge>
              )}
              <span className="text-gray-400">→</span>
              <Badge tone={ticketStatusTone(h.toStatus)}>{TICKET_STATUS_LABEL[h.toStatus]}</Badge>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {h.changedByName} · {formatDate(h.createdAt)}
            </p>
            {h.reason && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{h.reason}</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
