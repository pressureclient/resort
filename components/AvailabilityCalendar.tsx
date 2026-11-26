import { addDays } from '@/lib/format';

/** Two months of dates; nights where the room type is fully booked are crossed out (as on the La Luz site). */
export default function AvailabilityCalendar({ today, full }: { today: string; full: string[] }) {
  const fullSet = new Set(full);
  const [y, m] = today.split('-').map(Number);
  const months = [0, 1].map((k) => {
    const first = new Date(Date.UTC(y, m - 1 + k, 1));
    const daysIn = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    const lead = first.getUTCDay();
    const iso0 = first.toISOString().slice(0, 10);
    const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysIn }, (_, i) => addDays(iso0, i))];
    return { label: first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }), cells };
  });
  return (
    <div className="cal-wrap">
      {months.map((mo) => (
        <div className="cal" key={mo.label}>
          <div className="cal-title">{mo.label}</div>
          <div className="cal-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <span key={d} className="cal-dow">{d}</span>)}
            {mo.cells.map((iso, i) => iso === null ? <span key={i} /> : (
              <span key={iso} className={`cal-day${iso < today ? ' past' : ''}${fullSet.has(iso) ? ' full' : ''}`}
                title={fullSet.has(iso) ? 'Fully booked' : undefined} aria-label={`${iso}${fullSet.has(iso) ? ', fully booked' : ''}`}>
                {Number(iso.slice(8))}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
