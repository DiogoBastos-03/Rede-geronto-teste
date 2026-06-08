import type { SWOTData } from '../../diagnostico/types';

interface SWOTPanelProps {
  swot: SWOTData;
}

interface QuadrantProps {
  title: string;
  emoji: string;
  items: { text: string }[];
  bg: string;
  border: string;
  titleColor: string;
  dotColor: string;
}

function Quadrant({ title, emoji, items, bg, border, titleColor, dotColor }: QuadrantProps) {
  return (
    <div
      className="rounded-[16px] p-5 flex flex-col gap-3"
      style={{ backgroundColor: bg, border: `1px solid ${border}` }}
    >
      <div className="flex items-center gap-2">
        <span className="text-[18px]" aria-hidden="true">{emoji}</span>
        <h3 className="text-[15px] font-bold" style={{ color: titleColor }}>
          {title}
        </h3>
      </div>
      <ul className="flex flex-col gap-2.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <span
              className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: dotColor }}
              aria-hidden="true"
            />
            <span className="text-[13px] leading-relaxed text-text-primary">
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SWOTPanel({ swot }: SWOTPanelProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Quadrant
        title="Forças"
        emoji="💪"
        items={swot.forcas}
        bg="#F0FDF4"
        border="#BBF7D0"
        titleColor="#14532D"
        dotColor="#22C55E"
      />
      <Quadrant
        title="Fraquezas"
        emoji="⚠️"
        items={swot.fraquezas}
        bg="#FFF1F2"
        border="#FECACA"
        titleColor="#7F1D1D"
        dotColor="#EF4444"
      />
      <Quadrant
        title="Oportunidades"
        emoji="🚀"
        items={swot.oportunidades}
        bg="#EFF6FF"
        border="#BFDBFE"
        titleColor="#1E3A8A"
        dotColor="#3B82F6"
      />
      <Quadrant
        title="Ameaças"
        emoji="🔺"
        items={swot.ameacas}
        bg="#FFFBEB"
        border="#FDE68A"
        titleColor="#78350F"
        dotColor="#F59E0B"
      />
    </div>
  );
}
