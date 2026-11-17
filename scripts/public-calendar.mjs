export function publicCalendar({ anno, aggiornato, categorie, temi_mese, eventi }) {
  return {
    anno,
    aggiornato,
    categorie,
    temi_mese,
    eventi: eventi.map(({ id_2026, ...evento }) => evento),
  };
}

export function publicCalendarYears({ versione, anno_edizione, anni }) {
  return { versione, anno_edizione, anni: anni.map(publicCalendar) };
}
