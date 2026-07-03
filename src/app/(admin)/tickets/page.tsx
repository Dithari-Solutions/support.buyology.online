import TicketsList from "@/components/tickets/TicketsList";
import { Suspense } from "react";

export default function TicketsPage() {
  return (
    <Suspense>
      <TicketsList />
    </Suspense>
  );
}
