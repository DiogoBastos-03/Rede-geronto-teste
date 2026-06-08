import type { StatusType } from '../../diagnostico/types';

interface ScoreGaugeProps {
  score: number;        // 0–100
  status: StatusType;
}

const STATUS_COLOR: Record<StatusType, string> = {
  'Inicial':             '#EF4444',
  'Em Desenvolvimento':  '#F59E0B',
  'Avançado':            '#3B82F6',
  'Pronto':              '#10B981',
};

const STATUS_BG: Record<StatusType, string> = {
  'Inicial':             '#FEF2F2',
  'Em Desenvolvimento':  '#FFFBEB',
  'Avançado':            '#EFF6FF',
  'Pronto':              '#ECFDF5',
};

export default function ScoreGauge({ score, status }: ScoreGaugeProps) {
  // SVG semicircle: center (120, 110), radius 90
  // Flat edge at y=110, top arc at y=20
  // Arc spans x: 30 to 210
  const cx = 120;
  const cy = 110;
  const R = 90;
  const strokeW = 14;

  const fraction = Math.min(Math.max(score / 100, 0), 1);

  // Angle in standard math coords: θ=π at left (0%), θ=0 at right (100%)
  // θ = π*(1 - fraction)
  const theta = Math.PI * (1 - fraction);

  // SVG coords (y inverted): x = cx + R*cos(θ), y = cy - R*sin(θ)
  const needleX = cx + R * Math.cos(theta);
  const needleY = cy - R * Math.sin(theta);

  // Score arc: M left A R R 0 0 1 needleX needleY
  // sweep=1 (clockwise in screen) goes UP from left → through top → to needle ✓
  // large-arc=0 always (arc is ≤ 180°)
  const left = cx - R;

  const color = STATUS_COLOR[status];

  // Tick marks at 0, 25, 50, 75, 100 %
  const ticks = [0, 25, 50, 75, 100].map((pct) => {
    const t = Math.PI * (1 - pct / 100);
    const inner = R - strokeW / 2 - 6;
    const outer = R + strokeW / 2 + 4;
    return {
      pct,
      x1: cx + inner * Math.cos(t),
      y1: cy - inner * Math.sin(t),
      x2: cx + outer * Math.cos(t),
      y2: cy - outer * Math.sin(t),
    };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        viewBox="0 0 240 130"
        className="w-full max-w-[260px]"
        aria-label={`Escore de prontidão: ${score} de 100 — ${status}`}
        role="img"
      >
        {/* Background track */}
        <path
          d={`M ${left} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />

        {/* Colored score arc */}
        {fraction > 0.005 && (
          <path
            d={`M ${left} ${cy} A ${R} ${R} 0 0 1 ${needleX.toFixed(2)} ${needleY.toFixed(2)}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        )}

        {/* Needle dot at current score */}
        {fraction > 0.005 && fraction < 0.995 && (
          <circle
            cx={needleX}
            cy={needleY}
            r={strokeW / 2 + 1}
            fill="white"
            stroke={color}
            strokeWidth="2"
          />
        )}

        {/* Tick marks */}
        {ticks.map(({ pct, x1, y1, x2, y2 }) => (
          <line
            key={pct}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#D1D5DB"
            strokeWidth="1.5"
          />
        ))}

        {/* Score number */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          dominantBaseline="auto"
          fill="#111827"
          fontSize="42"
          fontWeight="800"
          fontFamily="Inter, system-ui, sans-serif"
          letterSpacing="-2"
        >
          {score}
        </text>

        {/* "de 100" label */}
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          dominantBaseline="hanging"
          fill="#9CA3AF"
          fontSize="12"
          fontFamily="Inter, system-ui, sans-serif"
        >
          de 100
        </text>
      </svg>

      {/* Status badge */}
      <span
        className="px-5 py-1.5 rounded-full text-[13px] font-semibold"
        style={{ backgroundColor: STATUS_BG[status], color }}
      >
        {status}
      </span>

      {/* Faixa description */}
      <p className="text-[12px] text-center max-w-[220px]" style={{ color: '#6B7280' }}>
        {score <= 40 && 'Município no início da jornada. Apoio estruturado é essencial.'}
        {score > 40 && score <= 60 && 'Fundamentos em desenvolvimento. Foco em consolidação.'}
        {score > 60 && score <= 80 && 'Boa capacidade instalada. Execução bem encaminhada.'}
        {score > 80 && 'Alto nível de prontidão. Implementação pode avançar rapidamente.'}
      </p>
    </div>
  );
}
