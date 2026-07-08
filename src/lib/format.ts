import {
  AccountStatus,
  NotificationType,
  RoleName,
  TicketPriority,
  TicketStatus,
} from "./types";

// ── Date helpers ───────────────────────────────────────────────────────────

export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function timeAgo(iso?: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return formatDateShort(iso);
}

// ── Label maps ─────────────────────────────────────────────────────────────

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED_WITHOUT_RESOLVE: "Closed",
  REJECTED: "Rejected",
};

export const PRIORITY_LABEL: Record<TicketPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const ROLE_LABEL: Record<RoleName, string> = {
  USER: "User",
  SUPPORT_TEAM: "Support Team",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

export const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = {
  PENDING_APPROVAL: "Pending Approval",
  ACTIVE: "Active",
  REJECTED: "Rejected",
  DISABLED: "Disabled",
};

// Statuses that close a ticket and therefore require a resolution note.
export const CLOSING_STATUSES: TicketStatus[] = [
  "RESOLVED",
  "CLOSED_WITHOUT_RESOLVE",
  "REJECTED",
];

// ── Badge colour classes (light + dark) ────────────────────────────────────

export type BadgeTone = "success" | "warning" | "error" | "info" | "gray";

const TONE_CLASS: Record<BadgeTone, string> = {
  success:
    "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400",
  warning:
    "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400",
  error: "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400",
  info: "bg-accent-50 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300",
  gray: "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300",
};

export function badgeClass(tone: BadgeTone): string {
  return TONE_CLASS[tone];
}

export function ticketStatusTone(status: TicketStatus): BadgeTone {
  switch (status) {
    case "OPEN":
      return "info";
    case "IN_PROGRESS":
      return "warning";
    case "RESOLVED":
      return "success";
    case "REJECTED":
      return "error";
    case "CLOSED_WITHOUT_RESOLVE":
    default:
      return "gray";
  }
}

export function priorityTone(priority: TicketPriority): BadgeTone {
  switch (priority) {
    case "URGENT":
      return "error";
    case "HIGH":
      return "warning";
    case "MEDIUM":
      return "info";
    case "LOW":
    default:
      return "gray";
  }
}

export function accountStatusTone(status: AccountStatus): BadgeTone {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "PENDING_APPROVAL":
      return "warning";
    case "REJECTED":
      return "error";
    case "DISABLED":
    default:
      return "gray";
  }
}

export function roleTone(role: RoleName): BadgeTone {
  switch (role) {
    case "SUPER_ADMIN":
      return "error";
    case "ADMIN":
      return "warning";
    case "SUPPORT_TEAM":
      return "info";
    case "USER":
    default:
      return "gray";
  }
}

export const NOTIFICATION_ICON: Record<NotificationType, string> = {
  TICKET_OPENED: "🎫",
  TICKET_ASSIGNED: "👤",
  TICKET_STATUS_CHANGED: "🔄",
  TICKET_CLOSED: "✅",
  COMMENT_ADDED: "💬",
  REGISTRATION_PENDING: "⏳",
  REGISTRATION_APPROVED: "✅",
  REGISTRATION_REJECTED: "⛔",
  ROLE_CHANGED: "🛡️",
  TASK_ASSIGNED: "📌",
  TASK_MENTIONED: "💬",
  TASK_COMMENTED: "🗒️",
};
