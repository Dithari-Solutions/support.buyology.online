"use client";

import { ReactNode, useId } from "react";

export type Icon3DName =
  | "rocket"
  | "ticket"
  | "inbox"
  | "bell"
  | "users"
  | "server"
  | "refresh"
  | "shieldCheck"
  | "hourglass"
  | "gauge"
  | "chip"
  | "layers"
  | "code"
  | "terminal"
  | "database"
  | "branch"
  | "cloud"
  | "bug";

export type Icon3DTone =
  | "brand"
  | "accent"
  | "cyan"
  | "violet"
  | "success"
  | "warning"
  | "error";

// [top-light, bottom-dark, glow]
const TONES: Record<Icon3DTone, [string, string, string]> = {
  brand: ["#5b74c9", "#1b2354", "#3b4da3"],
  accent: ["#7db4e5", "#2f66a0", "#4a90d0"],
  cyan: ["#3ad6ef", "#0e7490", "#1fb6d6"],
  violet: ["#a78bfa", "#6d28d9", "#8b5cf6"],
  success: ["#4ade80", "#16a34a", "#22c55e"],
  warning: ["#fbbf24", "#d97706", "#f59e0b"],
  error: ["#fb7185", "#e11d48", "#f43f5e"],
};

const GLYPHS: Record<Icon3DName, ReactNode> = {
  rocket: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </>
  ),
  ticket: (
    <>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v14" strokeDasharray="2 3" />
    </>
  ),
  inbox: (
    <>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </>
  ),
  bell: (
    <>
      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  server: (
    <>
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <path d="M6 6h.01" />
      <path d="M6 18h.01" />
    </>
  ),
  refresh: (
    <>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  hourglass: (
    <>
      <path d="M5 22h14" />
      <path d="M5 2h14" />
      <path d="M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22" />
      <path d="M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2" />
    </>
  ),
  gauge: (
    <>
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </>
  ),
  chip: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
    </>
  ),
  layers: (
    <>
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 12.5-9.17 4.16a2 2 0 0 1-1.66 0L2 12.5" />
      <path d="m22 17.5-9.17 4.16a2 2 0 0 1-1.66 0L2 17.5" />
    </>
  ),
  code: (
    <>
      <path d="m16 18 6-6-6-6" />
      <path d="m8 6-6 6 6 6" />
    </>
  ),
  terminal: (
    <>
      <path d="m4 17 6-6-6-6" />
      <path d="M12 19h8" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </>
  ),
  branch: (
    <>
      <line x1="6" x2="6" y1="3" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </>
  ),
  cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
  bug: (
    <>
      <path d="m8 2 1.88 1.88" />
      <path d="M14.12 3.88 16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </>
  ),
};

export default function Icon3D({
  name,
  tone = "brand",
  size = 54,
  className = "",
  float = false,
  delay = 0,
}: {
  name: Icon3DName;
  tone?: Icon3DTone;
  size?: number;
  className?: string;
  /** Continuously bob up and down. */
  float?: boolean;
  /** Animation start offset in seconds (stagger multiple icons). */
  delay?: number;
}) {
  const raw = useId().replace(/:/g, "");
  const gid = `g-${raw}`;
  const glossId = `gl-${raw}`;
  const [light, dark, glow] = TONES[tone];

  return (
    <span
      className={`inline-flex ${float ? "animate-float" : ""} ${className}`}
      style={{
        filter: `drop-shadow(0 8px 16px ${glow}5c)`,
        animationDelay: float ? `${delay}s` : undefined,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gid} x1="28" y1="0" x2="28" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor={light} />
            <stop offset="1" stopColor={dark} />
          </linearGradient>
          <linearGradient id={glossId} x1="28" y1="0" x2="28" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="56" height="56" rx="17" fill={`url(#${gid})`} />
        <rect width="56" height="56" rx="17" fill={`url(#${glossId})`} />
        <rect
          x="0.9"
          y="0.9"
          width="54.2"
          height="54.2"
          rx="16.1"
          stroke="#ffffff"
          strokeOpacity="0.3"
          strokeWidth="1.4"
        />
        <g
          transform="translate(16 16)"
          stroke="#ffffff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {GLYPHS[name]}
        </g>
      </svg>
    </span>
  );
}
