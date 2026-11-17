import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, addMonths, addWeeks, format, parseISO } from "date-fns";
import { it } from "date-fns/locale/it";
import type { Evento, Lead } from "./types";
import { caricaCalendario, scaricaPdf } from "./data";
import { categoriaSalvata, leadSalvato, salvaCategoria, salvaLead } from "./lead";
import { Onboarding } from "./components/Onboarding";
import { Sidebar } from "./components/Sidebar";
import { Vista, type Modo } from "./components/Vista";
import { EventModal } from "./components/EventModal";
import { LeadWall } from "./components/LeadWall";
import { Destra, Menu, Sinistra } from "./components/Icone";

// Data di partenza: oggi se siamo nell'anno del calendario, altrimenti il primo o l'ultimo giorno.
function dataIniziale(anno: number): Date {
  const oggi = new Date();
  if (oggi.getFullYear() === anno) return oggi;
  return oggi.getFullYear() < anno ? new Date(anno, 0, 1) : new Date(anno, 11, 31);
}

export default function App() {
  const [dati, setDati] = useState<Awaited<ReturnType<typeof caricaCalendario>> | null>(null);
  const [errore, setErrore] = useState("");
  const [categoria, setCategoria] = useState<string>("");
  const [onboarding, setOnboarding] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [modo, setModo] = useState<Modo>("mese");
  const [corrente, setCorrente] = useState<Date>(new Date());
  const [selezionato, setSelezionato] = useState<Date>(new Date());
  const [aperto, setAperto] = useState<Evento | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [wall, setWall] = useState(false);
  const [perPdf, setPerPdf] = useState(false);
  const [toast, setToast] = useState("");
  const clicLogo = useRef<number[]>([]);

  useEffect(() => {
    caricaCalendario()
      .then((d) => {
        setDati(d);
        const p = new URLSearchParams(window.location.search);
        const salvato = leadSalvato();
        // sblocco senza form: ?email= (link magico) e ?partner= (per i clienti)
        if (salvato) setLead(salvato);
        else if (p.get("email") || p.get("partner")) {
          const l: Lead = { nome: "", cognome: "", email: p.get("email") || "", nome_attivita: p.get("partner") || "", tipo_attivita: "", categoria_id: "" };
          // si ricorda, come nel 2026: chi entra una volta col link non rivede il form
          salvaLead(l);
          setLead(l);
        }
        const sbloccatoGia = !!salvato || !!p.get("email") || !!p.get("partner");
        // ?pdf: chi arriva dal bottone "Scarica il PDF" del sito passa dal form e poi scarica
        const vuolePdf = p.has("pdf");
        if (vuolePdf && sbloccatoGia) {
          scaricaPdf();
          setToast("Il PDF si sta scaricando");
        } else if (vuolePdf) {
          setPerPdf(true);
          setWall(true);
        }
        const cat = p.get("categoria") || salvato?.categoria_id || categoriaSalvata();
        const valida = cat && d.edizione.categorie.some((c) => c.id === cat);
        if (valida) setCategoria(cat as string);
        else if (!(vuolePdf && !sbloccatoGia)) setOnboarding(true);
        if (!valida) setCategoria(d.edizione.categorie[0].id);
        const vista = p.get("vista");
        if (vista === "settimana" || vista === "giorno") setModo(vista);
        const inizio = dataIniziale(d.edizione.anno);
        setCorrente(inizio);
        setSelezionato(inizio);
        // link diretto a un evento: ?evento=2027-02-14-san-valentino
        const idEv = p.get("evento");
        if (idEv) {
          const e = d.eventi.find((x) => x.id === idEv);
          if (e) {
            const g = parseISO(e.date);
            setCorrente(g);
            setSelezionato(g);
            setAperto(e);
            if (!salvato && !p.get("email") && !p.get("partner")) setWall(true);
          }
        }
      })
      .catch((e: Error) => setErrore(e.message));
  }, []);

  useEffect(() => {
    document.body.classList.toggle("bloccato", onboarding || wall || !!aperto);
  }, [onboarding, wall, aperto]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const sbloccato = !!lead;
  const etichetta = useMemo(() => {
    if (modo === "mese") return format(corrente, "MMMM yyyy", { locale: it });
    if (modo === "settimana") return `${format(corrente, "d MMM yyyy", { locale: it })} · settimana`;
    return format(corrente, "d MMMM yyyy", { locale: it });
  }, [modo, corrente]);

  function sposta(dir: 1 | -1) {
    const n = modo === "mese" ? addMonths(corrente, dir) : modo === "settimana" ? addWeeks(corrente, dir) : addDays(corrente, dir);
    setCorrente(n);
    setSelezionato(n);
  }

  function scegliCategoria(id: string) {
    setCategoria(id);
    salvaCategoria(id);
    setOnboarding(false);
  }

  function apri(e: Evento) {
    setAperto(e);
    if (!sbloccato) setWall(true);
  }

  // Il trucco del 2026: cinque clic sul logo in tre secondi sbloccano tutto, senza form e senza lead.
  function cliccaLogo() {
    const ora = Date.now();
    clicLogo.current = [...clicLogo.current.filter((t) => ora - t < 3000), ora];
    if (clicLogo.current.length < 5 || lead) return;
    clicLogo.current = [];
    const l: Lead = { nome: "", cognome: "", email: "", nome_attivita: "sblocco-logo", tipo_attivita: "", categoria_id: "" };
    salvaLead(l);
    setLead(l);
    setWall(false);
    if (perPdf) {
      setPerPdf(false);
      scaricaPdf();
    }
    setToast("Calendario sbloccato");
  }

  function sbloccato_(l: Lead) {
    salvaLead(l);
    setLead(l);
    setWall(false);
    if (l.categoria_id) scegliCategoria(l.categoria_id);
    if (perPdf) {
      setPerPdf(false);
      scaricaPdf();
      setToast("Il PDF si sta scaricando");
    }
  }

  if (errore) return <div className="vuoto" style={{ margin: 40 }}>Il calendario non si carica: {errore}. Riprova tra poco.</div>;
  if (!dati) return <div className="vuoto" style={{ margin: 40, border: 0 }}>Un attimo…</div>;

  const { anni, edizione } = dati;
  const annoInVista = anni.find(({ anno }) => anno === corrente.getFullYear());
  const temaDelMese = annoInVista?.temi_mese[String(corrente.getMonth() + 1)];

  function vaiAOggi() {
    const oggi = new Date();
    const giorno = anni.some(({ anno }) => anno === oggi.getFullYear()) ? oggi : dataIniziale(edizione.anno);
    setCorrente(giorno);
    setSelezionato(giorno);
  }

  return (
    <div className="app">
      <header className="header">
        <button className="icon-btn hamburger" onClick={() => setSidebar(true)} aria-label="Scegli la categoria" style={{ marginLeft: -8 }}><Menu /></button>
        <button type="button" className="logo" onClick={cliccaLogo} aria-label="Unipiazza"><img src="/brand/logo-blu-mid.svg" alt="Unipiazza" /></button>
        <div className="nav">
          <button className="icon-btn" onClick={() => sposta(-1)} aria-label="Indietro"><Sinistra /></button>
          <span className="periodo">{etichetta}</span>
          <button className="icon-btn" onClick={() => sposta(1)} aria-label="Avanti"><Destra /></button>
        </div>
      </header>

      <div className="main">
        <Sidebar dati={edizione} attiva={categoria} aperta={sidebar} onScegli={scegliCategoria} onChiudi={() => setSidebar(false)} />
        <main className="vista">
          <div className="barra-vista">
            <div className="segmenti" role="tablist">
              {(["mese", "settimana", "giorno"] as Modo[]).map((m) => (
                <button key={m} role="tab" aria-selected={modo === m} className={modo === m ? "attivo" : ""} onClick={() => setModo(m)}>{m[0].toUpperCase() + m.slice(1)}</button>
              ))}
            </div>
            {annoInVista && <span className="chip">{annoInVista.eventi.length} occasioni nel {annoInVista.anno}</span>}
          </div>
          {modo === "mese" && temaDelMese && (
            <div className="tema"><div><b>Il tema del mese</b><p>{temaDelMese}</p></div></div>
          )}
          <Vista eventi={dati.eventi} modo={modo} corrente={corrente} selezionato={selezionato} onSeleziona={(d) => { setSelezionato(d); if (modo !== "mese") setCorrente(d); }} onApri={apri} />
        </main>
      </div>

      <div className="barra-oggi">
        <button className="btn ghost" onClick={vaiAOggi}>Oggi</button>
        <button className="btn primario" onClick={() => setSidebar(true)}>{edizione.categorie.find((c) => c.id === categoria)?.label || "Categoria"}</button>
      </div>

      {onboarding && <Onboarding dati={edizione} onScegli={scegliCategoria} />}
      {wall && (aperto || perPdf) && (
        <LeadWall dati={edizione} categoriaIniziale={categoria} perPdf={perPdf} onSbloccato={sbloccato_} onChiudi={() => { setWall(false); setAperto(null); setPerPdf(false); }} />
      )}
      {aperto && sbloccato && !wall && (
        <EventModal dati={edizione} evento={aperto} categoria={categoria} onCategoria={scegliCategoria} onChiudi={() => setAperto(null)} onToast={setToast} />
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
