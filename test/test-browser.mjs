import puppeteer from "puppeteer-core";
const base = Deno.args[0] || "http://localhost:4812";
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const errori = [];
globalThis.addEventListener("unhandledrejection", (e) => { console.log("CRASH:", e.reason?.message); console.log(errori.join("\n")); Deno.exit(1); });
async function pagina(w, h) {
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w < 500, hasTouch: w < 500 });
  p.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errori.push(`[${w}] console ${m.type()}: ${m.text()}`); });
  p.on("pageerror", (e) => errori.push(`[${w}] pageerror: ${e.message}`));
  p.on("requestfailed", (r) => errori.push(`[${w}] request failed: ${r.url()}`));
  await p.setRequestInterception(true);
  p.on("request", (r) => {
    if (r.url() === new URL("/api/lead", base).href && r.method() === "POST") {
      errori.push(`[${w}] FORM intercettato: ${JSON.parse(r.postData() || "{}").submission_type}`);
      return r.respond({ status: 200, body: "Accepted" });
    }
    else r.continue();
  });
  return p;
}
async function overflow(p, tag) {
  const o = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  if (o.sw > o.cw) errori.push(`${tag}: scorrimento orizzontale ${o.sw} > ${o.cw}`);
}
for (const [w, h] of [[375, 812], [1280, 900]]) {
  const p = await pagina(w, h);
  const tag = `[${w}]`;
  await p.goto(base + "/", { waitUntil: "domcontentloaded" });
  await p.evaluate(() => localStorage.clear());
  await p.goto(base + "/", { waitUntil: "networkidle0" });
  await p.waitForSelector(".onb", { timeout: 5000 }).catch(() => errori.push(`${tag} onboarding non appare`));
  await overflow(p, tag + " onboarding");
  await p.screenshot({ path: `s-${w}-1-onb.png` });
  await p.click(".onb .scelta:nth-child(3)"); // bar
  await p.click(".onb .btn.primario");
  await p.waitForFunction(() => !document.querySelector(".onb"));
  await overflow(p, tag + " mese");
  await p.screenshot({ path: `s-${w}-2-mese.png` });
  // menu
  if (w < 900) { await p.click(".header .hamburger"); await new Promise((r) => setTimeout(r, 300)); }
  else { const hb = await p.evaluate(() => getComputedStyle(document.querySelector(".header .hamburger")).display); if (hb !== "none") errori.push(`${tag} hamburger visibile su desktop`); }
  await p.screenshot({ path: `s-${w}-3-menu.png` });
  const menuVisibile = await p.evaluate(() => { const s = document.querySelector(".sidebar"); const r = s.getBoundingClientRect(); return getComputedStyle(s).display !== "none" && r.width > 0; });
  if (!menuVisibile) errori.push(`${tag} il menu non si vede dopo il clic`);
  // scegli pasticceria dal menu
  await p.evaluate(() => { [...document.querySelectorAll(".cat")].find((b) => b.textContent.includes("Pasticceria")).click(); });
  await new Promise((r) => setTimeout(r, 300));
  const catAttiva = await p.evaluate(() => document.querySelector(".cat.attiva")?.textContent);
  if (!catAttiva?.includes("Pasticceria")) errori.push(`${tag} categoria non cambiata: ${catAttiva}`);
  const menuChiuso = await p.evaluate(() => !document.querySelector(".sidebar.open"));
  if (w < 500 && !menuChiuso) errori.push(`${tag} il menu non si chiude dopo la scelta`);
  await p.screenshot({ path: `s-${w}-4-dopo-menu.png` });
  // vai a febbraio e apri San Valentino
  await p.evaluate(() => [...document.querySelectorAll(".header .icon-btn")].at(-1).click());
  await new Promise((r) => setTimeout(r, 300));
  const mese = await p.evaluate(() => document.querySelector(".header .periodo").textContent);
  if (!/febbraio/i.test(mese)) errori.push(`${tag} avanti non va a febbraio: ${mese}`);
  // clic sul giorno 14 (cella) poi sulla card
  await p.evaluate(() => { [...document.querySelectorAll(".cella")].find((c) => c.getAttribute("aria-label")?.startsWith("14 febbraio")).click(); });
  await new Promise((r) => setTimeout(r, 300));
  await p.evaluate(() => document.querySelector(".lista .card-ev").click());
  await new Promise((r) => setTimeout(r, 300));
  if (await p.evaluate(() => getComputedStyle(document.body).overflow) !== "hidden") errori.push(`${tag} la pagina dietro la scheda non è bloccata`);
  await p.waitForSelector(".form", { timeout: 4000 }).catch(() => errori.push(`${tag} il form non appare al primo clic`));
  await overflow(p, tag + " form");
  await p.screenshot({ path: `s-${w}-5-form.png` });
  // form: errore se vuoto
  await p.click(".form .btn.primario");
  await new Promise((r) => setTimeout(r, 200));
  if (!(await p.$(".form .errore"))) errori.push(`${tag} nessun errore con il form vuoto`);
  await p.type("#nome", "Prova"); await p.type("#cognome", "Test"); await p.type("#email", "calendar-test@example.com"); await p.type("#attivita", "Pasticceria Prova");
  await p.type("#telefono", "+390000000000");
  await p.click(".form .btn.primario");
  await p.waitForSelector("#ev-titolo", { timeout: 5000 }).catch(() => errori.push(`${tag} dopo il form non si apre l'evento`));
  const titolo = await p.evaluate(() => document.querySelector("#ev-titolo")?.textContent);
  if (!titolo?.includes("San Valentino")) errori.push(`${tag} evento sbagliato: ${titolo}`);
  const idee = await p.evaluate(() => document.querySelectorAll(".idea").length);
  if (idee !== 2) errori.push(`${tag} idee mostrate: ${idee}`);
  const catModale = await p.evaluate(() => document.querySelector("#cat-modale").value);
  if (catModale !== "pasticceria") errori.push(`${tag} categoria nella scheda: ${catModale}`);
  await overflow(p, tag + " evento");
  await p.screenshot({ path: `s-${w}-6-evento.png` });
  const hrefs = await p.evaluate(() => [...document.querySelectorAll(".modale a")].map((a) => a.getAttribute("href")));
  if (!hrefs.some((x) => x?.startsWith("webcal://"))) errori.push(`${tag} manca il link webcal`);
  if (!hrefs.some((x) => x?.endsWith(".pdf"))) errori.push(`${tag} manca il PDF`);
  // cambia categoria dal menu a tendina
  await p.select("#cat-modale", "gelateria");
  await new Promise((r) => setTimeout(r, 200));
  const ideaGel = await p.evaluate(() => document.querySelector(".idea p")?.textContent);
  if (!ideaGel) errori.push(`${tag} idea gelateria vuota`);
  // chiudi, rientro: ricarica, deve restare sbloccato e con la categoria
  await p.goto(base + "/?evento=2027-10-02-festa-dei-nonni", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 400));
  const t2 = await p.evaluate(() => document.querySelector("#ev-titolo")?.textContent);
  if (!t2?.includes("Nonni")) errori.push(`${tag} link diretto dopo lo sblocco non apre l'evento: ${t2} | ls=${await p.evaluate(() => Object.keys(localStorage).join(","))} | wall=${await p.evaluate(() => !!document.querySelector(".form"))}`);
  await p.screenshot({ path: `s-${w}-7-link.png` });
  // viste settimana e giorno
  await p.evaluate(() => document.querySelector(".modale .chiudi")?.click());
  await p.evaluate(() => [...document.querySelectorAll(".segmenti button")][1].click());
  await new Promise((r) => setTimeout(r, 200));
  await overflow(p, tag + " settimana");
  await p.screenshot({ path: `s-${w}-8-settimana.png` });
  await p.evaluate(() => [...document.querySelectorAll(".segmenti button")][2].click());
  await new Promise((r) => setTimeout(r, 200));
  await overflow(p, tag + " giorno");
  await p.screenshot({ path: `s-${w}-9-giorno.png` });
  // login con sola email in una pagina nuova (localStorage pulito)
  const p2 = await pagina(w, h);
  await p2.goto(base + "/", { waitUntil: "domcontentloaded" });
  await p2.evaluate(() => localStorage.clear());
  await p2.goto(base + "/?categoria=bar&evento=2027-02-14-san-valentino", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 400));
  await p2.waitForSelector(".form", { timeout: 4000 }).catch(() => errori.push(`${tag} form non appare su link diretto senza sblocco`));
  await p2.evaluate(() => [...document.querySelectorAll(".link-btn")].find((b) => b.textContent.includes("Entra"))?.click());
  await p2.type("#email", "calendar-test@example.com");
  await p2.click(".form .btn.primario");
  await p2.waitForSelector("#ev-titolo", { timeout: 5000 }).catch(() => errori.push(`${tag} login con email non sblocca`));
  await p2.screenshot({ path: `s-${w}-10-login.png` });
  await p.close(); await p2.close();
}
const archivio = await pagina(1280, 900);
const urlEvento = (id) => base + "/?partner=prova&categoria=abbigliamento&evento=" + id;
await archivio.goto(urlEvento("2027-01-01-capodanno"), { waitUntil: "networkidle0" });
await archivio.waitForSelector("#ev-titolo");
await archivio.click(".modale .chiudi");
await archivio.click('[aria-label="Indietro"]');
await archivio.waitForFunction(() => document.querySelector(".periodo")?.textContent === "dicembre 2026");
const storico = await archivio.evaluate(() => ({
  count: document.querySelector(".barra-vista .chip")?.textContent,
  tema: !!document.querySelector(".tema"),
  eventi: document.querySelectorAll(".griglia button.ev-btn").length,
}));
if (storico.count !== "93 occasioni nel 2026" || storico.tema || !storico.eventi) {
  errori.push("[Archivio] dicembre 2026 mostra dati dell'anno sbagliato");
}

await archivio.goto(urlEvento("jan-1"), { waitUntil: "networkidle0" });
await archivio.waitForSelector("#ev-titolo");
const eventoStorico = await archivio.evaluate(() => ({
  data: document.querySelector(".modale .sotto")?.textContent,
  idea: document.querySelector(".modale .idea p")?.textContent,
  nota: document.querySelector(".modale .nota")?.textContent,
  pdf: document.querySelector('.modale a[href$=".pdf"]')?.textContent,
}));
if (!eventoStorico.data?.includes("2026") || !eventoStorico.idea || !eventoStorico.nota?.includes("negozi al dettaglio")) {
  errori.push("[Archivio] link storico o idea per negozi al dettaglio mancante");
}
if (!eventoStorico.pdf?.includes("2027")) errori.push("[Archivio] edizione del PDF ambigua");

await archivio.goto(urlEvento("2027-12-08-immacolata-concezione"), { waitUntil: "networkidle0" });
await archivio.waitForSelector("#ev-titolo");
await archivio.click(".modale .chiudi");
await archivio.click('.segmenti button:nth-child(2)');
for (let i = 0; i < 4; i++) await archivio.click('[aria-label="Avanti"]');
const periodoAttivo = await archivio.evaluate(() => {
  const giorni = Array.from(document.querySelectorAll(".giorno-col"));
  const contieneImmacolata = (giorno) =>
    !!giorno?.querySelector(".card-ev") && giorno.textContent.includes("Immacolata");
  return contieneImmacolata(giorni[3]) && !contieneImmacolata(giorni[4]);
});
if (!periodoAttivo) errori.push("[Archivio] il periodo deve risultare attivo il 6 gennaio 2028 e terminato il 7");
await archivio.close();
await browser.close();
console.log(errori.length ? errori.join("\n") : "NESSUN PROBLEMA");
