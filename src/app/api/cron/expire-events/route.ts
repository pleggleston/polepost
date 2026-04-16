import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/db/database.types';

/**
 * Cron endpoint: marks approved events whose expires_at has passed as expired.
 *
 * Must be called with `Authorization: Bearer <CRON_SECRET>`.
 * In Vercel, schedule this in vercel.json and set CRON_SECRET + SUPABASE_SERVICE_ROLE_KEY
 * as environment variables.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' },
      { status: 500 }
    );
  }

  // Use service-role client so we can bypass RLS and call the SECURITY DEFINER function.
  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase.rpc('expire_stale_events');

  if (error) {
    console.error('[expire-events] RPC error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const count = data ?? 0;
  console.log(`[expire-events] Marked ${count} event(s) as expired.`);
  return NextResponse.json({ expired: count });
}
