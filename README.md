# Unipiazza Marketing Calendar

A free calendar for local businesses and shops, with events and marketing ideas
tailored to each business category. Browse by month, week or day, or subscribe
to an iCalendar feed.

## Run locally

Place a calendar JSON file matching the schema in [src/types.ts](src/types.ts)
at `data/calendario-2027.json`, then run:

```sh
npm ci
npm run dev
```

Use `python3 scripts/genera-ics.py` to generate the category feeds. The
[browser test](test/) simulates form submissions.

## Deploy

`npm run build` produces the static site in `dist/`. Serve it alongside two
same-origin routes:

- `GET /api/calendar` returns the calendar JSON.
- `POST /api/lead` accepts the form payload and returns HTTP 200 on success.

Configure the data source and form integration on the server. Keep upstream
URLs and credentials in private server configuration. Serve the optional PDF
and generated feeds as static files.

## License

The source code is licensed under the [MIT License](LICENSE). Unipiazza
trademarks, logos, editorial calendar content and the PDF are reserved. The
Nunito font is distributed under the
[SIL Open Font License 1.1](public/fonts/OFL.txt).
