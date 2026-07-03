"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Page, RoleName, User } from "@/lib/types";
import Spinner from "@/components/support/Spinner";
import PageHeader from "@/components/support/PageHeader";
import Badge from "@/components/support/Badge";
import Button from "@/components/ui/button/Button";
import SelectField from "@/components/support/SelectField";
import TextArea from "@/components/form/input/TextArea";
import FormAlert from "@/components/support/FormAlert";
import { ROLE_LABEL, formatDate } from "@/lib/format";

const ROLE_OPTIONS: { value: RoleName; label: string }[] = [
  { value: "USER", label: ROLE_LABEL.USER },
  { value: "SUPPORT_TEAM", label: ROLE_LABEL.SUPPORT_TEAM },
  { value: "ADMIN", label: ROLE_LABEL.ADMIN },
];

export default function ApprovalsView() {
  const [data, setData] = useState<Page<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Record<number, RoleName>>({});
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Page<User>>("/api/admin/users/pending?size=50");
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id: number) => {
    setError(null);
    setBusyId(id);
    try {
      await api.post(`/api/admin/users/${id}/approve`, { role: roles[id] ?? "USER" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to approve.");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: number) => {
    setError(null);
    if (!reason.trim()) {
      setError("Please provide a reason for rejection.");
      return;
    }
    setBusyId(id);
    try {
      await api.post(`/api/admin/users/${id}/reject`, { reason: reason.trim() });
      setRejecting(null);
      setReason("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to reject.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Pending approvals" subtitle="Review and approve new registration requests." />
      {error && <div className="mb-4"><FormAlert type="error" message={error} /></div>}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <Spinner label="Loading requests…" />
        ) : !data || data.content.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            🎉 No pending registration requests.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.content.map((u) => (
              <li key={u.id} className="px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 dark:text-white/90">
                      {u.fullName}{" "}
                      {u.emailVerified ? (
                        <Badge tone="success">Email verified</Badge>
                      ) : (
                        <Badge tone="warning">Email unverified</Badge>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                    <p className="text-xs text-gray-400">Requested {formatDate(u.createdAt)}</p>
                  </div>

                  {rejecting !== u.id && (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="w-40">
                        <SelectField
                          options={ROLE_OPTIONS}
                          value={roles[u.id] ?? "USER"}
                          onChange={(v) => setRoles({ ...roles, [u.id]: v as RoleName })}
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => approve(u.id)}
                        disabled={busyId === u.id}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRejecting(u.id);
                          setReason("");
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>

                {rejecting === u.id && (
                  <div className="mt-3 rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-500/30 dark:bg-error-500/10">
                    <TextArea
                      rows={2}
                      placeholder="Reason for rejection (sent to the applicant)…"
                      value={reason}
                      onChange={setReason}
                    />
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => reject(u.id)}
                        disabled={busyId === u.id}
                      >
                        Confirm rejection
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setRejecting(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
