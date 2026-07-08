"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { api, ApiError } from "@/lib/api";
import { BoardColumn, BoardDetail, TaskCard, UserSummary } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/support/Spinner";
import Badge from "@/components/support/Badge";
import FormAlert from "@/components/support/FormAlert";
import { PRIORITY_LABEL, formatDateShort, priorityTone } from "@/lib/format";
import { ChatIcon, PencilIcon, TrashBinIcon } from "@/icons";
import TaskModal from "./TaskModal";

const INPUT_CLASS =
  "w-full rounded-xl border bg-transparent px-3 py-2 text-sm text-gray-800 border-gray-300 placeholder:text-gray-400 focus:border-accent-400 focus:outline-hidden focus:ring-3 focus:ring-accent-500/15 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-accent-500/60";

export default function KanbanBoard({ boardId }: { boardId: number }) {
  const { isAtLeast } = useAuth();
  const isAdmin = isAtLeast("SUPER_ADMIN");
  const searchParams = useSearchParams();

  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [members, setMembers] = useState<UserSummary[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Deep link from a notification: /boards/{id}?task={taskId}
  const initialTask = searchParams.get("task");
  const [openTask, setOpenTask] = useState<number | null>(
    initialTask ? Number(initialTask) : null
  );

  const load = useCallback(async () => {
    try {
      const data = await api.get<BoardDetail>(`/api/boards/${boardId}`);
      setBoard(data);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 403)) setNotFound(true);
    }
  }, [boardId]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.get<BoardDetail>(`/api/boards/${boardId}`);
        if (active) setBoard(data);
      } catch (err) {
        if (active && err instanceof ApiError && (err.status === 404 || err.status === 403)) {
          setNotFound(true);
        }
      }
      try {
        const m = await api.get<UserSummary[]>("/api/boards/members");
        if (active) setMembers(m);
      } catch {
        if (active) setMembers([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [boardId]);

  if (notFound)
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-600 dark:text-gray-300">This board doesn&apos;t exist or you don&apos;t have access.</p>
        <Link href="/boards" className="mt-3 inline-block text-accent-600 hover:text-accent-500 dark:text-accent-400">
          ← Back to boards
        </Link>
      </div>
    );
  if (!board) return <Spinner label="Loading board…" />;

  const reorderColumn = async (draggedId: number, targetId: number) => {
    const ids = board.columns.map((c) => c.id);
    const from = ids.indexOf(draggedId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0 || from === to) return;
    ids.splice(from, 1);
    ids.splice(to, 0, draggedId);
    setError(null);
    try {
      await api.patch(`/api/boards/${boardId}/columns/reorder`, { columnIds: ids });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to reorder the columns.");
    }
  };

  return (
    <div>
      <div className="mb-5">
        <Link href="/boards" className="text-sm text-accent-600 hover:text-accent-500 dark:text-accent-400">
          ← Boards
        </Link>
        <h1 className="mt-2 flex items-center gap-2 font-mono text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          <span className="text-accent-500">▸</span>
          {board.name}
        </h1>
        {board.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{board.description}</p>
        )}
      </div>

      {error && <div className="mb-4"><FormAlert type="error" message={error} /></div>}

      <DndProvider backend={HTML5Backend}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {board.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              isAdmin={isAdmin}
              onOpenTask={setOpenTask}
              onChanged={load}
              onError={setError}
              onReorderColumn={reorderColumn}
            />
          ))}
          {isAdmin && <AddColumn boardId={boardId} onChanged={load} onError={setError} />}
        </div>
      </DndProvider>

      {openTask !== null && (
        <TaskModal
          taskId={openTask}
          members={members}
          onClose={() => setOpenTask(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}

// ── Column (drop target) ──────────────────────────────────────────────────────

function Column({
  column,
  isAdmin,
  onOpenTask,
  onChanged,
  onError,
  onReorderColumn,
}: {
  column: BoardColumn;
  isAdmin: boolean;
  onOpenTask: (id: number) => void;
  onChanged: () => void;
  onError: (msg: string | null) => void;
  onReorderColumn: (draggedId: number, targetId: number) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(column.name);

  const moveTask = async (taskId: number) => {
    onError(null);
    try {
      await api.patch(`/api/tasks/${taskId}/move`, { columnId: column.id });
      onChanged();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Unable to move the task.");
    }
  };

  // Columns are draggable (super admin only) to reorder them.
  const [{ isDragging }, dragColumn, dragPreview] = useDrag(
    () => ({
      type: "COLUMN",
      item: { id: column.id },
      canDrag: isAdmin,
      collect: (m) => ({ isDragging: m.isDragging() }),
    }),
    [column.id, isAdmin]
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ["TASK", "COLUMN"],
      drop: (item: { id: number }, monitor) => {
        if (monitor.getItemType() === "COLUMN") onReorderColumn(item.id, column.id);
        else moveTask(item.id);
      },
      collect: (m) => ({ isOver: m.isOver() }),
    }),
    [column.id]
  );

  const addTask = async () => {
    if (!title.trim()) return;
    onError(null);
    try {
      await api.post("/api/tasks", { columnId: column.id, title: title.trim() });
      setTitle("");
      setAdding(false);
      onChanged();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Unable to add the task.");
    }
  };

  const rename = async () => {
    if (!name.trim()) return;
    try {
      await api.put(`/api/boards/columns/${column.id}`, { name: name.trim() });
      setRenaming(false);
      onChanged();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Unable to rename the column.");
    }
  };

  const remove = async () => {
    if (!confirm(`Delete the "${column.name}" column?`)) return;
    try {
      await api.del(`/api/boards/columns/${column.id}`);
      onChanged();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Unable to delete the column.");
    }
  };

  return (
    <div
      ref={(node) => {
        drop(node);
        dragPreview(node);
      }}
      className={`flex w-72 shrink-0 flex-col rounded-2xl border p-3 transition ${
        isDragging ? "opacity-50" : ""
      } ${
        isOver
          ? "border-accent-400 bg-accent-50/60 dark:border-accent-500/40 dark:bg-accent-500/[0.06]"
          : "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.02]"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        {renaming ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={rename}
            onKeyDown={(e) => e.key === "Enter" && rename()}
            className={INPUT_CLASS}
          />
        ) : (
          <h3
            ref={(node) => {
              dragColumn(node);
            }}
            title={isAdmin ? "Drag to reorder" : undefined}
            className={`flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 ${
              isAdmin ? "cursor-grab" : ""
            }`}
          >
            {column.name}
            <span className="rounded-full bg-gray-200 px-2 text-xs text-gray-500 dark:bg-white/10 dark:text-gray-400">
              {column.tasks.length}
            </span>
          </h3>
        )}
        {isAdmin && !renaming && (
          <div className="flex items-center gap-1.5 text-gray-400">
            <button type="button" onClick={() => setRenaming(true)} className="hover:text-gray-600 dark:hover:text-gray-200" title="Rename column" aria-label="Rename column">
              <PencilIcon className="h-4 w-4" />
            </button>
            <button type="button" onClick={remove} className="hover:text-error-500" title="Delete column" aria-label="Delete column">
              <TrashBinIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {column.tasks.map((task) => (
          <Card key={task.id} task={task} onOpen={onOpenTask} />
        ))}
      </div>

      {adding ? (
        <div className="mt-2">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="Task title…"
            className={INPUT_CLASS}
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={addTask}
              className="rounded-lg bg-accent-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-500 dark:bg-accent-500/15 dark:text-accent-200"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 rounded-lg px-2 py-1.5 text-left text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.04]"
        >
          + Add task
        </button>
      )}
    </div>
  );
}

// ── Card (drag source) ────────────────────────────────────────────────────────

function Card({ task, onOpen }: { task: TaskCard; onOpen: (id: number) => void }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "TASK",
      item: { id: task.id },
      collect: (m) => ({ isDragging: m.isDragging() }),
    }),
    [task.id]
  );

  return (
    <div
      ref={(node) => {
        drag(node);
      }}
      onClick={() => onOpen(task.id)}
      className={`cursor-grab rounded-xl border border-gray-200 bg-white p-3 shadow-theme-xs transition hover:shadow-theme-md dark:border-white/10 dark:bg-white/[0.04] ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <p className="text-sm font-medium text-gray-800 dark:text-white/90">{task.title}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <Badge tone={priorityTone(task.priority)}>{PRIORITY_LABEL[task.priority]}</Badge>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {task.commentCount > 0 && (
            <span className="flex items-center gap-1">
              <ChatIcon className="h-3.5 w-3.5" />
              {task.commentCount}
            </span>
          )}
          {task.dueDate && <span>{formatDateShort(task.dueDate)}</span>}
          {task.assignee && <Avatar name={task.assignee.fullName} />}
        </div>
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      title={name}
      className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-[10px] font-semibold text-white"
    >
      {initials}
    </span>
  );
}

// ── Add column (super admin) ──────────────────────────────────────────────────

function AddColumn({
  boardId,
  onChanged,
  onError,
}: {
  boardId: number;
  onChanged: () => void;
  onError: (msg: string | null) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const add = async () => {
    if (!name.trim()) return;
    onError(null);
    try {
      await api.post(`/api/boards/${boardId}/columns`, { name: name.trim() });
      setName("");
      setAdding(false);
      onChanged();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Unable to add the column.");
    }
  };

  return (
    <div className="w-72 shrink-0">
      {adding ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.02]">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="Column name…"
            className={INPUT_CLASS}
          />
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={add} className="rounded-lg bg-accent-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-500 dark:bg-accent-500/15 dark:text-accent-200">
              Add column
            </button>
            <button type="button" onClick={() => setAdding(false)} className="rounded-lg px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full rounded-2xl border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-500 hover:border-accent-400 hover:text-accent-600 dark:border-white/10 dark:text-gray-400 dark:hover:border-accent-500/40 dark:hover:text-accent-400"
        >
          + Add column
        </button>
      )}
    </div>
  );
}
