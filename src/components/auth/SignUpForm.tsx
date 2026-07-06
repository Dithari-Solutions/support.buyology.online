"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import FormAlert from "@/components/support/FormAlert";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import Link from "next/link";
import React, { useState } from "react";

export default function SignUpForm() {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to register. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-50 text-2xl dark:bg-success-500/10">
              ✅
            </div>
            <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90">
              Registration received
            </h1>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              We&apos;ve sent a verification email to <strong>{form.email}</strong>. Please confirm
              your address. An administrator will then review and approve your account — you&apos;ll
              be notified by email once it&apos;s activated.
            </p>
            <Link
              href="/signin"
              className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
        <div className="mb-6">
          <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Register with your corporate <strong>@aztu.edu.az</strong> email address.
          </p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="space-y-5">
            {error && <FormAlert type="error" message={error} />}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>
                  First name <span className="text-error-500">*</span>
                </Label>
                <Input placeholder="Firdovsi" value={form.firstName} onChange={set("firstName")} />
              </div>
              <div>
                <Label>
                  Last name <span className="text-error-500">*</span>
                </Label>
                <Input placeholder="Rzaev" value={form.lastName} onChange={set("lastName")} />
              </div>
            </div>

            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="name.surname@aztu.edu.az"
                value={form.email}
                onChange={set("email")}
              />
            </div>

            <div>
              <Label>
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={set("password")}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                  )}
                </span>
              </div>
            </div>

            <div>
              <Label>
                Confirm password <span className="text-error-500">*</span>
              </Label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={form.confirm}
                onChange={set("confirm")}
              />
            </div>

            <Button className="w-full" size="sm" disabled={submitting}>
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-700 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
