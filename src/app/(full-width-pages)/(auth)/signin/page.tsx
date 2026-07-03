import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | AzTU Support",
  description: "Sign in to the AzTU Support portal",
};

export default function SignIn() {
  return <SignInForm />;
}
