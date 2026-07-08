import { Suspense } from "react";
import KanbanBoard from "@/components/boards/KanbanBoard";
import RoleGate from "@/components/support/RoleGate";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RoleGate atLeast="SUPPORT_TEAM">
      <Suspense>
        <KanbanBoard boardId={Number(id)} />
      </Suspense>
    </RoleGate>
  );
}
