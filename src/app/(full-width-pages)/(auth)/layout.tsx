import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import RedirectIfAuthenticated from "@/components/support/RedirectIfAuthenticated";
import Icon3D from "@/components/support/Icon3D";
import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
      <ThemeProvider>
        <RedirectIfAuthenticated />

        {/* Decorative background: glow, dot grid, floating IT / software icons */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute left-[7%] top-[15%] hidden sm:block">
            <Icon3D name="code" tone="cyan" size={62} float />
          </div>
          <div className="absolute right-[9%] top-[12%] hidden sm:block">
            <Icon3D name="server" tone="accent" size={56} float delay={0.8} />
          </div>
          <div className="absolute bottom-[14%] left-[11%] hidden sm:block">
            <Icon3D name="database" tone="violet" size={54} float delay={0.4} />
          </div>
          <div className="absolute bottom-[16%] right-[10%] hidden sm:block">
            <Icon3D name="terminal" tone="brand" size={58} float delay={1.2} />
          </div>
          <div className="absolute left-[44%] top-[8%] hidden lg:block">
            <Icon3D name="branch" tone="success" size={44} float delay={0.6} />
          </div>
          <div className="absolute bottom-[9%] right-[28%] hidden lg:block">
            <Icon3D name="cloud" tone="accent" size={48} float delay={1} />
          </div>
          <div className="absolute left-[22%] top-[44%] hidden xl:block">
            <Icon3D name="chip" tone="cyan" size={42} float delay={0.3} />
          </div>
          <div className="absolute right-[19%] top-[42%] hidden xl:block">
            <Icon3D name="bug" tone="warning" size={40} float delay={0.9} />
          </div>
        </div>

        {/* Centered card */}
        <div className="relative z-10 flex min-h-screen items-center justify-center p-5">
          <div className="w-full max-w-md">
            <div className="mb-6 flex flex-col items-center text-center">
              <Image
                src="/images/logo/aztu-logo-dark.png"
                alt="AzTU"
                width={72}
                height={72}
                className="h-16 w-auto object-contain"
              />
              <h1 className="mt-3 text-2xl font-bold text-white">
                AzTU<span className="text-accent-300"> Support</span>
              </h1>
              <p className="mt-1 text-sm text-white/60">
                Azerbaijan Technical University · IT Support
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-2xl dark:bg-gray-900 sm:p-8">
              {children}
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
