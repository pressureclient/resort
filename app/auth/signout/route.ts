import { NextResponse, type NextRequest } from 'next/server';
import { isConfigured, supabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  if (isConfigured) {
    const sb = await supabaseServer();
    await sb.auth.signOut();
  }
  return NextResponse.redirect(new URL('/', request.url), { status: 303 });
}
