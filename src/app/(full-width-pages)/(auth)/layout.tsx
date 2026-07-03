import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import RedirectIfAuthenticated from "@/components/support/RedirectIfAuthenticated";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-1 bg-white p-6 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <RedirectIfAuthenticated />
        <div className="relative flex h-screen w-full flex-col justify-center dark:bg-gray-900 sm:p-0 lg:flex-row">
          {children}
          <div className="hidden h-full w-full items-center bg-brand-900 dark:bg-white/5 lg:grid lg:w-1/2">
            <div className="relative z-1 flex items-center justify-center">
              <GridShape />
              <div className="flex max-w-sm flex-col items-center">
                <Link href="/" className="mb-6 block">
                  <Image
                    width={120}
                    height={120}
                    src="/images/logo/aztu-logo-dark.png"
                    alt="AzTU"
                    className="h-28 w-auto object-contain"
                  />
                </Link>
                <h2 className="mb-3 text-center text-2xl font-bold text-white">
                  AzTU Support
                </h2>
                <p className="text-center text-gray-300 dark:text-white/60">
                  Azerbaijan Technical University IT Support portal — open a ticket, track its
                  progress and get help from the support team.
                </p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
