import { useState } from "react";
import type { Calendario } from "../types";
import { emojiDi, nomeDi } from "../data";

export function Onboarding({ dati, onScegli }: { dati: Calendario; onScegli: (id: string) => void }) {
  const [sel, setSel] = useState(dati.categorie[0].id);
  return (
    <div className="velo" role="dialog" aria-modal="true" aria-labelledby="onb-titolo">
      <div className="modale onb">
        <p className="chip" style={{ display: "inline-block", marginBottom: 10 }}>Calendario Marketing {dati.anno}</p>
        <h2 id="onb-titolo">{dati.eventi.length} occasioni per farti sentire. <span className="warm">Scegli la tua attività.</span></h2>
        <p className="sotto">Per ogni data trovi due idee pronte per la tua categoria. Puoi cambiarla quando vuoi.</p>
        <div className="scelte">
          {dati.categorie.map((c) => (
            <button key={c.id} className={"scelta" + (sel === c.id ? " attiva" : "")} onClick={() => setSel(c.id)} aria-pressed={sel === c.id}>
              <span>{emojiDi(c)}</span>
              <span>{nomeDi(c)}</span>
            </button>
          ))}
        </div>
        <button className="btn primario pieno" onClick={() => onScegli(sel)}>Apri il calendario</button>
      </div>
    </div>
  );
}
