/**
 * ============================================================
 *  CONFIGURACIÓN DE LA INVITACIÓN — TEMA GUERREROS / ESFERAS
 *  Todo lo que dice "TODO" debe reemplazarse con los datos reales.
 *
 *  En los textos puedes usar estas variables entre llaves:
 *    {nombre}       nombre del cumpleañero/a
 *    {edad}         años que cumple (número)
 *    {anios}        "año" o "años" según la edad
 *    {guerrero}     "el guerrero" / "la guerrera"
 *    {Guerrero}     igual, con mayúscula inicial
 *    {cumpleanero}  "el cumpleañero" / "la cumpleañera"
 *    {hora}         hora de inicio (ej. "04:00 pm")
 *    {invitado}     nombre del invitado (solo si entra con su código)
 *    {n}            número de la esfera (solo en textos del juego)
 * ============================================================
 */

/** Años que cumple. */
const EDAD: number = 5; // TODO

export type VarianteBienvenida =
   | "torneo"
   | "radar"
   | "nube"
   | "rastreador"
   | "pergamino"
   | "shenlong";

export type Bienvenida = {
   /** Diseño visual de la ventana (cada uno tiene su propio estilo). */
   estilo: VarianteBienvenida;
   /** Imagen del personaje (dentro de public/img/). */
   imagen: string;
   /** Texto pequeño arriba del nombre. */
   saludo: string;
   /** Saludo cuando el invitado entra con su código (usa {invitado}). */
   saludoInvitado: string;
   /** Texto pequeño debajo del nombre. */
   subtitulo: string;
   /** Texto especial del diseño (lectura del radar, nivel de poder, etc.). */
   extra: string;
   /** Botones. */
   botonConMusica: string;
   botonSinMusica: string;
   /** Botón único cuando no hay música. */
   botonEntrar: string;
};

/**
 * EJEMPLOS DE BIENVENIDA
 * Elige uno en `bienvenidaActiva`. Para verlos todos sin tocar el código
 * abre la invitación con ?bienvenida=radar (o nube, rastreador, pergamino, shenlong, torneo).
 * Ej: https://.../?bienvenida=nube#DB0001
 */
export const bienvenidas: Record<VarianteBienvenida, Bienvenida> = {
   torneo: {
      estilo: "nube",
      imagen: "personaje-bienvenida.png",
      saludo: "¡Bienvenido, guerrero! Estás invitado al torneo de",
      saludoInvitado:
         "¡{invitado}, bienvenido al torneo! Estás invitado a la fiesta de",
      subtitulo: "La música es parte del entrenamiento",
      extra: "",
      botonConMusica: "ENTRAR CON MÚSICA",
      botonSinMusica: "Entrar sin música",
      botonEntrar: "¡QUE COMIENCE EL TORNEO!",
   },
   radar: {
      estilo: "radar",
      imagen: "", // el radar dibuja sus propias esferas
      saludo: "Radar del dragón · señal detectada",
      saludoInvitado: "Radar del dragón · {invitado}, te encontramos",
      subtitulo:
         "Las 7 esferas apuntan a la fiesta de {nombre}. ¿Aceptas la misión?",
      extra: "7 ESFERAS · 1 DESEO · {edad} {anios}",
      botonConMusica: "ACEPTAR LA MISIÓN CON MÚSICA",
      botonSinMusica: "Aceptar sin música",
      botonEntrar: "¡ACEPTAR LA MISIÓN!",
   },
   nube: {
      estilo: "nube",
      imagen: "personaje-bienvenida.png",
      saludo: "¡Sube a la nube voladora! Te llevamos a la fiesta de",
      saludoInvitado: "¡{invitado}, sube a la nube! Te llevamos a la fiesta de",
      subtitulo: "Solo los corazones valientes pueden subir… ¡y tú eres uno!",
      extra: "¡FIUUUM!",
      botonConMusica: "DESPEGAR CON MÚSICA",
      botonSinMusica: "Despegar sin música",
      botonEntrar: "¡A LA NUBE!",
   },
   rastreador: {
      estilo: "rastreador",
      imagen: "personaje-gohan.png",
      saludo: "Analizando nivel de pelea del invitado…",
      saludoInvitado: "Analizando nivel de pelea de {invitado}…",
      subtitulo: "¡Tienes el poder suficiente para la fiesta de {nombre}!",
      extra: "¡MÁS DE 9000!",
      botonConMusica: "ENTRAR CON MÚSICA",
      botonSinMusica: "Entrar sin música",
      botonEntrar: "¡LIBERAR MI PODER!",
   },
   shenlong: {
      estilo: "shenlong",
      imagen: "decoracion/shenlong-deseo.png",
      saludo: "¡Sal, dragón sagrado, y cumple mi deseo! Quiero ir a la fiesta de",
      saludoInvitado: "{invitado}, Shenlong escuchó tu deseo: ir a la fiesta de",
      subtitulo: "Reuniste las esferas… ¡tu deseo ha sido concedido!",
      extra: "¡DESEO CONCEDIDO!",
      botonConMusica: "PEDIR MI DESEO CON MÚSICA",
      botonSinMusica: "Pedir sin música",
      botonEntrar: "¡PEDIR MI DESEO!",
   },
   pergamino: {
      estilo: "pergamino",
      imagen: "personaje-piccolo.png",
      saludo:
         "El maestro te ha elegido para un entrenamiento especial en honor a",
      saludoInvitado:
         "{invitado}: el maestro te ha elegido para un entrenamiento especial en honor a",
      subtitulo: "Lee el pergamino con atención y no faltes.",
      extra: "Entrenamiento secreto",
      botonConMusica: "ABRIR EL PERGAMINO CON MÚSICA",
      botonSinMusica: "Abrir sin música",
      botonEntrar: "¡ABRIR EL PERGAMINO!",
   },
};

export const config = {
   /** Nombre del cumpleañero/a tal como aparece en grande. */
   nombre: "Mateo", // TODO (nombre de ejemplo)

   edad: EDAD,

   /** "el guerrero" / "la guerrera". */
   guerrero: "el guerrero", // TODO

   /** Cómo referirse a él/ella en textos ("el cumpleañero" / "la cumpleañera"). */
   cumpleanero: "el cumpleañero", // TODO

   /** Texto bajo el nombre (pie de página). */
   edadTexto: EDAD === 1 ? "Mi primer añito" : `Mis ${EDAD} años`,

   /**
    * Fecha y hora de inicio. OJO: el mes empieza en 0 (0 = enero, 11 = diciembre).
    * Ejemplo: new Date(2027, 4, 15, 16, 0) = 15 de mayo 2027, 4:00 pm.
    */
   fechaEvento: new Date(2027, 4, 15, 16, 0), // TODO

   /** Duración aproximada en horas (para el botón "Agendar"). */
   duracionHoras: 4,

   lugar: "Nombre del local", // TODO
   direccion: "Dirección del local", // TODO
   referencia: "Referencia: cerca de...", // TODO (deja "" para ocultarla)
   mapsUrl: "https://maps.google.com", // TODO link de Google Maps

   /** ID del video de YouTube para la música de fondo. "" = sin música. */
   // Cha-La Head-Cha-La (Opening latino de Dragon Ball Z) — Power Up Orchestra.
   // Otras opciones: "O2JxlqqOaVo" (opening latino), "LZf0STY0Yi8" (opening latino HQ).
   youtubeVideoId: "gtTvsstjJ1E",

   /**
    * Dónde se guardan las confirmaciones de asistencia.
    * - "/api/confirmaciones": funciona en local (bun run dev) y en Netlify.
    * - Para GitHub Pages usa la URL de tu propio Google Apps Script.
    */
   rsvpEndpoint: "/api/confirmaciones",

   /** Ventana de bienvenida: elige uno de los ejemplos de arriba. */
   bienvenidaActiva: "torneo" as VarianteBienvenida,

   /**
    * Imágenes que van en public/img/ (ver public/img/LEEME.txt).
    * Si alguna falta, se muestra una esfera en su lugar.
    */
   /**
    * Aviso flotante "Demo · Personalizada · Cotízala" (esquina inferior izquierda).
    * Ponlo en activo: false en la invitación real del cliente.
    */
   demo: {
      activo: true,
      paquete: "Personalizada",
      cotizarUrl: "https://invitarte-peru.com/#cotiza",
   },

   imagenes: {
      /** Personaje principal de la portada (PNG transparente, vertical). */
      heroe: "personaje-hero.png",
      /** Personaje de la credencial de luchador (PNG vertical). */
      credencial: "personaje-credencial.png",
      /** Foto del cumpleañero/a (fondo de la sección de fotos). */
      fotoCumple: "foto-cumple.jpg",
      /** Foto del cumpleañero/a en la portada (cuadrada, cara centrada). */
      fotoPortada: "foto-portada.jpg", // TODO foto real
      /** Dragón del deseo final y del pie de página. */
      dragonDeseo: "decoracion/shenlong-deseo.png",
      dragonPie: "decoracion/shenlong-pie.png",
      /** Shenlong de fondo en la portada. "" para ocultarlo. */
      dragonPortada: "decoracion/shenlong-portada.png",
   },

   /* ---------------------------------------------------------- */
   /* TEXTOS DE CADA SECCIÓN                                      */
   /* ---------------------------------------------------------- */

   portada: {
      /**
       * Qué se muestra en la portada:
       *  - "personaje":         solo el personaje (imagenes.heroe)
       *  - "foto":              solo la foto del cumpleañero/a (imagenes.fotoPortada)
       *  - "foto-y-personaje":  la foto con el personaje saliendo a su lado
       * Para probar sin tocar el código: ?portada=foto o ?portada=foto-y-personaje
       */
      modo: "foto-y-personaje" as "personaje" | "foto" | "foto-y-personaje",
      /** Insignia sobre la foto (deja "" para ocultarla). */
      insignia: "¡{edad} {anios}!",
      etiqueta: "¡Gran Torneo de Cumpleaños!",
      frase: "¡{Guerrero} más fuerte cumple {edad} {anios}!",
   },

   intro: {
      estallido: "¡HOLA!",
      frase: "Reúne tu energía, prepárate para el entrenamiento y únete a la batalla más divertida del año.",
      datos: {
         anios: "{anios} de entrenamiento",
         dias: "días acumulando poder",
         fiesta: "fiesta legendaria",
      },
   },

   juego: {
      /** HTML simple permitido: <b>…</b>. */
      pista: "<b>Misión secreta:</b> hay <b>7 esferas</b> escondidas en esta invitación. ¡Encuéntralas todas y pide tu deseo!",
      encontrada: "¡Encontraste la esfera de {n} {estrellas}!",
      deseoTitulo: "¡Tu deseo se ha cumplido!",
      deseoTexto:
         "Estás invitado a la fiesta de <b>{nombre}</b>. ¡Reuniste las 7 esferas!",
      deseoTextoInvitado:
         "{invitado}, estás invitado a la fiesta de <b>{nombre}</b>. ¡Reuniste las 7 esferas!",
      deseoBoton: "¡GENIAL!",
      deseoReiniciar: "Volver a esconder las esferas",
   },

   poder: {
      kicker: "Escáner de energía",
      titulo: "Nivel de poder",
      subtitulo: "Midiendo cuánto falta para el gran día…",
      objetivo: "OBJETIVO",
      analizando: "● ANALIZANDO",
      esHoy: "¡NIVEL MÁXIMO! ¡ES HOY!",
      unidades: { dias: "días", horas: "horas", min: "min", seg: "seg" },
      pie: "¡La energía sigue subiendo! No te pierdas el torneo.",
   },

   credencial: {
      kicker: "Registro oficial",
      titulo: "Tu credencial de luchador",
      subtitulo: "Tu presencia es lo más importante. ¡No faltes!",
      cabecera: "Gran Torneo de Cumpleaños",
      luchador: "Luchador",
      sinNombre: "Guerrero invitado",
      categoria: "Categoría",
      categoriaValor: "Invitado de honor",
      arena: "Arena",
      combate: "Combate",
      sello: "Inscrito",
   },

   celebracion: {
      kicker: "Datos del combate",
      titulo: "Celebración",
      subtitulo: "Será un día inolvidable y queremos vivirlo contigo.",
      dia: "Día",
      arena: "Arena",
      direccion: "Dirección",
      botonAgendar: "AGENDAR",
      botonConfirmar: "CONFIRMAR",
      botonMapa: "¿CÓMO LLEGAR?",
   },

   itinerario: {
      kicker: "La saga del cumpleaños",
      titulo: "Itinerario",
      subtitulo: "Cada momento de la fiesta es un nuevo episodio.",
      episodio: "Episodio",
   },

   confirmar: {
      titulo: "¡Únete al equipo!",
      texto: "Carga tu energía y confirma que vienes a la batalla.",
      boton: "LANZAR MI CONFIRMACIÓN",
      cargando: "¡CARGANDO…!",
   },

   galeria: {
      kicker: "Recuerdos",
      titulo: "Mis mejores batallas", // TODO
      subtitulo: "Cada foto, un episodio de mi historia",
      /** Archivos dentro de public/img/galeria/. Si la lista está vacía, la sección se oculta. */
      fotos: ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"] as string[], // TODO fotos reales
   },

   entrenamiento: {
      kicker: "Antes del combate",
      titulo: "Entrenamiento",
      subtitulo: "Todo lo que un buen guerrero debe saber.",
      boton: "+ INFO",
      tarjetas: {
         dress: { titulo: "Vestimenta", texto: "¿Qué me pongo?" },
         tips: { titulo: "Tips", texto: "Información útil" },
         gifts: { titulo: "Regalos", texto: "Si deseas obsequiarme" },
      },
   },

   fotos: {
      titulo: "Captura cada momento épico",
      texto: "Comparte tus fotos y videos de este día tan especial",
      /** Álbum compartido donde los invitados suben fotos. "" para ocultar el enlace. */
      albumUrl: "", // TODO
      hashtag: "#TorneoDeCumpleaños", // TODO
      botonAlbum: "COMPARTE TUS FOTOS AQUÍ",
   },

   modales: {
      rsvp: {
         titulo: "¡Únete al equipo!",
         pregunta: "¿Vienes al torneo? *",
         si: "¡Sí, ahí estaré!",
         no: "No podré ir",
         mensaje: "Mensaje para {cumpleanero} (opcional)",
         placeholder: "Mándale toda tu energía en un mensaje",
         boton: "CONFIRMAR",
         enviando: "CARGANDO ENERGÍA...",
         error: "No se pudo guardar. Inténtalo nuevamente.",
         sello: "¡Guerrero<br>confirmado!",
         exito: "¡Gracias! Tu respuesta fue guardada.",
         sinCodigo: "Invitado sin código",
      },
      vestimenta: {
         encabezado: "Vestimenta",
         titulo: "¡Ven con tu traje de entrenamiento!",
         texto: "Naranja, azul o lo que te haga sentir el guerrero más fuerte. ¡Los disfraces son bienvenidos!",
      },
      tips: {
         encabezado: "Tips de entrenamiento",
         titulo: "¡El torneo empieza puntual!",
         texto: "La batalla comienza a las {hora}. Llega unos minutos antes para calentar y no perderte ninguna batalla.",
      },
      regalos: {
         encabezado: "Regalos",
         titulo: "Tu presencia es mi mejor regalo",
         texto: "Si aun así deseas obsequiarme algo, podrás consultar los datos con mi familia.",
      },
   },

   pie: {
      cierre: "¡Te espero para la pelea más épica… de cumpleaños!",
      confirmar: "Confirmar asistencia",
      agendar: "Agendar celebración",
      creditos: "Invitación hecha con 💗 por <b>Invitarte</b>",
   },
};
