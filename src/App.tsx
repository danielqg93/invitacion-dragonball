import { useCallback, useEffect, useRef, useState } from "react";
import invitados from "../db/invitados.json";
import itinerario from "../db/itinerario.json";
import {
   type Bienvenida,
   type VarianteBienvenida,
   bienvenidas,
   config,
} from "./config";
import { Esfera, Estallido, NubeDorada } from "./decor";

declare global {
   interface Window {
      YT?: {
         Player: new (
            element: HTMLElement | string,
            options: {
               height?: string;
               width?: string;
               videoId?: string;
               playerVars?: Record<string, number | string>;
               events?: {
                  onReady?: (event: {
                     target: { playVideo: () => void; pauseVideo: () => void };
                  }) => void;
                  onStateChange?: (event: { data: number }) => void;
               };
            },
         ) => YTPlayer;
         PlayerState?: { PLAYING: number; PAUSED: number };
      };
      onYouTubeIframeAPIReady?: () => void;
   }
}

type YTPlayer = {
   playVideo: () => void;
   pauseVideo: () => void;
   destroy: () => void;
};

/* ------------------------------------------------------------------ */
/* Datos derivados de la configuración                                 */
/* ------------------------------------------------------------------ */

const ASSET_IMG = `${import.meta.env.BASE_URL}img`;
const img = (file: string) => `${ASSET_IMG}/${file}`;

const pad = (n: number, l = 2) => String(n).padStart(l, "0");
const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const fecha = config.fechaEvento;
const fechaCorta = `${pad(fecha.getDate())}.${pad(fecha.getMonth() + 1)}.${fecha.getFullYear()}`;
const horaTexto = fecha
   .toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
   })
   .replace(/\s*a\.?\s*m\.?/i, " am")
   .replace(/\s*p\.?\s*m\.?/i, " pm");
const diaTexto = capitalize(
   fecha.toLocaleDateString("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
   }),
);

const toCalendarDate = (date: Date) =>
   date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
   `${config.nombre} - ${config.edadTexto}`,
)}&dates=${toCalendarDate(fecha)}/${toCalendarDate(
   new Date(fecha.getTime() + config.duracionHoras * 3600000),
)}&location=${encodeURIComponent(`${config.lugar}, ${config.direccion}`)}`;

/** Variables disponibles en los textos del config: {nombre}, {edad}, etc. */
const VARS: Record<string, string> = {
   nombre: config.nombre,
   edad: String(config.edad),
   anios: config.edad === 1 ? "año" : "años",
   guerrero: config.guerrero,
   Guerrero: capitalize(config.guerrero),
   cumpleanero: config.cumpleanero,
   hora: horaTexto,
};

const escapeHtml = (s: string) =>
   s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Reemplaza {variables} en un texto del config. */
function t(texto: string, extra: Record<string, string> = {}) {
   const vars = { ...VARS, ...extra };
   return texto.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
}

/** Texto del config con HTML simple (<b>, <br>). Las variables se escapan. */
function Rich({
   texto,
   extra = {},
   as: Tag = "span",
   className,
}: {
   texto: string;
   extra?: Record<string, string>;
   as?: "span" | "p" | "small";
   className?: string;
}) {
   const safe = Object.fromEntries(
      Object.entries({ ...VARS, ...extra }).map(([k, v]) => [k, escapeHtml(v)]),
   );
   return (
      <Tag
         className={className}
         // biome-ignore lint/security/noDangerouslySetInnerHtml: textos propios del config
         dangerouslySetInnerHTML={{ __html: t(texto, safe) }}
      />
   );
}

function elegirBienvenida(): Bienvenida {
   const param = new URLSearchParams(window.location.search).get("bienvenida");
   if (param && param in bienvenidas)
      return bienvenidas[param as VarianteBienvenida];
   return bienvenidas[config.bienvenidaActiva] ?? bienvenidas.torneo;
}

const bienvenida = elegirBienvenida();

type ModoPortada = typeof config.portada.modo;
const MODOS_PORTADA: ModoPortada[] = ["personaje", "foto", "foto-y-personaje"];
const modoPortada: ModoPortada = (() => {
   const param = new URLSearchParams(window.location.search).get("portada");
   return MODOS_PORTADA.includes(param as ModoPortada)
      ? (param as ModoPortada)
      : config.portada.modo;
})();
const galleryImages = config.galeria.fotos.map((f) => img(`galeria/${f}`));
const hasMusic = config.youtubeVideoId.trim() !== "";
const TOTAL_ESFERAS = 7;
const NUMEROS = [1, 2, 3, 4, 5, 6, 7];
const STORAGE_KEY = "esferas-encontradas";

type ModalName =
   | "welcome"
   | "rsvp"
   | "dress"
   | "tips"
   | "gifts"
   | "wish"
   | null;

type IconName = "calendar" | "pin" | "check" | "camera" | "heart";

type Invitado = {
   nombre: string;
   apellidos: string;
   codigoInvitacion: string;
};

type ItinerarioItem = { hour: string; event: string; sfx?: string };

const invitadosRegistrados = invitados as Invitado[];
const eventos = itinerario as ItinerarioItem[];

function obtenerInvitado(): Invitado | null {
   const hash = window.location.hash.replace(/^#\/?/, "").trim();
   const codigo = hash.split("/").filter(Boolean)[0] || "";
   if (!codigo) return null;
   return (
      invitadosRegistrados.find(
         (i) => i.codigoInvitacion.toUpperCase() === codigo.toUpperCase(),
      ) ?? null
   );
}

function leerEsferas(): number[] {
   try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const list = raw ? (JSON.parse(raw) as unknown) : [];
      return Array.isArray(list)
         ? list.filter((n): n is number => typeof n === "number")
         : [];
   } catch {
      return [];
   }
}

function guardarEsferas(list: number[]) {
   try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
   } catch {
      /* almacenamiento no disponible: el juego funciona igual en memoria */
   }
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

function useReveal() {
   useEffect(() => {
      const elements = document.querySelectorAll("[data-reveal]");
      if (!("IntersectionObserver" in window)) {
         for (const el of elements) el.classList.add("is-visible");
         return;
      }
      const timers: number[] = [];
      const observer = new IntersectionObserver(
         (entries) => {
            for (const entry of entries) {
               if (!entry.isIntersecting) continue;
               const el = entry.target as HTMLElement;
               el.classList.add("is-visible");
               observer.unobserve(el);
               // Al terminar la animación se quita el atributo para que los
               // efectos hover no hereden el retraso escalonado.
               const i = Number(el.style.getPropertyValue("--i")) || 0;
               timers.push(
                  window.setTimeout(
                     () => el.removeAttribute("data-reveal"),
                     1500 + i * 120,
                  ),
               );
            }
         },
         { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
      );
      for (const el of elements) observer.observe(el);
      return () => {
         observer.disconnect();
         for (const t of timers) window.clearTimeout(t);
      };
   }, []);
}

/** Expone --scroll (px) y --progress (0–1) en <html> para el parallax y la barra de ki. */
function useScrollVars() {
   useEffect(() => {
      const root = document.documentElement;
      let frame = 0;
      const update = () => {
         frame = 0;
         const y = window.scrollY;
         const max = root.scrollHeight - window.innerHeight;
         root.style.setProperty("--scroll", String(Math.round(y)));
         root.style.setProperty(
            "--progress",
            max > 0 ? Math.min(1, y / max).toFixed(4) : "0",
         );
      };
      const onScroll = () => {
         if (!frame) frame = window.requestAnimationFrame(update);
      };
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      return () => {
         window.removeEventListener("scroll", onScroll);
         window.removeEventListener("resize", onScroll);
         if (frame) window.cancelAnimationFrame(frame);
      };
   }, []);
}

const reveal = (i: number) => ({ "--i": i }) as React.CSSProperties;

/* ------------------------------------------------------------------ */
/* Componentes pequeños                                                */
/* ------------------------------------------------------------------ */

function Icon({ name }: { name: IconName }) {
   const paths: Record<IconName, React.ReactNode> = {
      calendar: (
         <>
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M7 3v4M17 3v4M3 10h18" />
         </>
      ),
      pin: (
         <>
            <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
         </>
      ),
      check: (
         <>
            <circle cx="12" cy="12" r="9" />
            <path d="m8 12 2.6 2.6L16.5 9" />
         </>
      ),
      camera: (
         <>
            <path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
            <circle cx="12" cy="13" r="4" />
         </>
      ),
      heart: (
         <path d="M12 21S3 16 3 9.5A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 9 1.5C21 16 12 21 12 21Z" />
      ),
   };
   return (
      <svg
         className="icon"
         viewBox="0 0 24 24"
         aria-hidden="true"
         fill="none"
         stroke="currentColor"
         strokeWidth={2}
         strokeLinecap="round"
         strokeLinejoin="round"
      >
         {paths[name]}
      </svg>
   );
}

function Button({
   children,
   onClick,
   href,
   variant = "solid",
   type = "button",
}: {
   children: React.ReactNode;
   onClick?: () => void;
   href?: string;
   variant?: "solid" | "blue";
   type?: "button" | "submit";
}) {
   const className = `btn btn-${variant}`;
   return href ? (
      <a
         className={className}
         href={href}
         target={href.startsWith("http") ? "_blank" : undefined}
         rel="noreferrer"
      >
         {children}
      </a>
   ) : (
      <button className={className} type={type} onClick={onClick}>
         {children}
      </button>
   );
}

function SectionTitle({
   kicker,
   title,
   children,
   light = false,
}: {
   kicker?: string;
   title: string;
   children?: React.ReactNode;
   light?: boolean;
}) {
   return (
      <header
         className={`section-title ${light ? "light" : ""}`}
         data-reveal
      >
         {kicker && <span className="kicker">{kicker}</span>}
         <h2>{title}</h2>
         {children && <p>{children}</p>}
      </header>
   );
}

/** Imagen de personaje; si el archivo no existe, muestra una esfera. */
function Personaje({
   file,
   estrellas,
   className = "",
}: {
   file: string;
   estrellas: number;
   className?: string;
}) {
   const [failed, setFailed] = useState(false);
   return (
      <div className={`personaje ${failed ? "is-fallback" : ""} ${className}`}>
         {failed ? (
            <Esfera estrellas={estrellas} />
         ) : (
            <img src={img(file)} alt="" onError={() => setFailed(true)} />
         )}
      </div>
   );
}

function Stamp({
   children,
   className = "",
}: {
   children: React.ReactNode;
   className?: string;
}) {
   return (
      <div className={`stamp ${className}`} aria-hidden="true">
         <span>{children}</span>
      </div>
   );
}

async function enviarConfirmacion(body: {
   nombre: string;
   asistira: boolean;
   mensaje: FormDataEntryValue | null;
}) {
   const endpoint = config.rsvpEndpoint;
   const isAppsScript = endpoint.includes("script.google.com");
   const response = await fetch(endpoint, {
      method: "POST",
      // Google Apps Script no permite CORS: se envía "a ciegas".
      mode: isAppsScript ? "no-cors" : "cors",
      headers: {
         "Content-Type": isAppsScript
            ? "text/plain;charset=utf-8"
            : "application/json",
      },
      body: JSON.stringify(body),
   });
   if (!isAppsScript && !response.ok) throw new Error("No se pudo guardar");
}

/* ------------------------------------------------------------------ */
/* Modales                                                             */
/* ------------------------------------------------------------------ */

function Modal({
   active,
   close,
   invitado,
}: {
   active: "rsvp" | "dress" | "tips" | "gifts";
   close: () => void;
   invitado: Invitado | null;
}) {
   const [status, setStatus] = useState<
      "idle" | "saving" | "success" | "error"
   >("idle");
   const m = config.modales;
   const r = m.rsvp;
   const titles = {
      rsvp: r.titulo,
      dress: m.vestimenta.encabezado,
      tips: m.tips.encabezado,
      gifts: m.regalos.encabezado,
   };
   const stars = { rsvp: 4, dress: 1, tips: 2, gifts: 3 }[active];
   const copy = { dress: m.vestimenta, tips: m.tips, gifts: m.regalos };

   return (
      <div className="modal-backdrop" role="presentation" onMouseDown={close}>
         <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onMouseDown={(e) => e.stopPropagation()}
         >
            <button className="modal-close" onClick={close} aria-label="Cerrar">
               ×
            </button>
            <Esfera estrellas={stars} className="modal-esfera" />
            <h2 id="modal-title">{titles[active]}</h2>

            {active === "rsvp" && status !== "success" && (
               <form
                  onSubmit={async (e) => {
                     e.preventDefault();
                     setStatus("saving");
                     const formElement = e.currentTarget;
                     const form = new FormData(formElement);
                     try {
                        await enviarConfirmacion({
                           nombre: invitado
                              ? `${invitado.nombre} ${invitado.apellidos}`.trim()
                              : r.sinCodigo,
                           asistira: form.get("asistira") === "si",
                           mensaje: form.get("mensaje"),
                        });
                        setStatus("success");
                        formElement.reset();
                        window.setTimeout(close, 3500);
                     } catch {
                        setStatus("error");
                     }
                  }}
               >
                  <fieldset>
                     <legend>{r.pregunta}</legend>
                     <label className="choice">
                        <input type="radio" name="asistira" value="si" required />
                        <span>{r.si}</span>
                     </label>
                     <label className="choice">
                        <input type="radio" name="asistira" value="no" />
                        <span>{r.no}</span>
                     </label>
                  </fieldset>
                  <label>
                     {t(r.mensaje)}
                     <textarea name="mensaje" placeholder={t(r.placeholder)} />
                  </label>
                  <Button type="submit">
                     {status === "saving" ? r.enviando : r.boton}
                  </Button>
                  {status === "error" && (
                     <p className="form-status error" role="alert">
                        {r.error}
                     </p>
                  )}
               </form>
            )}
            {active === "rsvp" && status === "success" && (
               <div className="rsvp-success" role="status">
                  <Stamp className="stamp-confirmed">
                     <Rich texto={r.sello} />
                  </Stamp>
                  <p>{r.exito}</p>
               </div>
            )}

            {active !== "rsvp" && (
               <div className="modal-copy">
                  <p>{t(copy[active].titulo)}</p>
                  <span>{t(copy[active].texto)}</span>
               </div>
            )}
         </div>
      </div>
   );
}

function WishModal({
   close,
   reset,
   invitado,
}: {
   close: () => void;
   reset: () => void;
   invitado: Invitado | null;
}) {
   const j = config.juego;
   return (
      <div className="modal-backdrop wish" role="presentation" onMouseDown={close}>
         <div
            className="wish-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wish-title"
            onMouseDown={(e) => e.stopPropagation()}
         >
            <div className="wish-spheres" aria-hidden="true">
               {NUMEROS.map((n) => (
                  <Esfera key={n} estrellas={n} />
               ))}
            </div>
            <img
               className="wish-dragon"
               src={img(config.imagenes.dragonDeseo)}
               alt=""
            />
            <h2 id="wish-title">{t(j.deseoTitulo)}</h2>
            <Rich
               as="p"
               texto={invitado ? j.deseoTextoInvitado : j.deseoTexto}
               extra={{ invitado: invitado?.nombre ?? "" }}
            />
            <Button onClick={close}>{j.deseoBoton}</Button>
            <button type="button" className="text-button" onClick={reset}>
               {j.deseoReiniciar}
            </button>
         </div>
      </div>
   );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

/** Ventana de bienvenida: el diseño y los textos salen de config (bienvenidas). */
function WelcomeModal({
   enter,
   invitado,
}: {
   enter: (withMusic: boolean) => void;
   invitado: Invitado | null;
}) {
   const b = bienvenida;
   const vars = { invitado: invitado?.nombre ?? "" };
   const saludo = t(invitado ? b.saludoInvitado : b.saludo, vars);
   const subtitulo = t(b.subtitulo, vars);
   const extra = t(b.extra, vars);

   return (
      <div
         className={`modal-backdrop welcome welcome-bg-${b.estilo}`}
         role="presentation"
      >
         <div
            className={`modal-card welcome-card welcome-card-${b.estilo}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
         >
            {b.estilo === "radar" && (
               <div className="welcome-radar" aria-hidden="true">
                  <span className="radar-sweep" />
                  {NUMEROS.map((n) => (
                     <Esfera
                        key={n}
                        estrellas={n}
                        className={`radar-blip blip-${n}`}
                     />
                  ))}
               </div>
            )}
            {b.estilo === "pergamino" && extra && (
               <span className="welcome-sello">{extra}</span>
            )}
            {b.estilo !== "radar" && (
               <div className="welcome-figure">
                  {b.estilo === "nube" && extra && (
                     <Estallido texto={extra} className="welcome-sfx" />
                  )}
                  <Personaje
                     file={b.imagen}
                     estrellas={7}
                     className="welcome-personaje"
                  />
               </div>
            )}
            <p className="welcome-saludo">{saludo}</p>
            <h2 id="welcome-title">{config.nombre}</h2>
            {b.estilo === "rastreador" && extra && (
               <div className="welcome-scouter" aria-hidden="true">
                  <span className="scouter-label">NIVEL DE PELEA</span>
                  <strong>{extra}</strong>
               </div>
            )}
            {b.estilo === "shenlong" && extra && (
               <span className="welcome-concedido">{extra}</span>
            )}
            {b.estilo === "radar" && extra && (
               <span className="welcome-lectura">{extra}</span>
            )}
            {subtitulo && <span className="welcome-sub">{subtitulo}</span>}
            {hasMusic ? (
               <>
                  <Button onClick={() => enter(true)}>{b.botonConMusica}</Button>
                  <button
                     type="button"
                     className="text-button"
                     onClick={() => enter(false)}
                  >
                     {b.botonSinMusica}
                  </button>
               </>
            ) : (
               <Button onClick={() => enter(false)}>{b.botonEntrar}</Button>
            )}
         </div>
      </div>
   );
}

function App() {
   const invitado = obtenerInvitado();
   const p = config.poder;
   const c = config.credencial;
   const ce = config.celebracion;
   const en = config.entrenamiento;
   const [modal, setModal] = useState<ModalName>("welcome");
   const [welcomeClosed, setWelcomeClosed] = useState(false);
   const [slide, setSlide] = useState<number | null>(null);
   const touchStartX = useRef<number | null>(null);
   const [musicOn, setMusicOn] = useState(false);
   const [isMusicPlaying, setIsMusicPlaying] = useState(false);
   const playerRef = useRef<YTPlayer | null>(null);
   const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
   const [esferas, setEsferas] = useState<number[]>(leerEsferas);
   const [justFound, setJustFound] = useState<number | null>(null);
   const [charging, setCharging] = useState(false);
   const gallery = galleryImages;
   const isToday = Object.values(time).every((v) => v === 0);

   useReveal();
   useScrollVars();

   useEffect(() => {
      const tick = () => {
         const d = Math.max(0, fecha.getTime() - Date.now());
         setTime({
            days: Math.floor(d / 86400000),
            hours: Math.floor(d / 3600000) % 24,
            mins: Math.floor(d / 60000) % 60,
            secs: Math.floor(d / 1000) % 60,
         });
      };
      tick();
      const id = window.setInterval(tick, 1000);
      return () => window.clearInterval(id);
   }, []);

   const changeSlide = (direction: 1 | -1) => {
      setSlide((current) =>
         current === null
            ? null
            : (current + gallery.length + direction) % gallery.length,
      );
   };

   useEffect(() => {
      const key = (e: KeyboardEvent) => {
         if (e.key === "Escape") {
            if (modal === "welcome") setWelcomeClosed(true);
            setModal(null);
            setSlide(null);
         }
         if (slide === null) return;
         if (e.key === "ArrowLeft") changeSlide(-1);
         if (e.key === "ArrowRight") changeSlide(1);
      };
      window.addEventListener("keydown", key);
      return () => window.removeEventListener("keydown", key);
   });

   useEffect(() => {
      if (!welcomeClosed) return;
      const id = window.setTimeout(() => {
         setModal((current) => (current === null ? "tips" : current));
      }, 20000);
      return () => window.clearTimeout(id);
   }, [welcomeClosed]);

   const open = (name: ModalName) => setModal(name);

   const recoger = useCallback((n: number) => {
      setEsferas((current) => {
         if (current.includes(n)) return current;
         const next = [...current, n];
         guardarEsferas(next);
         if (next.length === TOTAL_ESFERAS) {
            window.setTimeout(() => setModal("wish"), 700);
         }
         return next;
      });
      setJustFound(n);
      window.setTimeout(() => setJustFound(null), 1600);
   }, []);

   const reiniciarEsferas = () => {
      guardarEsferas([]);
      setEsferas([]);
      setModal(null);
   };

   /** Esfera escondida en una sección. Desaparece al recogerla. */
   const Escondida = ({ n, className }: { n: number; className: string }) =>
      esferas.includes(n) ? null : (
         <button
            type="button"
            className={`escondida ${className}`}
            onClick={() => recoger(n)}
            aria-label={`Recoger la esfera de ${n} ${n === 1 ? "estrella" : "estrellas"}`}
         >
            <Esfera estrellas={n} />
         </button>
      );

   const lanzarEnergia = () => {
      if (charging) return;
      setCharging(true);
      window.setTimeout(() => {
         setCharging(false);
         open("rsvp");
      }, 1100);
   };

   const enter = (withMusic: boolean) => {
      setMusicOn(hasMusic);
      setIsMusicPlaying(withMusic && hasMusic);
      setWelcomeClosed(true);
      setModal(null);
   };

   const toggleMusic = () => {
      const next = !isMusicPlaying;
      setIsMusicPlaying(next);
      if (!playerRef.current) return;
      if (next) playerRef.current.playVideo();
      else playerRef.current.pauseVideo();
   };

   // biome-ignore lint/correctness/useExhaustiveDependencies: el reproductor se crea una sola vez al ingresar
   useEffect(() => {
      if (!musicOn || !hasMusic) return;
      const setupPlayer = () => {
         const container = document.getElementById("music-player-container");
         if (!container || !window.YT?.Player) return;
         playerRef.current = new window.YT.Player(container, {
            height: "1",
            width: "1",
            videoId: config.youtubeVideoId,
            playerVars: {
               autoplay: isMusicPlaying ? 1 : 0,
               loop: 1,
               playlist: config.youtubeVideoId,
               controls: 0,
               rel: 0,
               playsinline: 1,
            },
            events: {
               onReady: (event) => {
                  if (isMusicPlaying) event.target.playVideo();
               },
               onStateChange: (event) => {
                  setIsMusicPlaying(
                     event.data === window.YT?.PlayerState?.PLAYING,
                  );
               },
            },
         });
      };
      if (window.YT?.Player) {
         setupPlayer();
      } else {
         if (
            !document.querySelector(
               'script[src="https://www.youtube.com/iframe_api"]',
            )
         ) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            document.body.appendChild(tag);
         }
         window.onYouTubeIframeAPIReady = setupPlayer;
      }
      return () => {
         playerRef.current?.destroy();
         playerRef.current = null;
         window.onYouTubeIframeAPIReady = undefined;
      };
   }, [musicOn]);

   const handleTouchStart = (event: React.TouchEvent) => {
      touchStartX.current = event.touches[0]?.clientX ?? null;
   };
   const handleTouchEnd = (event: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const distance = event.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(distance) < 45) return;
      changeSlide(distance < 0 ? 1 : -1);
   };

   const mainStyle = {
      "--fotocumple": `url("${img(config.imagenes.fotoCumple)}")`,
   } as React.CSSProperties;

   return (
      <main style={mainStyle}>
         {config.demo.activo && (
            <div className="demo-aviso">
               <span>Demo · {config.demo.paquete}</span>
               <a href={config.demo.cotizarUrl} target="_top">
                  Cotízala
               </a>
            </div>
         )}
         {musicOn && hasMusic && (
            <>
               <div className="hidden-music-player" aria-hidden="true">
                  <div id="music-player-container" />
               </div>
               <button
                  type="button"
                  className="music-toggle"
                  onClick={toggleMusic}
                  aria-label={
                     isMusicPlaying ? "Pausar música" : "Reproducir música"
                  }
               >
                  {isMusicPlaying ? "❚❚" : "▶"}
               </button>
            </>
         )}

         {/* ---------- Contador de esferas ---------- */}
         {welcomeClosed && (
            <button
               type="button"
               className={`radar ${esferas.length === TOTAL_ESFERAS ? "complete" : ""}`}
               onClick={() =>
                  esferas.length === TOTAL_ESFERAS && setModal("wish")
               }
               aria-label={`Esferas encontradas: ${esferas.length} de ${TOTAL_ESFERAS}`}
            >
               <span className="radar-dots" aria-hidden="true">
                  {NUMEROS.map((n) => (
                     <i key={n} className={esferas.includes(n) ? "on" : ""} />
                  ))}
               </span>
               <span className="radar-count">
                  {esferas.length}/{TOTAL_ESFERAS}
               </span>
            </button>
         )}
         {justFound !== null && (
            <div className="found-toast" role="status">
               <Esfera estrellas={justFound} />
               <span>
                  {t(config.juego.encontrada, {
                     n: String(justFound),
                     estrellas: justFound === 1 ? "estrella" : "estrellas",
                  })}
               </span>
            </div>
         )}

         <div className="ki-bar" aria-hidden="true">
            <span />
         </div>

         {/* ---------------- PORTADA ---------------- */}
         <section className="hero" id="inicio">
            <div className="speed-lines" aria-hidden="true" />
            <NubeDorada className="nube-1 parallax" />
            <NubeDorada className="nube-2 parallax" />
            <NubeDorada className="nube-3 parallax" />
            {config.imagenes.dragonPortada && (
               <img
                  className="hero-shenlong parallax"
                  src={img(config.imagenes.dragonPortada)}
                  alt=""
                  aria-hidden="true"
               />
            )}
            <div className="hero-inner">
               <div className={`hero-character modo-${modoPortada} parallax`}>
                  <div className="aura" aria-hidden="true" />
                  {modoPortada !== "personaje" && (
                     <div className="hero-foto">
                        <span className="hero-foto-anillo" aria-hidden="true" />
                        <img
                           src={img(config.imagenes.fotoPortada)}
                           alt={config.nombre}
                        />
                        {config.portada.insignia && (
                           <span className="hero-foto-insignia">
                              {t(config.portada.insignia)}
                           </span>
                        )}
                     </div>
                  )}
                  {modoPortada !== "foto" && (
                     <Personaje
                        file={config.imagenes.heroe}
                        estrellas={4}
                        className="hero-personaje"
                     />
                  )}
               </div>
               <div className="hero-content parallax">
                  <span className="hero-tag">{t(config.portada.etiqueta)}</span>
                  <h1>{config.nombre}</h1>
                  <p className="hero-age">{t(config.portada.frase)}</p>
                  <p className="hero-date">{fechaCorta}</p>
               </div>
            </div>
            <Escondida n={1} className="esc-hero" />
         </section>

         <div className="content">
            {/* ---------------- INTRO ---------------- */}
            <section className="intro halftone">
               <div className="panel intro-panel" data-reveal="left">
                  <Estallido texto={config.intro.estallido} className="intro-burst" />
                  <p className="quote">{t(config.intro.frase)}</p>
                  <ul className="facts">
                     <li>
                        <strong>{config.edad}</strong>
                        {t(config.intro.datos.anios)}
                     </li>
                     <li>
                        <strong>
                           {(config.edad * 365).toLocaleString("es-PE")}
                        </strong>
                        {t(config.intro.datos.dias)}
                     </li>
                     <li>
                        <strong>1</strong>
                        {t(config.intro.datos.fiesta)}
                     </li>
                  </ul>
               </div>
               <div className="game-hint" data-reveal="right">
                  <div className="hint-spheres spin-scroll" aria-hidden="true">
                     {NUMEROS.map((n) => (
                        <Esfera key={n} estrellas={n} />
                     ))}
                  </div>
                  <Rich as="p" texto={config.juego.pista} />
               </div>
               <Escondida n={2} className="esc-intro" />
            </section>

            {/* ---------------- NIVEL DE PODER ---------------- */}
            <section className="power">
               <SectionTitle kicker={p.kicker} title={p.titulo} light>
                  {t(p.subtitulo)}
               </SectionTitle>
               <div className="hud" data-reveal="punch">
                  <div className="hud-top">
                     <span>
                        {p.objetivo}: {config.nombre.toUpperCase()}
                     </span>
                     <span className="blink">{p.analizando}</span>
                  </div>
                  {isToday ? (
                     <p className="hud-max">{p.esHoy}</p>
                  ) : (
                     <div className="hud-digits">
                        {[
                           [time.days, p.unidades.dias],
                           [time.hours, p.unidades.horas],
                           [time.mins, p.unidades.min],
                           [time.secs, p.unidades.seg],
                        ].map(([n, label]) => (
                           <div key={label}>
                              <strong>{pad(Number(n))}</strong>
                              <small>{label}</small>
                           </div>
                        ))}
                     </div>
                  )}
                  <div className="hud-bar" aria-hidden="true">
                     <span />
                  </div>
                  <p className="hud-foot">{t(p.pie)}</p>
               </div>
               <Escondida n={3} className="esc-power" />
            </section>

            {/* ---------------- CREDENCIAL ---------------- */}
            <section className="badge-section halftone">
               <SectionTitle kicker={c.kicker} title={c.titulo}>
                  {t(c.subtitulo)}
               </SectionTitle>
               <div className="badge" data-reveal="flip">
                  <div className="badge-head">
                     <span>{t(c.cabecera)}</span>
                     <span className="badge-no">
                        Nº {invitado?.codigoInvitacion ?? "000"}
                     </span>
                  </div>
                  <div className="badge-body">
                     <Personaje
                        file={config.imagenes.credencial}
                        estrellas={5}
                        className="badge-photo"
                     />
                     <dl>
                        <div>
                           <dt>{c.luchador}</dt>
                           <dd className="badge-name">
                              {invitado
                                 ? `${invitado.nombre} ${invitado.apellidos}`.trim()
                                 : c.sinNombre}
                           </dd>
                        </div>
                        <div>
                           <dt>{c.categoria}</dt>
                           <dd>{c.categoriaValor}</dd>
                        </div>
                        <div>
                           <dt>{c.arena}</dt>
                           <dd>{config.lugar}</dd>
                        </div>
                        <div>
                           <dt>{c.combate}</dt>
                           <dd>
                              {fechaCorta} · {horaTexto}
                           </dd>
                        </div>
                     </dl>
                  </div>
                  <Stamp className="stamp-badge">{c.sello}</Stamp>
               </div>
               <Escondida n={4} className="esc-badge" />
            </section>

            {/* ---------------- CELEBRACIÓN ---------------- */}
            <section className="celebration" id="celebracion">
               <SectionTitle kicker={ce.kicker} title={ce.titulo}>
                  {t(ce.subtitulo)}
               </SectionTitle>
               <div className="panels">
                  <article className="panel info-panel" data-reveal="slam" style={reveal(0)}>
                     <div className="info-icon">
                        <Icon name="calendar" />
                     </div>
                     <h3>{ce.dia}</h3>
                     <p>
                        {diaTexto}
                        <br />
                        {horaTexto}
                     </p>
                     <Button href={calendarUrl}>{ce.botonAgendar}</Button>
                  </article>
                  <article className="panel info-panel" data-reveal="slam" style={reveal(1)}>
                     <div className="info-icon">
                        <Icon name="check" />
                     </div>
                     <h3>{ce.arena}</h3>
                     <p>{config.lugar}</p>
                     <Button variant="blue" onClick={() => open("rsvp")}>
                        {ce.botonConfirmar}
                     </Button>
                  </article>
                  <article className="panel info-panel" data-reveal="slam" style={reveal(2)}>
                     <div className="info-icon">
                        <Icon name="pin" />
                     </div>
                     <h3>{ce.direccion}</h3>
                     <p>
                        {config.direccion}
                        {config.referencia && (
                           <small className="info-ref">{config.referencia}</small>
                        )}
                     </p>
                     <Button href={config.mapsUrl}>{ce.botonMapa}</Button>
                  </article>
               </div>
            </section>

            {/* ---------------- ITINERARIO (MANGA) ---------------- */}
            <section className="itinerary halftone" id="itinerario">
               <SectionTitle
                  kicker={config.itinerario.kicker}
                  title={config.itinerario.titulo}
               >
                  {t(config.itinerario.subtitulo)}
               </SectionTitle>
               <ol className="episodes">
                  {eventos.map((item, i) => (
                     <li
                        className="panel episode"
                        key={`${item.hour}-${item.event}`}
                        data-reveal={i % 2 ? "right" : "left"}
                     >
                        <span className="ep-number">
                           {config.itinerario.episodio} {i + 1}
                        </span>
                        <time>{item.hour}</time>
                        <p>{item.event}</p>
                        {item.sfx && (
                           <Estallido
                              texto={item.sfx}
                              className="ep-sfx"
                              color={i % 2 ? "#7cc6ff" : "#ffd23f"}
                           />
                        )}
                     </li>
                  ))}
               </ol>
               <Escondida n={5} className="esc-itinerary" />
            </section>

            {/* ---------------- CONFIRMAR (RAYO) ---------------- */}
            <section className={`rsvp-banner ${charging ? "charging" : ""}`}>
               <div className="speed-lines" aria-hidden="true" />
               <div className="beam" aria-hidden="true" />
               <div className="rsvp-inner" data-reveal="punch">
                  <div className="energy-ball" aria-hidden="true" />
                  <h2>{t(config.confirmar.titulo)}</h2>
                  <p>{t(config.confirmar.texto)}</p>
                  <Button onClick={lanzarEnergia}>
                     {charging ? config.confirmar.cargando : config.confirmar.boton}
                  </Button>
               </div>
               <Escondida n={6} className="esc-rsvp" />
            </section>

            {/* ---------------- GALERÍA (CÓMIC) ---------------- */}
            {gallery.length > 0 && (
               <section className="gallery halftone" id="galeria">
                  <SectionTitle
                     kicker={config.galeria.kicker}
                     title={t(config.galeria.titulo)}
                  >
                     {t(config.galeria.subtitulo)}
                  </SectionTitle>
                  <div className="galeria">
                     {gallery.map((src, i) => (
                        <button
                           type="button"
                           className="galeria-item"
                           key={src}
                           onClick={() => setSlide(i)}
                           data-reveal="zoom"
                           style={{ "--d": `${(i % 3) * 0.12}s` } as React.CSSProperties}
                           aria-label={`Ver foto ${i + 1} en grande`}
                        >
                           <img
                              src={src}
                              alt={`Recuerdo de ${config.nombre} ${i + 1}`}
                              loading="lazy"
                           />
                        </button>
                     ))}
                  </div>
               </section>
            )}

            {slide !== null && gallery.length > 0 && (
               <div
                  className="lightbox"
                  role="dialog"
                  aria-modal="true"
                  aria-label={`Foto ${slide + 1} de ${gallery.length}`}
                  onMouseDown={(e) => {
                     if (e.target === e.currentTarget) setSlide(null);
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
               >
                  <button
                     type="button"
                     className="lightbox-close"
                     onClick={() => setSlide(null)}
                     aria-label="Cerrar foto ampliada"
                  >
                     ×
                  </button>
                  <button
                     type="button"
                     className="lightbox-nav prev"
                     onClick={() => changeSlide(-1)}
                     aria-label="Foto anterior"
                  >
                     ‹
                  </button>
                  <img src={gallery[slide]} alt={`Foto ${slide + 1}`} />
                  <button
                     type="button"
                     className="lightbox-nav next"
                     onClick={() => changeSlide(1)}
                     aria-label="Foto siguiente"
                  >
                     ›
                  </button>
                  <span className="lightbox-counter">
                     {slide + 1} / {gallery.length}
                  </span>
               </div>
            )}

            {/* ---------------- ENTRENAMIENTO ---------------- */}
            <section className="party" id="fiesta">
               <SectionTitle kicker={en.kicker} title={en.titulo}>
                  {t(en.subtitulo)}
               </SectionTitle>
               <div className="party-grid">
                  {(["dress", "tips", "gifts"] as const).map((key, i) => (
                     <article
                        className="panel party-card"
                        key={key}
                        data-reveal="slam"
                        style={reveal(i)}
                     >
                        <Esfera estrellas={i + 1} className="party-esfera" />
                        <h3>{en.tarjetas[key].titulo}</h3>
                        <p>{t(en.tarjetas[key].texto)}</p>
                        <Button onClick={() => open(key)}>{en.boton}</Button>
                     </article>
                  ))}
               </div>
            </section>

            {/* ---------------- COMPARTE FOTOS ---------------- */}
            <section className="photos-section">
               <div className="photos-inner" data-reveal="zoom">
                  <Icon name="camera" />
                  <h2>{t(config.fotos.titulo)}</h2>
                  <p>{t(config.fotos.texto)}</p>
                  {config.fotos.albumUrl ? (
                     <a
                        className="hashtag"
                        href={config.fotos.albumUrl}
                        target="_blank"
                        rel="noreferrer"
                     >
                        <strong>{config.fotos.hashtag}</strong>
                        <span>{config.fotos.botonAlbum}</span>
                     </a>
                  ) : (
                     <strong className="hashtag">{config.fotos.hashtag}</strong>
                  )}
               </div>
            </section>

            {/* ---------------- PIE ---------------- */}
            <footer>
               <img
                  className="footer-dragon"
                  src={img(config.imagenes.dragonPie)}
                  alt=""
               />
               <p className="footer-cierre">{t(config.pie.cierre)}</p>
               <h2>{config.nombre}</h2>
               <p className="footer-age">{config.edadTexto}</p>
               <nav>
                  <button type="button" onClick={() => open("rsvp")}>
                     {config.pie.confirmar}
                  </button>
                  <a href="#celebracion">{config.pie.agendar}</a>
               </nav>
               <Escondida n={7} className="esc-footer" />
               <Rich as="small" texto={config.pie.creditos} />
            </footer>
         </div>

         {/* ---------------- BIENVENIDA ---------------- */}
         {modal === "welcome" && (
            <WelcomeModal enter={enter} invitado={invitado} />
         )}
         {modal === "wish" && (
            <WishModal
               close={() => setModal(null)}
               reset={reiniciarEsferas}
               invitado={invitado}
            />
         )}
         {modal &&
            modal !== "welcome" &&
            modal !== "wish" && (
               <Modal
                  active={modal}
                  close={() => setModal(null)}
                  invitado={invitado}
               />
            )}
      </main>
   );
}

export default App;
