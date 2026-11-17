#!/opt/homebrew/bin/python3
"""Un file .ics per categoria, da calendario-2027.json, in public/ics/. Si lancia prima del build.

    python3 scripts/genera-ics.py

L'app li offre come webcal://<host>/ics/<categoria>.ics: Google Calendar e Apple Calendar li
trattano come abbonamento e li rileggono da soli, così l'anno dopo basta rigenerarli. Ogni evento
porta nella descrizione le due idee della categoria e il link alla data nell'app.
"""
import json, datetime as dt
from pathlib import Path

QUI = Path(__file__).parent.parent
DATI = QUI / "data/calendario-2027.json"
OUT = QUI / "public/ics"
APP = "https://calendario.unipiazza.it/"


def piega(riga):
    # RFC 5545: righe di al massimo 75 byte, le continuazioni iniziano con uno spazio
    b = riga.encode("utf-8"); out = []
    while len(b) > 73:
        taglio = 73
        while taglio > 0 and (b[taglio] & 0xC0) == 0x80:
            taglio -= 1
        out.append(b[:taglio].decode("utf-8")); b = b" " + b[taglio:]
    out.append(b.decode("utf-8"))
    return "\r\n".join(out)


def esc(s):
    return s.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")


def main():
    d = json.loads(DATI.read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    for c in d["categorie"]:
        righe = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Unipiazza//Calendario Marketing//IT", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
                 f"X-WR-CALNAME:Calendario Marketing {d['anno']} · {c['label']}", "X-WR-TIMEZONE:Europe/Rome", "REFRESH-INTERVAL;VALUE=DURATION:P1W"]
        for e in d["eventi"]:
            idea = e["suggestions"].get(c["id"])
            if not idea:
                continue
            inizio = e["date"].replace("-", "")
            fine_d = dt.date.fromisoformat(e["end_date"] or e["date"]) + dt.timedelta(days=1)
            fine = fine_d.strftime("%Y%m%d")
            stella = "★ " if e["level"] == "imperdibile" else ""
            desc = f"{e['description']}\n\nPer parlare ai clienti. {idea['relazionale']}\n\nPer fare una promozione. {idea['promo']}\n\n{APP}?evento={e['id']}&categoria={c['id']}"
            righe += ["BEGIN:VEVENT", f"UID:{e['id']}-{c['id']}@calendario.unipiazza.it", f"DTSTAMP:{stamp}",
                      f"DTSTART;VALUE=DATE:{inizio}", f"DTEND;VALUE=DATE:{fine}", f"SUMMARY:{esc(stella + e['name'])}",
                      f"DESCRIPTION:{esc(desc)}", f"URL:{APP}?evento={e['id']}", f"CATEGORIES:{esc(c['label'])}"]
            if e["anticipo_giorni"]:
                righe += ["BEGIN:VALARM", "ACTION:DISPLAY", f"DESCRIPTION:{esc('Tra ' + str(e['anticipo_giorni']) + ' giorni: ' + e['name'])}",
                          f"TRIGGER:-P{e['anticipo_giorni']}D", "END:VALARM"]
            righe.append("END:VEVENT")
        righe.append("END:VCALENDAR")
        (OUT / f"{c['id']}.ics").write_bytes(("\r\n".join(piega(r) for r in righe) + "\r\n").encode("utf-8"))
    print(f"{len(d['categorie'])} file .ics in {OUT.relative_to(QUI)}/")


if __name__ == "__main__":
    main()
