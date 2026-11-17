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
  type: Tipo;
  level: Livello;
  color: "red" | "blue";
  description: string;
  anticipo_giorni: number;
  suggestions: Record<string, Idea>;
}

export interface Calendario {
  anno: number;
  aggiornato: string;
  categorie: Categoria[];
  temi_mese: Record<string, string>;
  eventi: Evento[];
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
