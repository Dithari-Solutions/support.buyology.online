"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import FormAlert from "@/components/support/FormAlert";
import { api, ApiError } from "@/lib/api";
import Link from "next/link";
import React, { useState } from "react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/api/auth/forgot-password", { email: email.trim() }, false);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="mb-6">
          <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
            Forgot password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {sent ? (
          <FormAlert
            type="success"
            message="If an account exists for that email, a password reset link has been sent."
          />
        ) : (
          <form onSubmit={onSubmit}>
            <div className="space-y-5">
              {error && <FormAlert type="error" message={error} />}
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="name.surname@aztu.edu.az"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button className="w-full" size="sm" disabled={submitting}>
                {submitting ? "Sending…" : "Send reset link"}
              </Button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-700 dark:text-gray-400">
          <Link href="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
