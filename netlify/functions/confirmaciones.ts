import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

type Confirmacion = {
   nombre: string;
   asistira: boolean;
   mensaje: string;
   fecha: string;
};

type NetlifyEvent = {
   httpMethod?: string;
   body?: string | null;
};

const filePath = resolve(process.cwd(), "db", "confirmarAsistencia.json");

export default async (event: NetlifyEvent) => {
   if (event.httpMethod !== "POST") {
      return {
         statusCode: 405,
         headers: { Allow: "POST" },
         body: JSON.stringify({ error: "Método no permitido" }),
      };
   }

   try {
      const payload = JSON.parse(event.body || "{}");
      const nombre = String(payload.nombre || "Invitado sin código").trim();
      const mensaje = String(payload.mensaje || "").trim();
      const asistira = payload.asistira;

      if (typeof asistira !== "boolean") {
         return {
            statusCode: 400,
            body: JSON.stringify({
               error: "La asistencia es obligatoria",
            }),
         };
      }

      const confirmacion: Confirmacion = {
         nombre,
         asistira,
         mensaje,
         fecha: new Date().toISOString(),
      };
      let confirmaciones: Confirmacion[] = [];

      try {
         confirmaciones = JSON.parse(await readFile(filePath, "utf8"));
      } catch {
         confirmaciones = [];
      }

      confirmaciones.push(confirmacion);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, JSON.stringify(confirmaciones, null, 2) + "\n");

      return {
         statusCode: 201,
         body: JSON.stringify({ ok: true }),
      };
   } catch {
      return {
         statusCode: 400,
         body: JSON.stringify({ error: "La solicitud no es válida" }),
      };
   }
};
