import type { Calendario, CalendarioMultianno, Categoria, Evento, Livello } from "./types";

export const PDF_URL: string = (import.meta.env.VITE_PDF_URL as string | undefined) || "/Unipiazza-Calendario-Marketing-2027.pdf";

interface DatiCalendario {
  edizione: Calendario;
  anni: Calendario[];
  eventi: Evento[];
}

export async function caricaCalendario(): Promise<DatiCalendario> {
  const r = await fetch("/api/calendar/v2", { cache: "no-cache" });
  if (!r.ok) throw new Error(`Dati non raggiungibili (${r.status})`);
  const dati = (await r.json()) as CalendarioMultianno;
  const edizione = dati.anni?.find(({ anno }) => anno === dati.anno_edizione);
  if (dati.versione !== 1 || !edizione) throw new Error("Formato del calendario non valido");
  const eventi = dati.anni.flatMap((anno) => anno.eventi);
  eventi.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
  return { edizione, anni: dati.anni, eventi };
}

export function emojiDi(c: Categoria): string {
  return c.label.split(" ")[0];
}

export function nomeDi(c: Categoria): string {
  return c.label.split(" ").slice(1).join(" ");
}

export function eventiDelGiorno(eventi: Evento[], iso: string): Evento[] {
  return eventi.filter((e) => e.date === iso);
}

export function periodiAttivi(eventi: Evento[], iso: string): Evento[] {
  return eventi.filter((e) => e.end_date && e.date <= iso && iso <= e.end_date);
}

export function occasioniDelGiorno(eventi: Evento[], iso: string): Evento[] {
  return [
    ...ordinaPerLivello(eventiDelGiorno(eventi, iso)),
    ...periodiAttivi(eventi, iso).filter((e) => e.date !== iso),
  ];
}

const ORDINE_LIVELLO: Record<Livello, number> = { imperdibile: 0, occasione: 1, curiosita: 2 };

export function ordinaPerLivello(ev: Evento[]): Evento[] {
  return [...ev].sort((a, b) => ORDINE_LIVELLO[a.level ?? "occasione"] - ORDINE_LIVELLO[b.level ?? "occasione"]);
}

// Il link di un evento, da usare nelle ads, su WhatsApp, nelle email: ?evento=<id>
export function linkEvento(e: Evento): string {
  const u = new URL(window.location.href);
  u.search = "";
  u.searchParams.set("evento", e.id);
  return u.toString();
}

// Feed calendario per categoria: un .ics statico in public/ics/, generato da scripts/genera-ics.py.
// Con webcal:// Google e Apple lo trattano come abbonamento e lo rileggono da soli.
export function linkFeed(categoriaId: string): { webcal: string; https: string } {
  const base = `${window.location.host}/ics/${categoriaId}.ics`;
  return { webcal: `webcal://${base}`, https: `${window.location.protocol}//${base}` };
}

// Scarica il PDF senza cambiare pagina. Si usa con ?pdf, il link del bottone "Scarica il PDF" del sito:
// chi non ha ancora sbloccato passa prima dal form.
export function scaricaPdf() {
  const a = document.createElement("a");
  a.href = PDF_URL;
  a.download = "Unipiazza - Calendario Marketing 2027.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
