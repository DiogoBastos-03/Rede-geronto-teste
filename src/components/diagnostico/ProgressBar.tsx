interface ProgressBarProps {
  current: number;   // 1-based
  total: number;
  phases: string[];
}

export default function ProgressBar({ current, total, phases }: ProgressBarProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Phase labels */}
      <div className="hidden sm:flex items-center gap-0">
        {phases.map((name, idx) => {
          const num = idx + 1;
          const done = num < current;
          const active = num === current;
          return (
            <div key={num} className="flex items-center flex-1 min-w-0">
              {/* Step circle */}
              <div className="shrink-0 flex flex-col items-center gap-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all"
                  style={{
                    backgroundColor: done
                      ? '#28A87A'
                      : active
                        ? '#0C4A8C'
                        : '#E5E7EB',
                    color: done || active ? '#FFFFFF' : '#9CA3AF',
                  }}
                >
                  {done ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    num
                  )}
                </div>
                <span
                  className="text-[11px] font-medium whitespace-nowrap"
                  style={{ color: active ? '#0C4A8C' : done ? '#28A87A' : '#9CA3AF' }}
                >
                  {name}
                </span>
              </div>

              {/* Connector line */}
              {idx < total - 1 && (
                <div
                  className="flex-1 h-0.5 mx-2 rounded-full transition-all"
                  style={{ backgroundColor: done ? '#28A87A' : '#E5E7EB' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: simple progress bar + text */}
      <div className="sm:hidden">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[13px] font-semibold text-text-primary">
            Fase {current}: {phases[current - 1]}
          </span>
          <span className="text-[12px] text-text-secondary">
            {current} de {total}
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: '#E5E7EB' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((current - 1) / (total - 1)) * 100}%`,
              background: 'linear-gradient(90deg, #0C4A8C, #28A87A)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
