import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  return session?.user ?? null;
});
