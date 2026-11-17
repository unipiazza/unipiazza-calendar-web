import { addDays, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { it } from "date-fns/locale/it";
import type { Calendario, Evento } from "../types";
import { eventiDelGiorno, ordinaPerLivello, periodiAttivi } from "../data";
import { Destra, Stella } from "./Icone";

export type Modo = "mese" | "settimana" | "giorno";

interface Props {
  dati: Calendario;
  modo: Modo;
  corrente: Date;
  selezionato: Date;
  onSeleziona: (d: Date) => void;
  onApri: (e: Evento) => void;
}

const GIORNI = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

function iso(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function CardEvento({ e, onApri, conData, compatta }: { e: Evento; onApri: (e: Evento) => void; conData?: boolean; compatta?: boolean }) {
  const d = parseISO(e.date);
  return (
    <button className={"card-ev" + (compatta ? " compatta" : "")} onClick={() => onApri(e)}>
      {conData && <span className="data"><b>{format(d, "d")}</b><span>{format(d, "EEE", { locale: it })}</span></span>}
      <span>
        <h4>{e.level === "imperdibile" && <span style={{ color: "var(--q-blue)", marginRight: 4 }}><Stella /></span>}{e.name}</h4>
        {!compatta && e.description && <p>{e.description.length > 110 ? e.description.slice(0, 110) + "…" : e.description}</p>}
        {e.end_date ? <span className="tag-periodo">Periodo, fino al {format(parseISO(e.end_date), "d MMMM", { locale: it })}</span> : e.level === "imperdibile" && <span className="tag">Muoviti {e.anticipo_giorni} giorni prima</span>}
      </span>
      <span className="freccia"><Destra /></span>
    </button>
  );
}

export function Vista({ dati, modo, corrente, selezionato, onSeleziona, onApri }: Props) {
  const oggi = new Date();

  if (modo === "giorno") {
    const ev = ordinaPerLivello(eventiDelGiorno(dati.eventi, iso(corrente)));
    const per = periodiAttivi(dati.eventi, iso(corrente)).filter((p) => p.date !== iso(corrente));
    return (
      <div className="lista">
        <h3>{format(corrente, "EEEE d MMMM yyyy", { locale: it })}</h3>
        {ev.map((e) => <CardEvento key={e.id} e={e} onApri={onApri} />)}
        {per.map((e) => <CardEvento key={e.id} e={e} onApri={onApri} />)}
        {ev.length + per.length === 0 && <div className="vuoto">Nessuna occasione in questo giorno. Guarda la settimana, o scegli un'altra data.</div>}
      </div>
    );
  }

  if (modo === "settimana") {
    const giorni = eachDayOfInterval({ start: startOfWeek(corrente, { weekStartsOn: 1 }), end: endOfWeek(corrente, { weekStartsOn: 1 }) });
    return (
      <div className="settimana">
        {giorni.map((g) => {
          const ev = ordinaPerLivello(eventiDelGiorno(dati.eventi, iso(g)));
          return (
            <div className="giorno-col" key={g.toISOString()}>
              <h4>{format(g, "EEE d", { locale: it })}</h4>
              {ev.map((e) => <CardEvento key={e.id} e={e} onApri={onApri} compatta />)}
              {ev.length === 0 && <p className="muted" style={{ fontSize: 13 }}>Niente</p>}
            </div>
          );
        })}
      </div>
    );
  }

  // mese
  const inizio = startOfWeek(startOfMonth(corrente), { weekStartsOn: 1 });
  const fine = endOfWeek(endOfMonth(corrente), { weekStartsOn: 1 });
  const giorni = eachDayOfInterval({ start: inizio, end: fine });
  const delGiorno = ordinaPerLivello(eventiDelGiorno(dati.eventi, iso(selezionato)));
  const periodiSel = periodiAttivi(dati.eventi, iso(selezionato)).filter((p) => p.date !== iso(selezionato));

  return (
    <>
      <div className="griglia" aria-label={format(corrente, "MMMM yyyy", { locale: it })}>
        {GIORNI.map((g) => <div className="gh" key={g}>{g}</div>)}
        {giorni.map((g) => {
          const k = iso(g);
          const ev = ordinaPerLivello(eventiDelGiorno(dati.eventi, k));
          const per = periodiAttivi(dati.eventi, k);
          const fest = ev.some((e) => e.type === "festivita" && e.color === "red");
          const cls = fest ? "fest" : ev.length ? "ric" : "";
          const primoDelPeriodo = per.find((p) => p.date === k || g.getDay() === 1 || g.getDate() === 1);
          return (
            <div
              key={k}
              role="button"
              tabIndex={0}
              className={"cella" + (isSameMonth(g, corrente) ? "" : " fuori") + (isSameDay(g, selezionato) ? " sel" : "")}
              onClick={() => onSeleziona(g)}
              onKeyDown={(x) => { if (x.key === "Enter" || x.key === " ") { x.preventDefault(); onSeleziona(g); } }}
              aria-label={`${format(g, "d MMMM", { locale: it })}, ${ev.length} occasioni`}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span className={"n " + cls + (isSameDay(g, oggi) ? " oggi" : "")}>{format(g, "d")}</span>
                {ev.some((e) => e.level === "imperdibile") && <span style={{ color: "var(--q-blue)" }}><Stella size={12} /></span>}
              </span>
              <span className="punti">
                {ev.slice(0, 4).map((e) => <span key={e.id} className={"punto " + (e.level === "imperdibile" ? "imp" : e.level === "curiosita" ? "cur" : "")} />)}
              </span>
              <span className="nomi">
                {ev.slice(0, 3).map((e) => (
                  <button key={e.id} className={"ev-btn " + (e.level === "imperdibile" ? "imp" : e.level === "curiosita" ? "cur" : "")} onClick={(x) => { x.stopPropagation(); onApri(e); }}>
                    {e.name}
                  </button>
                ))}
                {ev.length > 3 && <span className="muted" style={{ fontSize: 11 }}>+{ev.length - 3}</span>}
              </span>
              {per.length > 0 && <span className="per" title={per.map((p) => p.period_name || p.name).join(", ")}>{primoDelPeriodo ? (per[0].period_name || per[0].name) : ""}</span>}
            </div>
          );
        })}
      </div>
      <div className="lista">
        <h3>{isSameDay(selezionato, oggi) ? "Oggi, " : ""}{format(selezionato, "EEEE d MMMM", { locale: it })}</h3>
        {delGiorno.map((e) => <CardEvento key={e.id} e={e} onApri={onApri} />)}
        {periodiSel.map((e) => <CardEvento key={e.id} e={e} onApri={onApri} />)}
        {delGiorno.length + periodiSel.length === 0 && (
          <div className="vuoto">Nessuna occasione in questo giorno. Tocca un giorno con il pallino, o vai al <button className="link-btn" onClick={() => onSeleziona(addDays(selezionato, 1))}>giorno dopo</button>.</div>
        )}
      </div>
    </>
  );
}
