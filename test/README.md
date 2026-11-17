# Test nel browser

`test-browser.mjs` pilota Chrome (Puppeteer, via Deno) sull'app in anteprima e prova il giro
intero a 375 e a 1280 px: onboarding, menu, cambio categoria, mese, evento, form vuoto e
pieno, rientro con la sola email, link diretto `?evento=`, viste settimana e giorno, feed
webcal e PDF. **La richiesta a `/api/lead` è intercettata e simulata**, nessun lead vero parte. Controlla
anche errori in console, richieste fallite e scorrimento orizzontale.

    deno run -A npm:vite preview --port 4812 --strictPort &
    cd test && printf '{"name":"t","type":"module","dependencies":{"puppeteer-core":"^24"}}' > package.json && deno install
    deno run -A test-browser.mjs http://localhost:4812

Esce "NESSUN PROBLEMA" più le quattro righe del form intercettato, oppure la lista di
quello che non va. Gli screenshot `s-*.png` restano nella cartella del test (fuori da git).
Passato per intero il 05/10/2026.
