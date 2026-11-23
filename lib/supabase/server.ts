import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** False until Supabase keys are set. The site still renders, and booking pages explain what to connect. */
export const isConfigured = Boolean(url && key);

export async function supabaseServer() {
  if (!url || !key) throw new Error('Supabase is not configured. Copy .env.example to .env.local and add your keys.');
  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component. Middleware refreshes the session instead.
        }
      },
    },
  });
}

export async function getUser() {
  if (!isConfigured) return null;
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  return data.user;
}

export async function getProfile() {
  const user = await getUser();
  if (!user) return { user: null, isAdmin: false, fullName: null as string | null };
  const sb = await supabaseServer();
  const { data } = await sb.from('profiles').select('full_name, is_admin').eq('id', user.id).maybeSingle();
  return { user, isAdmin: Boolean(data?.is_admin), fullName: (data?.full_name as string | null) ?? null };
}
