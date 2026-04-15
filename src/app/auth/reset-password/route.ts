import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/auth/site-url';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // After exchange the session cookie is set; redirect to the form page.
  return NextResponse.redirect(new URL('/new-password', getSiteUrl()));
}
