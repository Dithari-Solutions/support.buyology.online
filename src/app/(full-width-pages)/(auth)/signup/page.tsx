import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | AzTU Support",
  description: "Register for the AzTU Support portal",
};

export default function SignUp() {
  return <SignUpForm />;
}
