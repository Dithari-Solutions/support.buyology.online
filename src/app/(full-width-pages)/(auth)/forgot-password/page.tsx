import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | AzTU Support",
  description: "Reset your AzTU Support password",
};

export default function ForgotPassword() {
  return <ForgotPasswordForm />;
}
