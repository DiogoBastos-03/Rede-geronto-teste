import { NOTA_LABELS } from '../../diagnostico/types';

interface RatingInputProps {
  label: string;
  description?: string;
  value: number;          // 0 = not answered, 1–5 = selected
  onChange: (v: number) => void;
  hasError?: boolean;
}

export default function RatingInput({
  label,
  description,
  value,
  onChange,
  hasError,
}: RatingInputProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-[14px] font-semibold text-text-primary leading-snug">
        {label}
      </legend>
      {description && (
        <p className="text-[13px] text-text-secondary leading-relaxed -mt-1">
          {description}
        </p>
      )}

      {/* 5 numbered buttons */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const isSelected = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-pressed={isSelected}
              className="flex-1 py-2.5 rounded-[10px] text-[14px] font-semibold transition-all"
              style={{
                backgroundColor: isSelected ? '#0C4A8C' : '#F7F9FC',
                color: isSelected ? '#FFFFFF' : '#4A5568',
                border: isSelected
                  ? '1.5px solid #0C4A8C'
                  : hasError && value === 0
                    ? '1.5px solid #EF4444'
                    : '1.5px solid #DDE5EE',
                boxShadow: isSelected ? '0 2px 10px rgba(12,74,140,0.25)' : 'none',
              }}
            >
              {n}
            </button>
          );
        })}
      </div>

      {/* Label row */}
      <div className="flex justify-between text-[11px] px-0.5" style={{ color: '#9CA3AF' }}>
        <span>Muito baixo</span>
        <span style={{ color: value > 0 ? '#0C4A8C' : '#9CA3AF', fontWeight: value > 0 ? 600 : 400 }}>
          {value > 0 ? NOTA_LABELS[value] : 'Selecione uma nota'}
        </span>
        <span>Muito alto</span>
      </div>
    </fieldset>
  );
}
