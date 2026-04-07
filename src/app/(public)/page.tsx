import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Find local events by flyer.</h2>
      <p className="text-muted-foreground">PolePost MVP foundation is ready. Browse approved local events.</p>
      <Link href="/browse" className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
        Start Browsing
      </Link>
    </section>
  );
}
