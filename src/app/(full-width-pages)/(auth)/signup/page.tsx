import { redirect } from "next/navigation";

// Public self-registration is disabled — accounts are created by a
// super admin under Admin → Users & roles. Any hit to /signup is
// bounced to the sign-in screen.
export default function SignUp() {
  redirect("/signin");
}
