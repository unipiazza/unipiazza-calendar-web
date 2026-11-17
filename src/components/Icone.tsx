// Poche icone inline, così non serve una libreria.
const base = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const Menu = () => (<svg {...base}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const X = () => (<svg {...base}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const Sinistra = () => (<svg {...base}><path d="M15 6l-6 6 6 6" /></svg>);
export const Destra = () => (<svg {...base}><path d="M9 6l6 6-6 6" /></svg>);
export const Calendario = () => (<svg {...base}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>);
export const Lucchetto = () => (<svg {...base}><rect x="4" y="11" width="16" height="10" rx="3" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>);
export const Link = () => (<svg {...base}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>);
export const Stella = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-label="imperdibile"><path fill="currentColor" d="M12 2.5l2.9 6.1 6.7.8-4.9 4.6 1.3 6.6L12 17.3l-6 3.3 1.3-6.6L2.4 9.4l6.7-.8z" /></svg>
);
export const Scarica = () => (<svg {...base}><path d="M12 4v11M7 10l5 5 5-5M4 20h16" /></svg>);
