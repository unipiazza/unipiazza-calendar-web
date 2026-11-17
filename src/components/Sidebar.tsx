import type { Calendario } from "../types";
import { emojiDi, nomeDi } from "../data";
import { X, Stella } from "./Icone";

interface Props {
  dati: Calendario;
  attiva: string;
  aperta: boolean;
  onScegli: (id: string) => void;
  onChiudi: () => void;
}

export function Sidebar({ dati, attiva, aperta, onScegli, onChiudi }: Props) {
  return (
    <aside className={"sidebar" + (aperta ? " open" : "")} onClick={(e) => { if (e.target === e.currentTarget) onChiudi(); }}>
      <div className="pannello">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>La tua attività</h2>
          <button className="icon-btn" onClick={onChiudi} aria-label="Chiudi" style={{ display: aperta ? "inline-flex" : "none" }}><X /></button>
        </div>
        {dati.categorie.map((c) => (
          <button key={c.id} className={"cat" + (c.id === attiva ? " attiva" : "")} onClick={() => { onScegli(c.id); onChiudi(); }} aria-pressed={c.id === attiva}>
            <span className="emoji">{emojiDi(c)}</span>
            <span>{nomeDi(c)}</span>
          </button>
        ))}
        <h2 style={{ marginTop: 18 }}>Come leggere</h2>
        <div className="legenda">
          <div><span className="cella" style={{ minHeight: 0, padding: 0, border: 0, background: "none" }}><span className="n fest">25</span></span> Festività</div>
          <div><span className="n ric" style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid var(--q-blue)", color: "var(--q-blue)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12 }}>17</span> Ricorrenza o evento</div>
          <div><span style={{ color: "var(--q-blue)", display: "inline-flex", width: 24, justifyContent: "center" }}><Stella /></span> Imperdibile</div>
          <div><span style={{ width: 24, height: 14, borderRadius: 5, border: "1px dashed var(--q-line)", display: "inline-block" }} /> Curiosità, da post o storia</div>
          <div><span style={{ width: 24, height: 6, borderRadius: 3, background: "var(--q-blue-soft)", display: "inline-block" }} /> Periodo (saldi, Sanremo, Natale)</div>
        </div>
        <div className="cta">
          <b>Sei cliente Unipiazza?</b>
          Nel Gestionale trovi queste date nella sezione Calendario Eventi, e Olivia ti prepara la campagna. <a href="https://unipiazza.it" target="_blank" rel="noopener">unipiazza.it</a>
        </div>
      </div>
    </aside>
  );
}
