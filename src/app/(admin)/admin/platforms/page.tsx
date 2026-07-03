import PlatformsView from "@/components/admin/PlatformsView";
import RoleGate from "@/components/support/RoleGate";

export default function PlatformsPage() {
  return (
    <RoleGate atLeast="ADMIN">
      <PlatformsView />
    </RoleGate>
  );
}
