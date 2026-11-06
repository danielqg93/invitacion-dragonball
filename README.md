# Invitación digital — Gran Torneo de Cumpleaños

Invitación de cumpleaños de una sola página (React + Vite + TypeScript) inspirada en
el anime de guerreros y esferas: estilo cómic, aura de energía, medidor de nivel de
poder, credencial de luchador, episodios de manga y un **juego de 7 esferas escondidas**
que al completarse muestra un deseo.

## 1. Editar los datos

Todo está en **`src/config.ts`** (busca `TODO`): `EDAD`, `nombre`, `guerrero`,
`fechaEvento` (**el mes empieza en 0**), `lugar`, `direccion`, `mapsUrl`,
`youtubeVideoId`, `rsvpEndpoint`, textos de galería, hashtag y modales.
Actualiza también `<title>` y las etiquetas `og:` en `index.html`.

## 2. Imágenes

Ver `public/img/LEEME.txt`. Sin imágenes de personajes se muestran esferas en su lugar.
Licencias en `CREDITOS.md`.

## 3. Invitados e itinerario

- `db/invitados.json` → link personal: `https://danielqg93.github.io/invitacion-dragonball/#/CODIGO`
- `db/itinerario.json` → cada episodio admite `"sfx"` (onomatopeya: "¡BOOM!", "¡ZAS!"...).

## 4. El juego de las esferas

Hay 7 esferas escondidas (portada, intro, nivel de poder, credencial, itinerario,
confirmar y pie). El contador de abajo a la izquierda muestra el progreso; se guarda
en el navegador del invitado.

## 5. Confirmaciones

- **Local y Netlify:** `rsvpEndpoint: "/api/confirmaciones"`.
- **GitHub Pages:** usa la URL de tu propio Google Apps Script.

## Comandos

```bash
bun install
bun run dev      # http://localhost:5173/invitacion-dragonball/
bun run lint
bun run build
```
