import TicketDetailView from "@/components/tickets/TicketDetailView";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketDetailView ticketId={Number(id)} />;
}
