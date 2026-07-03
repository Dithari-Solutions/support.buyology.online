"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { AccountStatus, Page, RoleName, User } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/support/Spinner";
import PageHeader from "@/components/support/PageHeader";
import Badge from "@/components/support/Badge";
import SelectField from "@/components/support/SelectField";
import FormAlert from "@/components/support/FormAlert";
import {
  ACCOUNT_STATUS_LABEL,
  ROLE_LABEL,
  accountStatusTone,
  formatDate,
  roleTone,
} from "@/lib/format";

const ROLE_OPTIONS: { value: RoleName; label: string }[] = [
  { value: "USER", label: ROLE_LABEL.USER },
  { value: "SUPPORT_TEAM", label: ROLE_LABEL.SUPPORT_TEAM },
  { value: "ADMIN", label: ROLE_LABEL.ADMIN },
  { value: "SUPER_ADMIN", label: ROLE_LABEL.SUPER_ADMIN },
];

const STATUS_FILTER = [
  { value: "", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING_APPROVAL", label: "Pending" },
  { value: "DISABLED", label: "Disabled" },
  { value: "REJECTED", label: "Rejected" },
];

const ROLE_FILTER = [{ value: "", label: "All roles" }, ...ROLE_OPTIONS];

export default function UsersView() {
  const { user: me } = useAuth();
  const [data, setData] = useState<Page<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), size: "20" });
    if (statusFilter) qs.set("status", statusFilter);
    if (roleFilter) qs.set("role", roleFilter);
    try {
      setData(await api.get<Page<User>>(`/api/admin/users?${qs.toString()}`));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, roleFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter, roleFilter]);

  const changeRole = async (u: User, role: RoleName) => {
    if (role === u.role) return;
    setError(null);
    setBusyId(u.id);
    try {
      await api.patch(`/api/admin/users/${u.id}/role`, { role });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to change role.");
    } finally {
      setBusyId(null);
    }
  };

  const changeStatus = async (u: User, status: AccountStatus) => {
    if (status === u.status) return;
    setError(null);
    setBusyId(u.id);
    try {
      await api.patch(`/api/admin/users/${u.id}/status`, { status });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to change status.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Users & roles" subtitle="Manage every account's role and access." />
      {error && <div className="mb-4"><FormAlert type="error" message={error} /></div>}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-1/2">
        <SelectField options={STATUS_FILTER} value={statusFilter} onChange={setStatusFilter} placeholder="Status" />
        <SelectField options={ROLE_FILTER} value={roleFilter} onChange={setRoleFilter} placeholder="Role" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <Spinner label="Loading users…" />
        ) : !data || data.content.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Change role</th>
                  <th className="px-5 py-3 font-medium">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.content.map((u) => {
                  const isMe = me?.id === u.id;
                  return (
                    <tr key={u.id} className={busyId === u.id ? "opacity-50" : ""}>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800 dark:text-white/90">
                          {u.fullName} {isMe && <span className="text-xs text-gray-400">(you)</span>}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                        <p className="text-xs text-gray-400">Joined {formatDate(u.createdAt)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={accountStatusTone(u.status)}>
                          {ACCOUNT_STATUS_LABEL[u.status]}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={roleTone(u.role)}>{ROLE_LABEL[u.role]}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="w-44">
                          <SelectField
                            options={ROLE_OPTIONS}
                            value={u.role}
                            onChange={(v) => changeRole(u, v as RoleName)}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {u.status === "ACTIVE" ? (
                          <button
                            type="button"
                            disabled={isMe}
                            onClick={() => changeStatus(u, "DISABLED")}
                            className="text-sm text-error-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40 dark:text-error-400"
                          >
                            Disable
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => changeStatus(u, "ACTIVE")}
                            className="text-sm text-success-600 hover:underline dark:text-success-400"
                          >
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>
            Page {data.page + 1} of {data.totalPages} · {data.totalElements} users
          </span>
          <div className="flex gap-2">
            <button
              disabled={data.first}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
            >
              Previous
            </button>
            <button
              disabled={data.last}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
