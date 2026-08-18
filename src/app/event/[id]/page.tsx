export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const { default: EventClient } = await import('./EventClient');
  
  return <EventClient eventId={resolvedParams.id} />;
}
