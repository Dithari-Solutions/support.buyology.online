"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import FormAlert from "@/components/support/FormAlert";
import { api, ApiError } from "@/lib/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";

export default function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/auth/reset-password", { token, newPassword: password }, false);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="mb-6">
          <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
            Reset password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose a new password for your account.
          </p>
        </div>

        {!token ? (
          <FormAlert type="error" message="This reset link is invalid or missing its token." />
        ) : done ? (
          <div className="space-y-4">
            <FormAlert type="success" message="Your password has been reset successfully." />
            <Link
              href="/signin"
              className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Continue to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="space-y-5">
              {error && <FormAlert type="error" message={error} />}
              <div>
                <Label>
                  New password <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <Label>
                  Confirm password <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="password"
                  placeholder="Re-enter your new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              <Button className="w-full" size="sm" disabled={submitting}>
                {submitting ? "Resetting…" : "Reset password"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
