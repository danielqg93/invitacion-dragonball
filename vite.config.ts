import react from "@vitejs/plugin-react";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";

async function readRequestBody(request: IncomingMessage) {
   const chunks: Buffer[] = [];
   for await (const chunk of request) chunks.push(Buffer.from(chunk));
   return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function confirmationsApi(
   request: IncomingMessage,
   response: ServerResponse,
   next: () => void,
) {
   if (request.method !== "POST") {
      response.statusCode = 405;
      response.setHeader("Allow", "POST");
      response.end(JSON.stringify({ error: "Método no permitido" }));
      return;
   }

   readRequestBody(request)
      .then(async (payload) => {
         const filePath = resolve(
            process.cwd(),
            "db",
            "confirmarAsistencia.json",
         );
         const nombre = String(payload.nombre || "Invitado sin código").trim();
         const mensaje = String(payload.mensaje || "").trim();

         if (typeof payload.asistira !== "boolean") {
            response.statusCode = 400;
            response.end(
               JSON.stringify({ error: "La asistencia es obligatoria" }),
            );
            return;
         }

         let confirmaciones = [];
         try {
            confirmaciones = JSON.parse(await readFile(filePath, "utf8"));
         } catch {
            confirmaciones = [];
         }

         confirmaciones.push({
            nombre,
            asistira: payload.asistira,
            mensaje,
            fecha: new Date().toISOString(),
         });
         await mkdir(dirname(filePath), { recursive: true });
         await writeFile(
            filePath,
            JSON.stringify(confirmaciones, null, 2) + "\n",
         );
         response.statusCode = 201;
         response.setHeader("Content-Type", "application/json");
         response.end(JSON.stringify({ ok: true }));
      })
      .catch(() => {
         response.statusCode = 400;
         response.end(JSON.stringify({ error: "La solicitud no es válida" }));
      });

   void next;
}

// https://vite.dev/config/
export default defineConfig({
   base: process.env.VITE_BASE_PATH || "/invitacion-dragonball/",
   plugins: [
      react(),
      {
         name: "confirmaciones-api",
         configureServer(server) {
            server.middlewares.use("/api/confirmaciones", confirmationsApi);
         },
      },
   ],
   optimizeDeps: {
      exclude: [
         "same-runtime/dist/jsx-dev-runtime",
         "same-runtime/dist/jsx-runtime",
      ],
   },
});
