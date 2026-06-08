import { rawDimensions } from '../../diagnostico/scoring';
import type { DiagnosticoFormData } from '../../diagnostico/types';

interface DimensionBarsProps {
  formData: DiagnosticoFormData;
  possuiConselho: boolean;
  possuiFundo: boolean;
}

const DIMENSIONS = [
  { key: 'capacidadeInstitucional', label: 'Capacidade Institucional', color: '#0C4A8C' },
  { key: 'recursosHumanos',         label: 'Recursos Humanos',         color: '#2196C9' },
  { key: 'conhecimentoLegal',       label: 'Conhecimento Legal',        color: '#7C3AED' },
  { key: 'apoioPolitico',           label: 'Apoio Político',            color: '#0891B2' },
  { key: 'engajamentoSocial',       label: 'Engajamento Social',        color: '#28A87A' },
  { key: 'contextoLocal',           label: 'Contexto Local',            color: '#D97706' },
] as const;

type DimKey = (typeof DIMENSIONS)[number]['key'];

function Bar({ value, color }: { value: number; color: string }) {
  // value is 1–5 scale (may be a float avg)
  const pct = (value / 5) * 100;
  return (
    <div
      className="flex-1 h-2 rounded-full overflow-hidden"
      style={{ backgroundColor: '#E5E7EB' }}
    >
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

function IndicatorChip({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-[12px] font-medium flex-1"
      style={{
        backgroundColor: active ? '#ECFDF5' : '#FFF1F2',
        color: active ? '#065F46' : '#991B1B',
        border: `1px solid ${active ? '#A7F3D0' : '#FECACA'}`,
      }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: active ? '#28A87A' : '#EF4444' }}
        aria-hidden="true"
      />
      {label}
      <span className="ml-auto font-bold">{active ? 'Sim' : 'Não'}</span>
    </div>
  );
}

export default function DimensionBars({
  formData,
  possuiConselho,
  possuiFundo,
}: DimensionBarsProps) {
  const raw = rawDimensions(formData);

  return (
    <div className="flex flex-col gap-4">
      {/* 6 dimension bars */}
      {DIMENSIONS.map(({ key, label, color }) => {
        const value = raw[key as DimKey];
        const displayVal = Number.isInteger(value) ? value : value.toFixed(1);
        return (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-medium text-text-primary">{label}</span>
              <span
                className="text-[13px] font-bold tabular-nums"
                style={{ color }}
              >
                {displayVal}/5
              </span>
            </div>
            <Bar value={value} color={color} />
          </div>
        );
      })}

      {/* Indicators */}
      <div className="flex gap-3 pt-2">
        <IndicatorChip label="Conselho do Idoso" active={possuiConselho} />
        <IndicatorChip label="Fundo Municipal"   active={possuiFundo} />
      </div>
    </div>
  );
}
