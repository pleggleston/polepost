import Link from 'next/link';
import { redirect } from 'next/navigation';
import { OrganizerApplyForm } from '@/components/organizer/organizer-apply-form';
import { getCurrentUser } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

type PageProps = {
  searchParams: Promise<{ submitted?: string }>;
};

export default async function OrganizerApplyPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const params = await searchParams;

  // Check if they already have an active organizer account
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('organizers')
    .select('id, is_active')
    .eq('owner_profile_id', user.id)
    .maybeSingle<{ id: string; is_active: boolean }>();

  if (existing?.is_active) {
    redirect('/organizer');
  }

  if (existing && !existing.is_active) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <h1 className="text-lg font-semibold">Application pending</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your organizer application is under review. You will gain access to the organizer dashboard once an admin approves it.
          </p>
        </div>
        <Link href="/" className="inline-flex text-sm font-medium text-primary hover:underline">
          Back to home
        </Link>
      </section>
    );
  }

  if (params.submitted === '1') {
    return (
      <section className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <h1 className="text-lg font-semibold">Application submitted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your organizer application is under review. You will gain access to the organizer dashboard once an admin approves it.
          </p>
        </div>
        <Link href="/" className="inline-flex text-sm font-medium text-primary hover:underline">
          Back to home
        </Link>
      </section>
    );
  }

  return <OrganizerApplyForm />;
}
