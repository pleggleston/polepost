export function PoleEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
