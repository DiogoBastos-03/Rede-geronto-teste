import { ReactNode } from 'react';

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
  tone?: 'blue' | 'green' | 'neutral';
}

const toneClasses = {
  blue: 'text-blue-deep',
  green: 'text-green-forest',
  neutral: 'text-text-secondary',
};

export default function SectionLabel({
  children,
  className = '',
  tone = 'blue',
}: SectionLabelProps) {
  return (
    <span
      className={[
        'inline-block text-[12px] font-medium uppercase tracking-[1.2px]',
        toneClasses[tone],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
