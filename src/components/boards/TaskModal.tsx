"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { TaskDetail, TicketPriority, UserSummary } from "@/lib/types";
import SelectField from "@/components/support/SelectField";
import Badge from "@/components/support/Badge";
import Spinner from "@/components/support/Spinner";
import FormAlert from "@/components/support/FormAlert";
import MentionInput from "./MentionInput";
import { CloseLineIcon } from "@/icons";
import { PRIORITY_LABEL, ROLE_LABEL, formatDate, formatDateShort, priorityTone } from "@/lib/format";

const PRIORITY_OPTIONS = (["LOW", "MEDIUM", "HIGH", "URGENT"] as TicketPriority[]).map((p) => ({
  value: p,
  label: PRIORITY_LABEL[p],
}));

const INPUT_CLASS =
  "h-11 w-full rounded-xl border bg-transparent px-4 text-sm text-gray-800 border-gray-300 shadow-theme-xs focus:border-accent-400 focus:outline-hidden focus:ring-3 focus:ring-accent-500/15 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/90 dark:focus:border-accent-500/60";

const MENTION_RE = /(@[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,})/g;

function renderWithMentions(text: string): ReactNode {
  return text.split(MENTION_RE).map((part, i) =>
    /^@[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(part) ? (
      <span key={i} className="font-medium text-accent-600 dark:text-accent-400">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function TaskModal({
  taskId,
  members,
  onClose,
  onChanged,
}: {
  taskId: number;
  members: UserSummary[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [comment, setComment] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const load = useCallback(async () => {
    const t = await api.get<TaskDetail>(`/api/tasks/${taskId}`);
    setTask(t);
    setTitle(t.title);
    setDescription(t.description ?? "");
    setPriority(t.priority);
    setAssigneeId(t.assignee ? String(t.assignee.id) : "");
    setDueDate(t.dueDate ?? "");
  }, [taskId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!task || !title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.put(`/api/tasks/${taskId}`, {
        columnId: task.columnId,
        title: title.trim(),
        description,
        priority,
        assigneeId: assigneeId ? Number(assigneeId) : null,
        dueDate: dueDate || null,
      });
      setEditing(false);
      await load();
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save the task.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    setBusy(true);
    try {
      await api.del(`/api/tasks/${taskId}`);
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to delete the task.");
      setBusy(false);
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/tasks/${taskId}/comments`, { body: comment });
      setComment("");
      await load();
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to add the comment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="my-10 w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {!task ? (
          <Spinner label="Loading task…" />
        ) : (
          <>
            <div className="mb-4 flex items-start justify-between gap-3">
              {editing ? (
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Task title"
                />
              ) : (
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">{task.title}</h2>
              )}
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                aria-label="Close"
              >
                <CloseLineIcon className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4">
                <FormAlert type="error" message={error} />
              </div>
            )}

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block font-mono text-[13px] text-gray-600 dark:text-gray-400">
                    Description
                  </label>
                  <MentionInput
                    value={description}
                    onChange={setDescription}
                    members={members}
                    rows={4}
                    placeholder="Describe the task… use @ to mention a teammate"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Priority">
                    <SelectField
                      options={PRIORITY_OPTIONS}
                      value={priority}
                      onChange={(v) => setPriority(v as TicketPriority)}
                    />
                  </Field>
                  <Field label="Assignee">
                    <SelectField
                      options={[
                        { value: "", label: "Unassigned" },
                        ...members.map((m) => ({ value: String(m.id), label: m.fullName })),
                      ]}
                      value={assigneeId}
                      onChange={setAssigneeId}
                    />
                  </Field>
                  <Field label="Due date">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </Field>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={save}
                    disabled={busy}
                    className="rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-500 disabled:opacity-50 dark:bg-accent-500/[0.14] dark:text-accent-200 dark:ring-1 dark:ring-inset dark:ring-accent-400/25 dark:hover:bg-accent-500/[0.22]"
                  >
                    {busy ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/[0.04]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={priorityTone(task.priority)}>{PRIORITY_LABEL[task.priority]}</Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {task.assignee ? `Assigned to ${task.assignee.fullName}` : "Unassigned"}
                  </span>
                  {task.dueDate && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      · Due {formatDateShort(task.dueDate)}
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {renderWithMentions(task.description)}
                  </p>
                )}
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/[0.04]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={remove}
                    disabled={busy}
                    className="rounded-xl border border-error-300 px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 disabled:opacity-50 dark:border-error-500/30 dark:text-error-400 dark:hover:bg-error-500/10"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}

            {/* Comments */}
            <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800">
              <h3 className="mb-3 font-semibold text-gray-800 dark:text-white/90">
                Comments ({task.comments.length})
              </h3>
              <div className="space-y-3">
                {task.comments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.02]"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {c.author?.fullName ?? "—"}
                      </span>
                      {c.author && <Badge tone="gray">{ROLE_LABEL[c.author.role]}</Badge>}
                      <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                      {renderWithMentions(c.body)}
                    </p>
                  </div>
                ))}
                {task.comments.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet.</p>
                )}
              </div>
              <div className="mt-4">
                <MentionInput
                  value={comment}
                  onChange={setComment}
                  members={members}
                  rows={2}
                  placeholder="Write a comment… use @ to mention a teammate"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={addComment}
                    disabled={busy || !comment.trim()}
                    className="rounded-xl bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-500 disabled:opacity-50 dark:bg-accent-500/[0.14] dark:text-accent-200 dark:ring-1 dark:ring-inset dark:ring-accent-400/25 dark:hover:bg-accent-500/[0.22]"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[13px] text-gray-600 dark:text-gray-400">
        {label}
      </label>
      {children}
    </div>
  );
}
