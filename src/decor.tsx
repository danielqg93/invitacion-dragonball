/**
 * Decoraciones propias en SVG: esferas con estrellas, nubes doradas y
 * estallidos de cómic. No usan arte oficial de ninguna serie.
 */

/** Posiciones de las estrellas (en un círculo de radio 50) según la cantidad. */
const STAR_LAYOUTS: Record<number, [number, number][]> = {
   1: [[50, 52]],
   2: [
      [38, 52],
      [62, 52],
   ],
   3: [
      [50, 38],
      [38, 60],
      [62, 60],
   ],
   4: [
      [38, 40],
      [62, 40],
      [38, 63],
      [62, 63],
   ],
   5: [
      [50, 32],
      [33, 47],
      [67, 47],
      [40, 68],
      [60, 68],
   ],
   6: [
      [37, 34],
      [63, 34],
      [30, 54],
      [70, 54],
      [40, 72],
      [60, 72],
   ],
   7: [
      [50, 30],
      [32, 42],
      [68, 42],
      [50, 52],
      [32, 64],
      [68, 64],
      [50, 75],
   ],
};

function starPath(cx: number, cy: number, r: number) {
   const pts: string[] = [];
   for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 === 0 ? r : r * 0.45;
      pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`);
   }
   return `M${pts.join("L")}Z`;
}

/** Esfera naranja con 1 a 7 estrellas rojas. */
export function Esfera({
   estrellas,
   className = "",
}: {
   estrellas: number;
   className?: string;
}) {
   const n = Math.min(7, Math.max(1, estrellas));
   const id = `esf-${n}`;
   const r = n <= 2 ? 11 : n <= 4 ? 9.5 : 8;
   return (
      <svg className={`esfera ${className}`} viewBox="0 0 100 100" aria-hidden="true">
         <defs>
            <radialGradient id={id} cx="38%" cy="32%" r="70%">
               <stop offset="0%" stopColor="#ffe08a" />
               <stop offset="45%" stopColor="#ffa31a" />
               <stop offset="100%" stopColor="#e86a00" />
            </radialGradient>
         </defs>
         <circle cx={50} cy={50} r={47} fill={`url(#${id})`} />
         <circle cx={50} cy={50} r={47} fill="none" stroke="#c45500" strokeWidth={2} />
         {STAR_LAYOUTS[n].map(([x, y]) => (
            <path key={`${x}-${y}`} d={starPath(x, y, r)} fill="#e0261b" />
         ))}
         <ellipse cx={34} cy={26} rx={14} ry={8} fill="#fff" opacity={0.7} transform="rotate(-30 34 26)" />
         <circle cx={70} cy={74} r={5} fill="#fff" opacity={0.25} />
      </svg>
   );
}

/** Nube dorada esponjosa. */
export function NubeDorada({ className = "" }: { className?: string }) {
   return (
      <svg className={`nube ${className}`} viewBox="0 0 220 100" aria-hidden="true">
         <path
            d="M30 82 C6 82 4 52 28 50 C26 28 56 18 70 34 C80 10 120 8 130 32 C146 18 176 26 174 48 C204 46 214 82 186 84 Z"
            fill="#ffd23f"
            stroke="#f0a500"
            strokeWidth={4}
            strokeLinejoin="round"
         />
         <path
            d="M50 60 q10 -12 24 -4 M110 44 q14 -10 28 0"
            fill="none"
            stroke="#fff3b0"
            strokeWidth={5}
            strokeLinecap="round"
         />
      </svg>
   );
}

/** Estallido de cómic con texto (¡BOOM!, ¡ZAS!...). */
export function Estallido({
   texto,
   className = "",
   color = "#ffd23f",
}: {
   texto: string;
   className?: string;
   color?: string;
}) {
   const pts: string[] = [];
   for (let i = 0; i < 24; i++) {
      const a = (Math.PI * 2 * i) / 24;
      const r = i % 2 === 0 ? 48 : 34;
      pts.push(`${(60 + Math.cos(a) * r * 1.2).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)}`);
   }
   return (
      <span className={`estallido ${className}`} aria-hidden="true">
         <svg viewBox="0 0 120 100">
            <polygon points={pts.join(" ")} fill={color} stroke="#1b2a4a" strokeWidth={3} strokeLinejoin="round" />
         </svg>
         <b>{texto}</b>
      </span>
   );
}
