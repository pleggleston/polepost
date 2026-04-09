import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/auth/site-url';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const next = requestUrl.searchParams.get('next') ?? '/';
  const safeNext = next.startsWith('/') ? next : '/';

  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  } else if (tokenHash && type) {
    await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash
    });
  }

  return NextResponse.redirect(new URL(safeNext, getSiteUrl()));
}
