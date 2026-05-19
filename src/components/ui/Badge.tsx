import { ReactNode } from 'react';

type Variant = 'blue' | 'green' | 'neutral';

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  blue: 'bg-blue-light text-[#0C447C]',
  green: 'bg-green-light text-[#085041]',
  neutral: 'bg-[#F1EFE8] text-[#444441]',
};

export default function Badge({ variant = 'blue', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-1 rounded-badge',
        'text-[12px] font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
