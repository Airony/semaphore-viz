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

function carColor(id: string) {
  return CAR_COLORS[id] ?? '#94a3b8';
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
  const color = carColor(car.id);

  return (
    <g
      transform={`translate(${x},${y}) rotate(${pos.angle})`}
      style={{ transition: 'transform 0.5s ease' }}
    >
      {/* car body */}
      <rect
        x={-CAR_W / 2}
        y={-CAR_H / 2}
        width={CAR_W}
        height={CAR_H}
        rx={5}
        fill={color}
        stroke="white"
        strokeWidth={1.5}
      />
      {/* label */}
      <text
        x={0}
        y={1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
        fontWeight="bold"
        fill="white"
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
      <rect x={x - 12} y={y - 28} width={24} height={48} rx={4} fill="#1e293b" />
      <circle cx={x} cy={y - 12} r={8} fill={green ? '#4ade80' : '#334155'} />
      <circle cx={x} cy={y + 12} r={8} fill={green ? '#334155' : '#ef4444'} />
      <text x={x} y={y + 34} textAnchor="middle" fontSize={9} fill="#94a3b8">{label}</text>
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
      {/* Road background */}
      <rect width={W} height={H} fill="#0f172a" />

      {/* Grass / ground */}
      <rect x={0} y={0} width={W} height={H} fill="#14532d" opacity={0.3} rx={0} />

      {/* Horizontal road (voie 1) */}
      <rect x={0} y={CY - HALF} width={W} height={ROAD_W} fill="#374151" />
      {/* Vertical road (voie 2) */}
      <rect x={CX - HALF} y={0} width={ROAD_W} height={H} fill="#374151" />

      {/* Intersection box */}
      <rect
        x={CX - HALF}
        y={CY - HALF}
        width={ROAD_W}
        height={ROAD_W}
        fill="#4b5563"
      />

      {/* Road markings – voie 1 centre dashes */}
      {[40, 140, 420, 520].map((x) => (
        <rect key={x} x={x} y={CY - 2} width={50} height={4} rx={2} fill="#fbbf24" opacity={0.5} />
      ))}
      {/* Road markings – voie 2 centre dashes */}
      {[40, 140, 420, 520].map((y) => (
        <rect key={y} x={CX - 2} y={y} width={4} height={50} rx={2} fill="#fbbf24" opacity={0.5} />
      ))}

      {/* Stop lines */}
      <line x1={CX - HALF - 4} y1={CY - HALF} x2={CX - HALF - 4} y2={CY + HALF} stroke="white" strokeWidth={3} />
      <line x1={CX + HALF + 4} y1={CY - HALF} x2={CX + HALF + 4} y2={CY + HALF} stroke="white" strokeWidth={3} />
      <line x1={CX - HALF} y1={CY - HALF - 4} x2={CX + HALF} y2={CY - HALF - 4} stroke="white" strokeWidth={3} />
      <line x1={CX - HALF} y1={CY + HALF + 4} x2={CX + HALF} y2={CY + HALF + 4} stroke="white" strokeWidth={3} />

      {/* Road labels */}
      <text x={30} y={CY - HALF - 8} fontSize={12} fill="#94a3b8" fontWeight="bold">Voie 1 →</text>
      <text x={CX + HALF + 10} y={CY - HALF - 8} fontSize={12} fill="#94a3b8" fontWeight="bold">→</text>
      <text x={CX + HALF + 8} y={60} fontSize={12} fill="#94a3b8" fontWeight="bold">↓ Voie 2</text>

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

      {/* Legend for special positions */}
      <g transform={`translate(10,${H - 80})`}>
        <rect width={170} height={72} rx={6} fill="#1e293b" opacity={0.85} />
        <text x={8} y={16} fontSize={9} fill="#94a3b8" fontWeight="bold">LÉGENDE — position voiture</text>
        {[
          { color: '#6b7280', label: 'En approche' },
          { color: '#fbbf24', label: 'Dans la file / bloquée' },
          { color: '#22d3ee', label: 'Attente signal' },
        ].map((item, idx) => (
          <g key={idx} transform={`translate(8,${28 + idx * 16})`}>
            <rect width={10} height={10} rx={2} fill={item.color} />
            <text x={15} y={9} fontSize={9} fill="#e2e8f0">{item.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
