export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <div className="text-sm text-muted-foreground">Event detail placeholder for: {slug}</div>;
}
