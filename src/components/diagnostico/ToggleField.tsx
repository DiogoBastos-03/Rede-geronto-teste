interface ToggleFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}

export default function ToggleField({
  label,
  description,
  checked,
  onChange,
  id,
}: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={id}
          className="text-[14px] font-semibold text-text-primary cursor-pointer select-none"
        >
          {label}
        </label>
        {description && (
          <p className="text-[12px] text-text-secondary">{description}</p>
        )}
      </div>

      {/* Toggle button */}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0C4A8C] focus-visible:ring-offset-2"
        style={{
          backgroundColor: checked ? '#0C4A8C' : '#D1D5DB',
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
