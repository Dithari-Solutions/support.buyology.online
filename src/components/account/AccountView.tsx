"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/support/Badge";
import FormAlert from "@/components/support/FormAlert";
import PageHeader from "@/components/support/PageHeader";
import { ACCOUNT_STATUS_LABEL, ROLE_LABEL, accountStatusTone, roleTone } from "@/lib/format";

export default function AccountView() {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (next !== confirm) {
      setMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (next.length < 8) {
      setMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    setBusy(true);
    try {
      await api.post("/api/account/change-password", { currentPassword: current, newPassword: next });
      setMsg({ type: "success", text: "Your password has been changed." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setMsg({
        type: "error",
        text: err instanceof ApiError ? err.message : "Unable to change password.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Account & security" subtitle="Manage your profile and password." />

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-lg font-semibold text-white">
            {(user.firstName[0] ?? "") + (user.lastName[0] ?? "")}
          </span>
          <div>
            <p className="text-lg font-semibold text-gray-800 dark:text-white/90">{user.fullName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            <div className="mt-2 flex gap-2">
              <Badge tone={roleTone(user.role)}>{ROLE_LABEL[user.role]}</Badge>
              <Badge tone={accountStatusTone(user.status)}>
                {ACCOUNT_STATUS_LABEL[user.status]}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
      >
        <h2 className="font-semibold text-gray-800 dark:text-white/90">Change password</h2>
        {msg && <FormAlert type={msg.type} message={msg.text} />}
        <div>
          <Label>
            Current password <span className="text-error-500">*</span>
          </Label>
          <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div>
          <Label>
            New password <span className="text-error-500">*</span>
          </Label>
          <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
        </div>
        <div>
          <Label>
            Confirm new password <span className="text-error-500">*</span>
          </Label>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <Button size="sm" disabled={busy}>
          {busy ? "Saving…" : "Change password"}
        </Button>
      </form>
    </div>
  );
}
