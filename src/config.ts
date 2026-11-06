/**
 * ============================================================
 *  CONFIGURACIÓN DE LA INVITACIÓN — TEMA GUERREROS / ESFERAS
 *  Todo lo que dice "TODO" debe reemplazarse con los datos reales.
 * ============================================================
 */

/** Años que cumple. */
const EDAD: number = 5; // TODO

export const config = {
   /** Nombre del cumpleañero/a tal como aparece en grande. */
   nombre: "Nombre", // TODO

   edad: EDAD,

   /** "el guerrero" / "la guerrera". */
   guerrero: "el guerrero", // TODO

   /** Cómo referirse a él/ella en textos ("el cumpleañero" / "la cumpleañera"). */
   cumpleanero: "el cumpleañero", // TODO

   /** Texto bajo el nombre. */
   edadTexto: EDAD === 1 ? "Mi primer añito" : `Mis ${EDAD} años`,

   /** Etiqueta sobre el nombre en la portada. */
   etiqueta: "¡Gran Torneo de Cumpleaños!",

   /**
    * Fecha y hora de inicio. OJO: el mes empieza en 0 (0 = enero, 11 = diciembre).
    * Ejemplo: new Date(2027, 4, 15, 16, 0) = 15 de mayo 2027, 4:00 pm.
    */
   fechaEvento: new Date(2027, 4, 15, 16, 0), // TODO

   /** Duración aproximada en horas (para el botón "Agendar"). */
   duracionHoras: 4,

   /** Frase principal de la introducción. */
   frase: "Reúne tu energía, prepárate para el entrenamiento y únete a la batalla más divertida del año.",

   lugar: "Nombre del local", // TODO
   direccion: "Dirección del local", // TODO
   referencia: "Referencia: cerca de...", // TODO (deja "" para ocultarla)
   mapsUrl: "https://maps.google.com", // TODO link de Google Maps

   /** ID del video de YouTube para la música de fondo. "" = sin música. */
   youtubeVideoId: "", // TODO

   /**
    * Dónde se guardan las confirmaciones de asistencia.
    * - "/api/confirmaciones": funciona en local (bun run dev) y en Netlify.
    * - Para GitHub Pages usa la URL de tu propio Google Apps Script.
    */
   rsvpEndpoint: "/api/confirmaciones",

   galeria: {
      titulo: "Mis mejores batallas", // TODO
      subtitulo: "Cada foto, un episodio de mi historia",
      /** Archivos dentro de public/img/galeria/. Si la lista está vacía, la sección se oculta. */
      fotos: [] as string[], // TODO ej: ["1.jpg", "2.jpg"]
   },

   fotos: {
      /** Álbum compartido donde los invitados suben fotos. "" para ocultar el enlace. */
      albumUrl: "", // TODO
      hashtag: "#TorneoDeCumpleaños", // TODO
   },

   modales: {
      vestimenta: {
         titulo: "¡Ven con tu traje de entrenamiento!",
         texto: "Naranja, azul o lo que te haga sentir el guerrero más fuerte. ¡Los disfraces son bienvenidos!",
      },
      tips: {
         titulo: "¡El torneo empieza puntual!",
         texto: "Llega unos minutos antes para calentar y no perderte ninguna batalla.",
      },
      regalos: {
         titulo: "Tu presencia es mi mejor regalo",
         texto: "Si aun así deseas obsequiarme algo, podrás consultar los datos con mi familia.",
      },
   },

   /** Frase de cierre del pie de página. */
   cierre: "¡Te espero para la pelea más épica… de cumpleaños!",

   creditos: "Daniel Quezada",

   /**
    * Imágenes de personajes que colocas tú en public/img/ (ver public/img/LEEME.txt).
    * Si alguna falta, se muestra una esfera en su lugar.
    */
   imagenes: {
      /** Personaje principal de la portada (PNG transparente, vertical). */
      heroe: "personaje-hero.png",
      /** Personaje de la credencial de luchador (PNG cuadrado). */
      credencial: "personaje-credencial.png",
      /** Personaje de la ventana de bienvenida. */
      bienvenida: "personaje-bienvenida.png",
      /** Foto del cumpleañero/a (fondo de la sección de fotos). */
      fotoCumple: "foto-cumple.jpg",
   },
};
