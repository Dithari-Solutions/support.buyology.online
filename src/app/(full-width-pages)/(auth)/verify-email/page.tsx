import VerifyEmailForm from "@/components/auth/VerifyEmailForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Verify Email | AzTU Support",
  description: "Verify your AzTU Support email address",
};

export default function VerifyEmail() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
