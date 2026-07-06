import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import RedirectIfAuthenticated from "@/components/support/RedirectIfAuthenticated";
import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <ThemeProvider>
        <RedirectIfAuthenticated />

        {/* Simple background: faint dot grid + one soft glow behind the card */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/[0.06] blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
        </div>

        {/* Centered card */}
        <div className="relative z-10 flex min-h-screen items-center justify-center p-5">
          <div className="w-full max-w-md">
            <div className="mb-6 flex flex-col items-center text-center">
              {/* Black wordmark in light mode, white in dark */}
              <Image
                src="/images/logo/buyology-logo-black.svg"
                alt="Buyology"
                width={220}
                height={46}
                className="h-11 w-auto dark:hidden"
                priority
                unoptimized
              />
              <Image
                src="/images/logo/buyology-logo-white.svg"
                alt="Buyology"
                width={220}
                height={46}
                className="hidden h-11 w-auto dark:block"
                priority
                unoptimized
              />
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.25em] text-accent-600 dark:text-accent-400">
                Customer Support
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-white/60">
                Certified Refurbished Electronics
              </p>
            </div>

            {/* Terminal-window card */}
            <div className="glow-warm overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/70">
              <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-white/10">
                <span className="h-3 w-3 rounded-full bg-accent-500" />
                <span className="h-3 w-3 rounded-full bg-gold-500" />
                <span className="h-3 w-3 rounded-full bg-success-500" />
                <span className="ml-2 font-mono text-xs text-gray-400 dark:text-white/50">
                  ~/buyology/auth
                </span>
              </div>
              <div className="bg-white p-6 dark:bg-gray-900 sm:p-8">{children}</div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </ThemeProvider>
    </div>
  );
}
