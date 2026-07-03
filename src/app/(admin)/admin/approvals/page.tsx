import ApprovalsView from "@/components/admin/ApprovalsView";
import RoleGate from "@/components/support/RoleGate";

export default function ApprovalsPage() {
  return (
    <RoleGate atLeast="ADMIN">
      <ApprovalsView />
    </RoleGate>
  );
}
