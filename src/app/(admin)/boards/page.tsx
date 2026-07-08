import BoardsList from "@/components/boards/BoardsList";
import RoleGate from "@/components/support/RoleGate";

export default function BoardsPage() {
  return (
    <RoleGate atLeast="SUPPORT_TEAM">
      <BoardsList />
    </RoleGate>
  );
}
