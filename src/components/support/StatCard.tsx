import Link from "next/link";
import { ReactNode } from "react";

export default function StatCard({
  label,
  value,
  icon,
  href,
  tone = "brand",
}: {
  label: string;
  value: number | string;
  icon?: ReactNode;
  href?: string;
  tone?: "brand" | "accent" | "success" | "warning" | "error";
}) {
  const toneClass = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300",
    accent: "bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300",
    success: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400",
    warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400",
    error: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400",
  }[tone];

  const body = (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${toneClass}`}
        >
          {icon ?? "•"}
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-800 dark:text-white/90">{value}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
