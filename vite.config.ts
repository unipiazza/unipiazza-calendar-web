import { readFile } from "node:fs/promises";
import { defineConfig } from "vite";
import type { Connect } from "vite";
import react from "@vitejs/plugin-react";
import { publicCalendarYears } from "./scripts/public-calendar.mjs";

const localCalendar = new URL("./data/calendario-2026-2027.json", import.meta.url);

function serveLocalCalendar(middlewares: Connect.Server) {
  middlewares.use("/api/calendar/v2", async (_request, response) => {
    try {
      const calendar = publicCalendarYears(JSON.parse(await readFile(localCalendar, "utf8")));
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify(calendar));
    } catch {
      response.statusCode = 503;
      response.end("Local calendar data is unavailable.");
    }
  });
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "local-calendar",
      configureServer: (server) => serveLocalCalendar(server.middlewares),
      configurePreviewServer: (server) => serveLocalCalendar(server.middlewares),
    },
  ],
  server: {
    port: 3000,
    host: "0.0.0.0",
    fs: { deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/data/*.json"] },
  },
  build: { target: "es2020", sourcemap: false },
});
