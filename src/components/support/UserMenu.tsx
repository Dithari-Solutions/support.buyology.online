"use client";

import { useAuth } from "@/context/AuthContext";
import { ROLE_LABEL, roleTone } from "@/lib/format";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Badge from "./Badge";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  const doLogout = async () => {
    setOpen(false);
    await logout();
    router.replace("/signin");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-full p-1 pr-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
          {initials}
        </span>
        <span className="hidden text-left lg:block">
          <span className="block text-sm font-medium text-gray-800 dark:text-white/90">
            {user.fullName}
          </span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            {ROLE_LABEL[user.role]}
          </span>
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
              {user.fullName}
            </p>
            <p className="mb-2 truncate text-xs text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
            <Badge tone={roleTone(user.role)}>{ROLE_LABEL[user.role]}</Badge>
          </div>
          <div className="py-1">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Account &amp; security
            </Link>
            <button
              onClick={doLogout}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
