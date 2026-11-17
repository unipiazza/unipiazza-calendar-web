import { readFile } from "node:fs/promises";
import { defineConfig } from "vite";
import type { Connect } from "vite";
import react from "@vitejs/plugin-react";

const localCalendar = new URL("./data/calendario-2027.json", import.meta.url);

function serveLocalCalendar(middlewares: Connect.Server) {
  middlewares.use("/api/calendar", async (_request, response) => {
    try {
      const calendar = await readFile(localCalendar);
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(calendar);
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
  server: { port: 3000, host: "0.0.0.0" },
  build: { target: "es2020", sourcemap: false },
});
