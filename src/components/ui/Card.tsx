import { ReactNode } from 'react';

type Variant = 'default' | 'green' | 'blue';

interface CardProps {
  variant?: Variant;
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  default:
    'bg-white border border-[rgba(12,74,140,0.08)] shadow-[0_4px_24px_rgba(12,74,140,0.06)]',
  green:
    'bg-green-light border border-green-border shadow-[0_8px_32px_rgba(26,122,94,0.10)]',
  blue: 'bg-blue-light border border-blue-border',
};

export default function Card({
  variant = 'default',
  icon,
  title,
  description,
  children,
  className = '',
}: CardProps) {
  return (
    <div
      className={[
        'rounded-[20px] p-6 md:p-8',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {icon && <div className="mb-5 text-blue-deep">{icon}</div>}
      {title && (
        <h3 className="text-h3 font-medium text-text-primary mb-2 leading-snug">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-body text-text-secondary">{description}</p>
      )}
      {children}
    </div>
  );
}
