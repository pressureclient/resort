import { redirect } from 'next/navigation';

// Older links pointed here; the booking flow now continues at /book/details.
type SP = Promise<Record<string, string | string[] | undefined>>;
export default async function OldConfirm({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === 'string' ? [[k, v]] : [])));
  redirect(`/book/details?${q.toString()}`);
}
