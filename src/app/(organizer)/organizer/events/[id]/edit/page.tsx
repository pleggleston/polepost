export default async function OrganizerEditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <div className="text-sm text-muted-foreground">Edit event placeholder: {id}</div>;
}
