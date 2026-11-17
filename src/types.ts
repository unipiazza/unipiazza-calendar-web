// Lo schema del file unico (specifiche-design-2027.md, sezione 6), come lo produce genera-json.py.
export type Livello = "imperdibile" | "occasione" | "curiosita";
export type Tipo = "festivita" | "giornata" | "evento" | "stagione" | "commerciale";

export interface Categoria {
  id: string;
  label: string; // "☕ Bar o Caffetteria": l'emoji è il primo token
}

export interface Idea {
  relazionale: string;
  promo: string;
}

export interface Evento {
  id: string; // 2027-02-14-san-valentino
  date: string; // YYYY-MM-DD
  end_date: string | null;
  period_name?: string | null;
  name: string;
  type: Tipo | null;
  level: Livello | null;
  color: "red" | "blue";
  description: string;
  anticipo_giorni: number | null;
  suggestions: Partial<Record<string, Idea>>;
}

export interface Calendario {
  anno: number;
  aggiornato?: string;
  categorie: Categoria[];
  temi_mese: Record<string, string>;
  eventi: Evento[];
}

export interface MappaturaCategorie {
  mappatura: Record<string, string>;
  fallback: string;
}

export interface CalendarioMultianno {
  versione: 1;
  anno_edizione: number;
  anni: (Calendario & { mappatura_categorie?: MappaturaCategorie })[];
}

export interface Lead {
  nome: string;
  cognome: string;
  email: string;
  telefono?: string;
  nome_attivita: string;
  tipo_attivita: string; // label della categoria, con l'emoji, come nel 2026
  categoria_id: string;
}
