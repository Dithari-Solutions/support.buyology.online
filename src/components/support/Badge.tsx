import { badgeClass, BadgeTone } from "@/lib/format";
import { ReactNode } from "react";

export default function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${badgeClass(
        tone
      )}`}
    >
      {children}
    </span>
  );
}
