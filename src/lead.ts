import type { Lead } from "./types";

const CHIAVE = "unipiazza_lead_info";
const CHIAVE_CAT = "unipiazza_categoria";

export function leadSalvato(): Lead | null {
  try {
    const s = localStorage.getItem(CHIAVE);
    return s ? (JSON.parse(s) as Lead) : null;
  } catch {
    return null;
  }
}

export function salvaLead(l: Lead) {
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(l));
  } catch {
    /* in navigazione privata non si salva: l'app resta usabile nella sessione */
  }
}

export function categoriaSalvata(): string | null {
  try {
    return localStorage.getItem(CHIAVE_CAT);
  } catch {
    return null;
  }
}

export function salvaCategoria(id: string) {
  try {
    localStorage.setItem(CHIAVE_CAT, id);
  } catch {
    /* vedi sopra */
  }
}

export function parametriAds(): Record<string, string | null> {
  const p = new URLSearchParams(window.location.search);
  return {
    from_ads: p.get("from_ads"),
    utm_source: p.get("source") || p.get("utm_source"),
    utm_campaign: p.get("campaign_name") || p.get("utm_campaign"),
    utm_adset: p.get("adset_name"),
    utm_ad: p.get("ad_name"),
    fbclid: p.get("fbclid"),
  };
}

// Numero italiano o con prefisso internazionale: da 6 a 15 cifre, spazi, punti e trattini ammessi.
export function telefonoValido(t: string): boolean {
  const n = t.replace(/[\s./-]/g, "");
  return /^\+?\d{6,15}$/.test(n);
}

export function emailValida(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

export async function inviaLead(lead: Lead, tipo: "register" | "login", trappola: string): Promise<boolean> {
  // il campo trappola è nascosto: se è pieno lo ha compilato un bot, e si finge il successo
  if (trappola) return true;
  const now = new Date();
  const payload = {
    ...lead,
    submission_type: tipo,
    timestamp: now.toISOString(),
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
    ...parametriAds(),
    user_agent: navigator.userAgent,
    page: window.location.href,
    anno: 2027,
  };
  try {
    const r = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return r.status === 200;
  } catch {
    return false;
  }
}
