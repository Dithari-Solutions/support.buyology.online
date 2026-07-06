"use client";
import Spinner from "@/components/support/Spinner";
import { api, ApiError } from "@/lib/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function VerifyEmailForm() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token) {
      setState("error");
      setMessage("This verification link is invalid or missing its token.");
      return;
    }
    (async () => {
      try {
        const res = await api.post<{ message: string }>(
          "/api/auth/verify-email",
          { token },
          false
        );
        setState("success");
        setMessage(res.message);
      } catch (err) {
        setState("error");
        setMessage(err instanceof ApiError ? err.message : "Verification failed.");
      }
    })();
  }, [token]);

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="text-center">
          {state === "loading" && <Spinner label="Verifying your email…" />}
          {state !== "loading" && (
            <>
              <div
                className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
                  state === "success"
                    ? "bg-success-50 dark:bg-success-500/10"
                    : "bg-error-50 dark:bg-error-500/10"
                }`}
              >
                {state === "success" ? "✅" : "⛔"}
              </div>
              <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90">
                {state === "success" ? "Email verified" : "Verification failed"}
              </h1>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{message}</p>
              <Link
                href="/signin"
                className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Go to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
