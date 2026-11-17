export function publicCalendar({ anno, aggiornato, categorie, temi_mese, eventi }) {
  return {
    anno,
    aggiornato,
    categorie,
    temi_mese,
    eventi: eventi.map(({ id_2026, ...evento }) => evento),
  };
}

// The multi-year response also carries the shop category mapping: unipiazza-api
// uses it to pick the ideas for a shop's database category.
export function publicCalendarYears({ versione, anno_edizione, anni }) {
  return {
    versione,
    anno_edizione,
    anni: anni.map((anno) => ({ ...publicCalendar(anno), mappatura_categorie: anno.mappatura_categorie })),
  };
}
