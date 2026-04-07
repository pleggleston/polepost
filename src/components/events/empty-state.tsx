import Link from 'next/link';

type EmptyStateProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: '/' | '/browse';
};

export function EmptyState({ title, description, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <section className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {ctaLabel && ctaHref ? (
        <Link href={ctaHref} className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {ctaLabel}
        </Link>
      ) : null}
    </section>
  );
}
