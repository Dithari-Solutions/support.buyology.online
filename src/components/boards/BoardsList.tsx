"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { BoardSummary } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/support/PageHeader";
import Spinner from "@/components/support/Spinner";
import FormAlert from "@/components/support/FormAlert";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { formatDate } from "@/lib/format";

const BTN_PRIMARY =
  "rounded-xl bg-accent-600 px-5 py-2.5 font-mono text-sm font-semibold text-white transition hover:bg-accent-500 disabled:opacity-50 dark:bg-accent-500/[0.14] dark:text-accent-200 dark:ring-1 dark:ring-inset dark:ring-accent-400/25 dark:hover:bg-accent-500/[0.22]";

export default function BoardsList() {
  const { isAtLeast } = useAuth();
  const isAdmin = isAtLeast("SUPER_ADMIN");

  const [boards, setBoards] = useState<BoardSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBoards(await api.get<BoardSummary[]>("/api/boards"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.post("/api/boards", { name: name.trim(), description: description.trim() });
      setName("");
      setDescription("");
      setShowCreate(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create the board.");
    } finally {
      setBusy(false);
    }
  };

  const deleteBoard = async (board: BoardSummary) => {
    if (!confirm(`Delete the board "${board.name}" and all of its tasks? This cannot be undone.`)) return;
    setError(null);
    try {
      await api.del(`/api/boards/${board.id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to delete the board.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Boards"
        subtitle="Track the team's tasks and jobs on Kanban boards."
        action={
          isAdmin ? (
            <button type="button" onClick={() => setShowCreate((s) => !s)} className={BTN_PRIMARY}>
              {showCreate ? "Close" : "+ New board"}
            </button>
          ) : undefined
        }
      />

      {error && <div className="mb-4"><FormAlert type="error" message={error} /></div>}

      {isAdmin && showCreate && (
        <form
          onSubmit={create}
          className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Board name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Website revamp" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            The board starts with To&nbsp;Do / In&nbsp;Progress / Done columns — you can rename, add or remove columns on the board.
          </p>
          <button type="submit" disabled={busy} className={`${BTN_PRIMARY} mt-4`}>
            {busy ? "Creating…" : "Create board"}
          </button>
        </form>
      )}

      {!boards ? (
        <Spinner label="Loading boards…" />
      ) : boards.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No boards yet.{isAdmin ? " Create the first one above." : " A super admin can create one."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((b) => (
            <div
              key={b.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <Link href={`/boards/${b.id}`} className="block">
                <h3 className="font-mono text-base font-semibold text-gray-900 dark:text-white">
                  <span className="text-accent-500">▸</span> {b.name}
                </h3>
                {b.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{b.description}</p>
                )}
              </Link>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <span>
                  {b.createdByName ? `by ${b.createdByName} · ` : ""}
                  {formatDate(b.createdAt)}
                </span>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => deleteBoard(b)}
                    className="text-error-500 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
