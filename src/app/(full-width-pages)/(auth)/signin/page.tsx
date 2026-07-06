import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Buyology Support",
  description: "Sign in to the Buyology Support portal",
};

export default function SignIn() {
  return <SignInForm />;
}
