'use client';

import { approveVerificationAction, denyVerificationAction } from '@/app/(admin)/admin/verification/actions';
import type { PendingVerification } from '@/lib/admin/verification';

type AdminVerificationQueueProps = {
  items: PendingVerification[];
};

export function AdminVerificationQueue({ items }: AdminVerificationQueueProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
        No pending verification requests.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <VerificationCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function VerificationCard({ item }: { item: PendingVerification }) {
  const displayName = item.display_name || item.username || 'Unknown user';
  const location = [item.home_city, item.home_state].filter(Boolean).join(', ');
  const requestedDate = new Date(item.requested_21_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleApprove = async () => {
    await approveVerificationAction(item.id);
  };

  const handleDeny = async () => {
    await denyVerificationAction(item.id);
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="space-y-0.5">
        <p className="font-medium">{displayName}</p>
        {item.username ? <p className="text-sm text-muted-foreground">@{item.username}</p> : null}
        {location ? <p className="text-sm text-muted-foreground">{location}</p> : null}
        <p className="text-xs text-muted-foreground">Requested {requestedDate}</p>
      </div>

      <div className="flex gap-2">
        <form action={handleApprove}>
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Approve
          </button>
        </form>
        <form action={handleDeny}>
          <button
            type="submit"
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            Deny
          </button>
        </form>
      </div>
    </div>
  );
}
