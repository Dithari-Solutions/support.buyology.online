import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Buyology Support",
  description: "Reset your Buyology Support password",
};

export default function ForgotPassword() {
  return <ForgotPasswordForm />;
}
