'use client';

import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/validation/env';
import type { Database } from '@/lib/db/database.types';

export function createClient() {
  return createBrowserClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
