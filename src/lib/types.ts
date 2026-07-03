// Shared API types — mirror the AzTU Support backend DTOs.

export type RoleName = "USER" | "SUPPORT_TEAM" | "ADMIN" | "SUPER_ADMIN";

export type AccountStatus = "PENDING_APPROVAL" | "ACTIVE" | "REJECTED" | "DISABLED";

export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED_WITHOUT_RESOLVE"
  | "REJECTED";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type NotificationType =
  | "TICKET_OPENED"
  | "TICKET_ASSIGNED"
  | "TICKET_STATUS_CHANGED"
  | "TICKET_CLOSED"
  | "COMMENT_ADDED"
  | "REGISTRATION_PENDING"
  | "REGISTRATION_APPROVED"
  | "REGISTRATION_REJECTED"
  | "ROLE_CHANGED";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: RoleName;
  status: AccountStatus;
  emailVerified: boolean;
  rejectionReason: string | null;
  createdAt: string;
  approvedAt: string | null;
}

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
  role: RoleName;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Platform {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  additional: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  platformId: number;
  platformName: string;
  name: string;
  description: string | null;
  active: boolean;
}

export interface TicketSummary {
  id: number;
  ticketNumber: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  platformName: string | null;
  categoryName: string | null;
  createdByName: string | null;
  assignedToName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  authorId: number;
  authorName: string;
  authorRole: RoleName;
  body: string;
  internal: boolean;
  createdAt: string;
}

export interface StatusHistory {
  id: number;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus;
  reason: string | null;
  changedByName: string;
  createdAt: string;
}

export interface Attachment {
  id: number;
  originalFilename: string;
  contentType: string | null;
  fileSize: number | null;
  uploadedByName: string;
  createdAt: string;
}

export interface TicketDetail {
  id: number;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  platformId: number | null;
  platformName: string | null;
  categoryId: number | null;
  categoryName: string | null;
  createdBy: UserSummary | null;
  assignedTo: UserSummary | null;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  comments: Comment[];
  statusHistory: StatusHistory[];
  attachments: Attachment[];
}

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  ticketId: number | null;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  role: RoleName;
  myTickets: number | null;
  myOpenTickets: number | null;
  assignedToMe: number | null;
  totalTickets: number | null;
  openTickets: number | null;
  inProgressTickets: number | null;
  resolvedTickets: number | null;
  closedTickets: number | null;
  pendingApprovals: number | null;
  totalUsers: number | null;
  unreadNotifications: number | null;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
