import type { CountryCode } from '@/types/pathway';

/** Tiny simplified country flags (SVG, no emoji — Windows has no flag emoji). Decorative: pair with the city/country text. */
const W = 21, H = 14;
function Shape({ c }: { c: CountryCode }) {
  switch (c) {
    case 'KZ': return (<><rect width={W} height={H} fill="#00AFCA" /><circle cx="11" cy="6.4" r="2.6" fill="#FEC50C" /><path d="M7.2 10.4q3.8 1.8 7.6 0" stroke="#FEC50C" strokeWidth="1" fill="none" /><rect x="1.2" y="1" width="1" height="12" fill="#FEC50C" opacity=".85" /></>);
    case 'US': return (<><rect width={W} height={H} fill="#fff" />{Array.from({ length: 7 }).map((_, i) => <rect key={i} y={i * 2.15} width={W} height="1.08" fill="#B22234" />)}<rect width="9" height="7.5" fill="#3C3B6E" /></>);
    case 'DE': return (<><rect width={W} height={H / 3} fill="#1A1A1A" /><rect y={H / 3} width={W} height={H / 3} fill="#DD0000" /><rect y={(2 * H) / 3} width={W} height={H / 3} fill="#FFCE00" /></>);
    case 'NL': return (<><rect width={W} height={H / 3} fill="#AE1C28" /><rect y={H / 3} width={W} height={H / 3} fill="#fff" /><rect y={(2 * H) / 3} width={W} height={H / 3} fill="#21468B" /></>);
    case 'AT': return (<><rect width={W} height={H} fill="#ED2939" /><rect y={H / 3} width={W} height={H / 3} fill="#fff" /></>);
    case 'TR': return (<><rect width={W} height={H} fill="#E30A17" /><circle cx="7.6" cy="7" r="3.6" fill="#fff" /><circle cx="8.6" cy="7" r="2.9" fill="#E30A17" /><path d="M12.2 7l1.9-.7-1.2 1.6V6.1l1.2 1.6z" fill="#fff" /></>);
    case 'KR': return (<><rect width={W} height={H} fill="#fff" /><path d="M7.5 7a3 3 0 0 1 6 0z" fill="#CD2E3A" /><path d="M7.5 7a3 3 0 0 0 6 0z" fill="#0047A0" /><path d="M2.5 2.5l2 1.5M16.5 10l2 1.5M2.5 11.5l2-1.5M16.5 4l2-1.5" stroke="#1A1A1A" strokeWidth="1" /></>);
    case 'JP': return (<><rect width={W} height={H} fill="#fff" /><circle cx="10.5" cy="7" r="3.6" fill="#BC002D" /></>);
    case 'CH': return (<><rect width={W} height={H} fill="#DA291C" /><rect x="9.25" y="3" width="2.5" height="8" fill="#fff" /><rect x="6.5" y="5.75" width="8" height="2.5" fill="#fff" /></>);
    case 'CZ': return (<><rect width={W} height={H / 2} fill="#fff" /><rect y={H / 2} width={W} height={H / 2} fill="#D7141A" /><path d="M0 0l9 7-9 7z" fill="#11457E" /></>);
    case 'GB': return (<><rect width={W} height={H} fill="#012169" /><path d="M0 0l21 14M21 0L0 14" stroke="#fff" strokeWidth="2.6" /><path d="M0 0l21 14M21 0L0 14" stroke="#C8102E" strokeWidth="1" /><path d="M10.5 0v14M0 7h21" stroke="#fff" strokeWidth="4" /><path d="M10.5 0v14M0 7h21" stroke="#C8102E" strokeWidth="2.2" /></>);
    case 'CN': return (<><rect width={W} height={H} fill="#DE2910" /><circle cx="4.5" cy="4" r="1.8" fill="#FFDE00" /></>);
    case 'SG': return (<><rect width={W} height={H / 2} fill="#EF3340" /><rect y={H / 2} width={W} height={H / 2} fill="#fff" /><circle cx="4.5" cy="3.5" r="2" fill="#fff" /><circle cx="5.3" cy="3.5" r="1.8" fill="#EF3340" /></>);
    case 'AE': return (<><rect width={W} height={H / 3} fill="#00732F" /><rect y={H / 3} width={W} height={H / 3} fill="#fff" /><rect y={(2 * H) / 3} width={W} height={H / 3} fill="#1A1A1A" /><rect width="5.5" height={H} fill="#FF0000" /></>);
    case 'HK': return (<><rect width={W} height={H} fill="#DE2910" /><circle cx="10.5" cy="7" r="3" fill="#fff" /></>);
    default: return <rect width={W} height={H} fill="#C0D3CA" />;
  }
}
export function Flag({ code, className = '' }: { code: CountryCode; className?: string }) {
  return (
    <svg aria-hidden viewBox={`0 0 ${W} ${H}`} width={W} height={H} className={`shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10 ${className}`}>
      <Shape c={code} />
    </svg>
  );
}
