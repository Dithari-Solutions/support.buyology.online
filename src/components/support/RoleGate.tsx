"use client";

import { useAuth } from "@/context/AuthContext";
import { RoleName } from "@/lib/types";
import { ReactNode } from "react";

/**
 * Renders children only if the current user meets the required role.
 * Note: this is UI convenience only — the backend enforces all permissions.
 */
export default function RoleGate({
  atLeast,
  roles,
  children,
}: {
  atLeast?: RoleName;
  roles?: RoleName[];
  children: ReactNode;
}) {
  const { user, isAtLeast, hasRole } = useAuth();

  const allowed = user
    ? (atLeast ? isAtLeast(atLeast) : true) && (roles ? hasRole(...roles) : true)
    : false;

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
          Access restricted
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You don&apos;t have permission to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
