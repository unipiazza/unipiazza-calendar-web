import { useState } from "react";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale/it";
import type { Calendario, Evento } from "../types";
import { linkEvento, linkFeed, nomeDi, PDF_URL } from "../data";
import { Calendario as IconaCal, Link, Scarica, Stella, X } from "./Icone";

interface Props {
  dati: Calendario;
  evento: Evento;
  categoria: string;
  onCategoria: (id: string) => void;
  onChiudi: () => void;
  onToast: (s: string) => void;
}

const TIPI: Record<string, string> = { festivita: "Festività", giornata: "Giornata", evento: "Evento", stagione: "Stagione", commerciale: "Momento commerciale" };

export function EventModal({ dati, evento, categoria, onCategoria, onChiudi, onToast }: Props) {
  const [copiato, setCopiato] = useState(false);
  const ideaSpecifica = evento.suggestions[categoria];
  const idea = ideaSpecifica ?? evento.suggestions["negozio-al-dettaglio"];
  const cat = dati.categorie.find((c) => c.id === categoria);
  const data = parseISO(evento.date);
  const feed = linkFeed(categoria);
  const badge = [
    evento.type && TIPI[evento.type],
    evento.level === "imperdibile" && "imperdibile",
    evento.level === "curiosita" && "curiosità",
  ].filter(Boolean).join(" · ");
  const quando = evento.end_date
    ? `dal ${format(data, "d MMMM", { locale: it })} al ${format(parseISO(evento.end_date), "d MMMM yyyy", { locale: it })}`
    : format(data, "EEEE d MMMM yyyy", { locale: it });

  async function copia() {
    try {
      await navigator.clipboard.writeText(linkEvento(evento));
      setCopiato(true);
      onToast("Link copiato");
      setTimeout(() => setCopiato(false), 2000);
    } catch {
      onToast(linkEvento(evento));
    }
  }

  return (
    <div className="velo" role="dialog" aria-modal="true" aria-labelledby="ev-titolo" onClick={(e) => { if (e.target === e.currentTarget) onChiudi(); }}>
      <div className="modale">
        <button className="icon-btn chiudi" onClick={onChiudi} aria-label="Chiudi"><X /></button>
        {badge && <span className="chip">{badge}</span>}
        <h2 id="ev-titolo">{evento.level === "imperdibile" && <span style={{ color: "var(--q-blue)", marginRight: 6 }}><Stella size={18} /></span>}{evento.name}</h2>
        <p className="sotto">{quando.charAt(0).toUpperCase() + quando.slice(1)}</p>
        {evento.description && <p className="desc">{evento.description}</p>}
        {evento.anticipo_giorni !== null && evento.anticipo_giorni > 0 && <p className="anticipo">Ti consigliamo di inviare la promozione {evento.anticipo_giorni === 1 ? "il giorno prima" : `${evento.anticipo_giorni} giorni prima`}</p>}

        <label className="sr-only" htmlFor="cat-modale">Categoria</label>
        <select id="cat-modale" value={categoria} onChange={(e) => onCategoria(e.target.value)}>
          {dati.categorie.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>

        {idea ? (
          <>
            {!ideaSpecifica && <p className="nota muted">Idea del 2026 per negozi al dettaglio.</p>}
            <div className="idea"><b>Per parlare ai clienti</b><p>{idea.relazionale}</p></div>
            <div className="idea promo"><b>Per fare una promozione</b><p>{idea.promo}</p></div>
          </>
        ) : (
          <div className="vuoto">Per {cat ? nomeDi(cat) : "questa categoria"} non c'è ancora un'idea su questa data.</div>
        )}

        <div className="azioni">
          <a className="btn scuro" href={feed.webcal} title="Si apre nel calendario del telefono o del computer e si aggiorna da solo"><IconaCal /> Aggiungi le date {dati.anno} al mio calendario</a>
          <button className="btn ghost" onClick={copia}><Link /> {copiato ? "Copiato" : "Copia il link di questa data"}</button>
          <a className="btn ghost" href={PDF_URL} download><Scarica /> Scarica il PDF {dati.anno}</a>
        </div>
        <p className="nota muted" style={{ fontSize: 12, marginTop: 10 }}>
          "Aggiungi" iscrive il tuo calendario alle date {dati.anno} per {cat ? nomeDi(cat) : "la tua categoria"}. Se non si apre, <a href={feed.https} download>scarica il file</a> e importalo.
        </p>
      </div>
    </div>
  );
}
