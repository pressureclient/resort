type P = { size?: number };
const base = (size = 20) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true,
});

export const Logo = ({ size = 30 }: P) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <circle cx="16" cy="13" r="6" fill="#E8A15A" />
    <path d="M3 21c3.5-2.4 6.5-2.4 10 0s6.5 2.4 10 0 4.5-1.6 6-1.2" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M3 26c3.5-2.4 6.5-2.4 10 0s6.5 2.4 10 0 4.5-1.6 6-1.2" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".55" />
  </svg>
);

export const Wifi = ({ size }: P) => (<svg {...base(size)}><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a14.5 14.5 0 0 1 20 0" /><circle cx="12" cy="19.5" r="1" fill="currentColor" /></svg>);
export const Beach = ({ size }: P) => (<svg {...base(size)}><path d="M12 4v15M4.5 9.5C6 6 9 4 12 4s6 2 7.5 5.5c-2.5-1-5-1-7.5 0-2.5-1-5-1-7.5 0Z" /><path d="M3 20c3-1.3 6-1.3 9 0s6 1.3 9 0" /></svg>);
export const Wave = ({ size }: P) => (<svg {...base(size)}><path d="M2 8c2.5-2 5-2 7.5 0s5 2 7.5 0 3.5-1.5 5-1M2 13c2.5-2 5-2 7.5 0s5 2 7.5 0 3.5-1.5 5-1M2 18c2.5-2 5-2 7.5 0s5 2 7.5 0 3.5-1.5 5-1" /></svg>);
export const Sun = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>);
export const Users = ({ size = 16 }: P) => (<svg {...base(size)}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5.5 5.5 0 0 1 3.5 6" /></svg>);
export const Bed = ({ size = 16 }: P) => (<svg {...base(size)}><path d="M3 18V6M3 13h18v5M21 13v-2a3 3 0 0 0-3-3h-7v5" /><circle cx="7" cy="10" r="1.6" /></svg>);
export const Ruler = ({ size = 16 }: P) => (<svg {...base(size)}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h4M3 15h4M9 3v4M15 3v4" /></svg>);
export const Check = ({ size = 18 }: P) => (<svg {...base(size)}><path d="m5 12.5 4.2 4.2L19 7" /></svg>);
export const Arrow = ({ size = 16 }: P) => (<svg {...base(size)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const Star = ({ size = 16 }: P) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8Z" /></svg>);
export const Menu = ({ size = 24 }: P) => (<svg {...base(size)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const Info = ({ size = 20 }: P) => (<svg {...base(size)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>);
export const Pin = ({ size = 18 }: P) => (<svg {...base(size)}><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></svg>);

export const highlightIcon = { wifi: Wifi, beach: Beach, wave: Wave, sun: Sun };
