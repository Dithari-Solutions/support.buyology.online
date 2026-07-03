import UsersView from "@/components/admin/UsersView";
import RoleGate from "@/components/support/RoleGate";

export default function UsersPage() {
  return (
    <RoleGate atLeast="SUPER_ADMIN">
      <UsersView />
    </RoleGate>
  );
}
