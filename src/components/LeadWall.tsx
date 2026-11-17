import { useState } from "react";
import type { Calendario, Lead } from "../types";
import { emailValida, inviaLead, telefonoValido } from "../lead";
import { Lucchetto, X } from "./Icone";

interface Props {
  dati: Calendario;
  categoriaIniziale: string;
  onSbloccato: (lead: Lead) => void;
  onChiudi: () => void;
  perPdf?: boolean;
}

export function LeadWall({ dati, categoriaIniziale, onSbloccato, onChiudi, perPdf = false }: Props) {
  const [modo, setModo] = useState<"register" | "login">("register");
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [attivita, setAttivita] = useState("");
  const [cat, setCat] = useState(categoriaIniziale);
  const [trappola, setTrappola] = useState("");
  const [errore, setErrore] = useState("");
  const [invio, setInvio] = useState(false);

  const categoria = dati.categorie.find((c) => c.id === cat) || dati.categorie[0];

  async function invia(e: React.FormEvent) {
    e.preventDefault();
    setErrore("");
    const em = email.trim().toLowerCase();
    if (!emailValida(em) || em.length > 120) return setErrore("Controlla l'indirizzo email.");
    if (modo === "register") {
      if (!nome.trim() || !cognome.trim() || !attivita.trim() || !telefono.trim()) return setErrore("Compila tutti i campi.");
      if (!telefonoValido(telefono)) return setErrore("Controlla il numero di telefono.");
      if (nome.length > 60 || cognome.length > 60 || attivita.length > 100) return setErrore("Qualche campo è troppo lungo.");
    }
    const lead: Lead = {
      nome: nome.trim(),
      cognome: cognome.trim(),
      email: em,
      telefono: modo === "register" ? telefono.replace(/[\s./-]/g, "") : "",
      nome_attivita: attivita.trim(),
      tipo_attivita: categoria.label,
      categoria_id: categoria.id,
    };
    setInvio(true);
    const ok = await inviaLead(lead, modo, trappola);
    setInvio(false);
    if (ok) onSbloccato(lead);
    else setErrore("Non siamo riusciti a salvare i dati. Riprova tra qualche istante.");
  }

  return (
    <div className="velo" role="dialog" aria-modal="true" aria-labelledby="lw-titolo">
      <div className="modale">
        <button className="icon-btn chiudi" onClick={onChiudi} aria-label="Chiudi"><X /></button>
        <div style={{ color: "var(--q-blue)", marginBottom: 6 }}><Lucchetto /></div>
        <h2 id="lw-titolo">{modo === "register" ? (perPdf ? "Scarica il calendario in PDF" : "Sblocca le idee") : "Bentornato"}</h2>
        <p className="sotto">
          {modo === "register"
            ? perPdf
              ? `Lascia i tuoi dati e scarica il PDF con tutte le ${dati.eventi.length} date del ${dati.anno}. Qui trovi anche le idee pronte per la tua attività, gratis.`
              : "Lascia i tuoi dati e sblocca le idee per la tua attività, gratis."
            : "Inserisci l'email con cui hai già sbloccato il calendario."}
        </p>
        <form className="form" onSubmit={invia} noValidate>
          {modo === "register" && (
            <div className="due">
              <div><label htmlFor="nome">Nome</label><input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="given-name" required /></div>
              <div><label htmlFor="cognome">Cognome</label><input id="cognome" value={cognome} onChange={(e) => setCognome(e.target.value)} autoComplete="family-name" required /></div>
            </div>
          )}
          <div><label htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" required /></div>
          {modo === "register" && (
            <div><label htmlFor="telefono">Telefono</label><input id="telefono" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} autoComplete="tel" inputMode="tel" placeholder="Es. 333 123 4567" required /></div>
          )}
          {modo === "register" && (
            <>
              <div><label htmlFor="attivita">Nome attività</label><input id="attivita" value={attivita} onChange={(e) => setAttivita(e.target.value)} placeholder="Es. Caffè Centrale" required /></div>
              <div>
                <label htmlFor="cat">Tipo attività</label>
                <select id="cat" value={cat} onChange={(e) => setCat(e.target.value)}>
                  {dati.categorie.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="trappola" aria-hidden="true">
            <label htmlFor="sito">Sito web</label>
            <input id="sito" tabIndex={-1} autoComplete="off" value={trappola} onChange={(e) => setTrappola(e.target.value)} />
          </div>
          {errore && <div className="errore" role="alert">{errore}</div>}
          <button className="btn primario pieno" type="submit" disabled={invio}>
            {invio ? "Un attimo…" : modo === "register" ? (perPdf ? "Scarica il PDF" : "Sblocca il calendario") : perPdf ? "Entra e scarica" : "Entra"}
          </button>
          <p className="nota">
            {modo === "register"
              ? <>Hai già sbloccato il calendario? <button type="button" className="link-btn" onClick={() => setModo("login")}>Entra con la tua email</button></>
              : <>Prima volta qui? <button type="button" className="link-btn" onClick={() => setModo("register")}>Lascia i tuoi dati</button></>}
          </p>
        </form>
      </div>
    </div>
  );
}
