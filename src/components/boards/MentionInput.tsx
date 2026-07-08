"use client";

import { useRef, useState } from "react";
import { UserSummary } from "@/lib/types";

const INPUT_CLASS =
  "w-full rounded-xl border bg-transparent px-4 py-2.5 text-sm text-gray-800 border-gray-300 shadow-theme-xs placeholder:text-gray-400 focus:border-accent-400 focus:outline-hidden focus:ring-3 focus:ring-accent-500/15 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-accent-500/60";

/**
 * Textarea with @mention autocomplete. Typing "@" opens a member picker;
 * selecting a person inserts "@their.email " into the text.
 */
export default function MentionInput({
  value,
  onChange,
  members,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  members: UserSummary[];
  placeholder?: string;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [caret, setCaret] = useState(0);

  const detect = (text: string, pos: number) => {
    const upto = text.slice(0, pos);
    const m = upto.match(/(?:^|\s)@([\w.@+-]*)$/);
    if (m) {
      setQuery(m[1]);
      setCaret(pos);
    } else {
      setQuery(null);
    }
  };

  const pick = (u: UserSummary) => {
    const before = value.slice(0, caret);
    const start = before.lastIndexOf("@");
    const next = value.slice(0, start) + "@" + u.email + " " + value.slice(caret);
    onChange(next);
    setQuery(null);
    ref.current?.focus();
  };

  const filtered =
    query !== null
      ? members
          .filter((m) =>
            `${m.fullName} ${m.email}`.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 6)
      : [];

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          detect(e.target.value, e.target.selectionStart ?? e.target.value.length);
        }}
        onKeyUp={(e) => {
          const el = e.target as HTMLTextAreaElement;
          detect(el.value, el.selectionStart ?? 0);
        }}
        onBlur={() => setTimeout(() => setQuery(null), 150)}
        className={INPUT_CLASS}
      />
      {query !== null && filtered.length > 0 && (
        <ul className="absolute left-0 z-30 mt-1 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-gray-800">
          {filtered.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(m);
                }}
                className="flex w-full flex-col px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/[0.04]"
              >
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {m.fullName}
                </span>
                <span className="font-mono text-xs text-gray-400">{m.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
