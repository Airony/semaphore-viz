import type { CarState } from '../types';

// ─── Layout constants ────────────────────────────────────────────────────────
const W = 600;
const H = 600;
const ROAD_W = 80;        // road width in px
const CX = W / 2;         // centre X
const CY = H / 2;         // centre Y
const HALF = ROAD_W / 2;

// Car dimensions
const CAR_W = 38;
const CAR_H = 22;

// Positions for each CarPosition on each voie
// voie 1 = horizontal (left→right), voie 2 = vertical (top→bottom)
const POSITIONS: Record<string, { x: number; y: number; angle: number }> = {
  // voie 1 – left approach
  'v1-arriving':       { x: 60,  y: CY,      angle: 0 },
  'v1-queued':         { x: 110, y: CY,      angle: 0 },
  'v1-waiting_mutex':  { x: 155, y: CY,      angle: 0 },
  'v1-waiting_signal': { x: 155, y: CY - 32, angle: 0 },
  'v1-passing':        { x: CX,  y: CY,      angle: 0 },
  'v1-done':           { x: 540, y: CY,      angle: 0 },

  // voie 2 – top approach
  'v2-arriving':       { x: CX,  y: 60,       angle: 90 },
  'v2-queued':         { x: CX,  y: 110,      angle: 90 },
  'v2-waiting_mutex':  { x: CX,  y: 155,      angle: 90 },
  'v2-waiting_signal': { x: CX + 32, y: 155,  angle: 90 },
  'v2-passing':        { x: CX,  y: CY,       angle: 90 },
  'v2-done':           { x: CX,  y: 540,      angle: 90 },
};

const CAR_COLORS: Record<string, string> = {
  V1:  '#3b82f6',   // blue-500
  V1A: '#3b82f6',
  V1B: '#6366f1',   // indigo-500
  V2:  '#f59e0b',   // amber-500
  V2A: '#f59e0b',
  V2B: '#ef4444',   // red-500
  V3:  '#10b981',   // emerald-500
};

// Dynamic color palettes for simulation mode
const VOIE1_PALETTE = ['#3b82f6', '#6366f1', '#8b5cf6', '#0ea5e9', '#06b6d4'];
const VOIE2_PALETTE = ['#f59e0b', '#ef4444', '#f97316', '#e11d48', '#ec4899'];

function carColor(id: string, voie?: 1 | 2) {
  if (CAR_COLORS[id]) return CAR_COLORS[id];
  // Dynamic: pick from palette based on numeric ID and voie
  const num = parseInt(id.replace(/\D/g, ''), 10) || 1;
  const palette = voie === 2 ? VOIE2_PALETTE : VOIE1_PALETTE;
  return palette[(num - 1) % palette.length];
}

function getPos(car: CarState) {
  if (car.position === 'off') return null;
  const key = `v${car.voie}-${car.position}`;
  return POSITIONS[key] ?? null;
}

interface CarSVGProps {
  car: CarState;
  index: number;   // stacking offset for same-position cars
}

function CarSVG({ car, index }: CarSVGProps) {
  const pos = getPos(car);
  if (!pos) return null;

  const offsetX = car.voie === 2 ? index * 14 : 0;
  const offsetY = car.voie === 1 ? index * 14 : 0;
  const x = pos.x + offsetX;
  const y = pos.y + offsetY;
  const color = carColor(car.id, car.voie);

  return (
    <g
      transform={`translate(${x},${y}) rotate(${pos.angle})`}
      style={{ transition: 'transform 0.5s ease' }}
    >
      {/* Offset shadow (cel-shaded) */}
      <rect
        x={-CAR_W / 2 + 3}
        y={-CAR_H / 2 + 3}
        width={CAR_W}
        height={CAR_H}
        rx={2}
        fill="rgba(0,0,0,0.85)"
      />
      {/* Car body */}
      <rect
        x={-CAR_W / 2}
        y={-CAR_H / 2}
        width={CAR_W}
        height={CAR_H}
        rx={2}
        fill={color}
        stroke="#000"
        strokeWidth={2}
      />
      {/* Label */}
      <text
        x={0}
        y={1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
        fontWeight="900"
        fill="white"
        stroke="black"
        strokeWidth={0.5}
        paintOrder="stroke"
      >
        {car.id}
      </text>
    </g>
  );
}

interface TrafficLightProps {
  x: number;
  y: number;
  green: boolean;
  label: string;
}

function TrafficLight({ x, y, green, label }: TrafficLightProps) {
  return (
    <g>
      {/* Housing shadow */}
      <rect x={x - 10 + 2} y={y - 26 + 2} width={20} height={44} rx={0} fill="rgba(0,0,0,0.6)" />
      {/* Housing */}
      <rect x={x - 10} y={y - 26} width={20} height={44} rx={0} className="cs-svg-intersection" stroke="#000" strokeWidth={2} />
      {/* Red light */}
      <circle cx={x} cy={y - 10} r={6} fill={green ? 'var(--tl-red-off)' : '#ff2244'} stroke="#000" strokeWidth={2} />
      {/* Green light */}
      <circle cx={x} cy={y + 10} r={6} fill={green ? '#00cc55' : 'var(--tl-grn-off)'} stroke="#000" strokeWidth={2} />
      <text x={x} y={y + 30} textAnchor="middle" fontSize={8} fill="var(--road-label-fill)" fontWeight="900">{label}</text>
    </g>
  );
}

interface Props {
  cars: CarState[];
  feux: 1 | 2;
}

export default function IntersectionView({ cars, feux }: Props) {
  // Group cars by position key to stack them
  const byPosKey: Record<string, CarState[]> = {};
  for (const car of cars) {
    if (car.position === 'off' || car.position === 'done') continue;
    const key = `v${car.voie}-${car.position}`;
    if (!byPosKey[key]) byPosKey[key] = [];
    byPosKey[key].push(car);
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      style={{ maxHeight: 520 }}
    >
      {/* Base */}
      <rect width={W} height={H} fill="var(--bg-page)" />

      {/* Grass zones */}
      <rect x={0} y={0} width={CX - HALF} height={CY - HALF} className="cs-svg-grass" />
      <rect x={CX + HALF} y={0} width={CX - HALF} height={CY - HALF} className="cs-svg-grass" />
      <rect x={0} y={CY + HALF} width={CX - HALF} height={CY - HALF} className="cs-svg-grass" />
      <rect x={CX + HALF} y={CY + HALF} width={CX - HALF} height={CY - HALF} className="cs-svg-grass" />

      {/* Roads */}
      <rect x={0} y={CY - HALF} width={W} height={ROAD_W} className="cs-svg-road" />
      <rect x={CX - HALF} y={0} width={ROAD_W} height={H} className="cs-svg-road" />

      {/* Road borders */}
      <line x1={0} y1={CY - HALF} x2={CX - HALF} y2={CY - HALF} stroke="var(--road-border)" strokeWidth={2} />
      <line x1={0} y1={CY + HALF} x2={CX - HALF} y2={CY + HALF} stroke="var(--road-border)" strokeWidth={2} />
      <line x1={CX + HALF} y1={CY - HALF} x2={W} y2={CY - HALF} stroke="var(--road-border)" strokeWidth={2} />
      <line x1={CX + HALF} y1={CY + HALF} x2={W} y2={CY + HALF} stroke="var(--road-border)" strokeWidth={2} />
      <line x1={CX - HALF} y1={0} x2={CX - HALF} y2={CY - HALF} stroke="var(--road-border)" strokeWidth={2} />
      <line x1={CX + HALF} y1={0} x2={CX + HALF} y2={CY - HALF} stroke="var(--road-border)" strokeWidth={2} />
      <line x1={CX - HALF} y1={CY + HALF} x2={CX - HALF} y2={H} stroke="var(--road-border)" strokeWidth={2} />
      <line x1={CX + HALF} y1={CY + HALF} x2={CX + HALF} y2={H} stroke="var(--road-border)" strokeWidth={2} />

      {/* Intersection box */}
      <rect x={CX - HALF} y={CY - HALF} width={ROAD_W} height={ROAD_W} className="cs-svg-intersection" />
      <rect x={CX - HALF} y={CY - HALF} width={ROAD_W} height={ROAD_W} fill="none" stroke="var(--road-border)" strokeWidth={2} />

      {/* Centre dashes — voie 1 */}
      {[50, 160, 420, 530].map((x) => (
        <rect key={x} x={x} y={CY - 3} width={55} height={5} className="cs-svg-dash" />
      ))}
      {/* Centre dashes — voie 2 */}
      {[50, 160, 420, 530].map((y) => (
        <rect key={y} x={CX - 3} y={y} width={5} height={55} className="cs-svg-dash" />
      ))}

      {/* Stop lines */}
      <line x1={CX - HALF - 3} y1={CY - HALF} x2={CX - HALF - 3} y2={CY + HALF} stroke="white" strokeWidth={4} />
      <line x1={CX + HALF + 3} y1={CY - HALF} x2={CX + HALF + 3} y2={CY + HALF} stroke="white" strokeWidth={4} />
      <line x1={CX - HALF} y1={CY - HALF - 3} x2={CX + HALF} y2={CY - HALF - 3} stroke="white" strokeWidth={4} />
      <line x1={CX - HALF} y1={CY + HALF + 3} x2={CX + HALF} y2={CY + HALF + 3} stroke="white" strokeWidth={4} />

      {/* Road labels */}
      <text x={22} y={CY - HALF - 10} fontSize={11} fill="var(--road-label-fill)" fontWeight="900">Voie 1 →</text>
      <text x={CX + HALF + 8} y={50} fontSize={11} fill="var(--road-label-fill)" fontWeight="900">↓ Voie 2</text>

      {/* Traffic lights */}
      {/* Voie 1 – left entry */}
      <TrafficLight x={CX - HALF - 30} y={CY - HALF + 10} green={feux === 1} label="V1" />
      {/* Voie 1 – right entry (opposite direction — always opposite) */}
      <TrafficLight x={CX + HALF + 30} y={CY + HALF - 10} green={feux === 1} label="V1" />
      {/* Voie 2 – top entry */}
      <TrafficLight x={CX + HALF - 10} y={CY - HALF - 30} green={feux === 2} label="V2" />
      {/* Voie 2 – bottom entry */}
      <TrafficLight x={CX - HALF + 10} y={CY + HALF + 30} green={feux === 2} label="V2" />

      {/* Cars */}
      {cars.map((car) => {
        const key = `v${car.voie}-${car.position}`;
        const group = byPosKey[key] ?? [];
        const stackIndex = group.indexOf(car);
        return <CarSVG key={car.id} car={car} index={stackIndex} />;
      })}

      {/* Legend */}
      <g transform={`translate(10,${H - 72})`}>
        <rect width={170} height={62} rx={0} className="cs-svg-legend-bg" />
        <rect width={170} height={62} rx={0} fill="none" stroke="var(--road-border)" strokeWidth={2} />
        <text x={8} y={14} fontSize={8} fill="var(--legend-title)" fontWeight="900" textTransform="uppercase">LÉGENDE — position voiture</text>
        {[
          { color: 'var(--dot-done)', label: 'En approche' },
          { color: '#ffaa00', label: 'Dans la file / bloquée' },
          { color: '#00ccee', label: 'Attente signal' },
        ].map((item, idx) => (
          <g key={idx} transform={`translate(8,${24 + idx * 14})`}>
            <rect width={9} height={9} rx={0} fill={item.color} stroke="var(--road-border)" strokeWidth={1} />
            <text x={14} y={8} fontSize={8} fill="var(--legend-text)" fontWeight="700">{item.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
