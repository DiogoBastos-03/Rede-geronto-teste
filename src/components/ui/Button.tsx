import { ButtonHTMLAttributes, ReactNode, useEffect, useRef } from 'react';
import gsap from 'gsap';

type Variant = 'primary' | 'secondary' | 'green' | 'ghost' | 'ghost-white';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

interface ButtonAsButton
  extends BaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> {
  href?: undefined;
}

interface ButtonAsLink extends BaseProps {
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  target?: string;
  rel?: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantBase: Record<Variant, string> = {
  primary:
    'text-white grad-bg-blue shadow-[0_4px_14px_rgba(12,74,140,0.35)] border border-transparent',
  secondary:
    'bg-transparent text-blue-deep border-[2px] border-blue-deep relative overflow-hidden',
  green:
    'text-white grad-bg-green shadow-[0_8px_24px_rgba(26,122,94,0.35)] border border-transparent',
  ghost:
    'bg-white text-blue-deep border-[0.5px] border-blue-border shadow-[0_2px_8px_rgba(12,74,140,0.06)]',
  'ghost-white':
    'bg-white/10 text-white border border-white/50 backdrop-blur-[2px]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-[14px] min-h-[40px]',
  md: 'px-6 py-3 text-[15px] min-h-[44px]',
  lg: 'px-8 py-[15px] text-[16px] min-h-[52px] font-medium',
};

export default function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    ariaLabel,
  } = props;

  const elRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
  const fillRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (window.innerWidth < 768) return;

    const baseShadow = window.getComputedStyle(el).boxShadow;

    let hoverShadow: string | undefined;
    if (variant === 'primary')
      hoverShadow = '0 10px 28px rgba(12,74,140,0.45)';
    else if (variant === 'green')
      hoverShadow = '0 12px 32px rgba(26,122,94,0.45)';

    const onEnter = () => {
      gsap.to(el, {
        scale: 1.04,
        boxShadow: hoverShadow ?? baseShadow,
        duration: 0.3,
        ease: 'power2.out',
      });
      if (fillRef.current) {
        gsap.to(fillRef.current, {
          scaleX: 1,
          duration: 0.45,
          ease: 'power3.out',
        });
        gsap.to(el.querySelector('.btn-label'), {
          color: '#ffffff',
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };
    const onLeave = () => {
      gsap.to(el, {
        scale: 1,
        boxShadow: baseShadow,
        duration: 0.3,
        ease: 'power2.out',
      });
      if (fillRef.current) {
        gsap.to(fillRef.current, {
          scaleX: 0,
          duration: 0.4,
          ease: 'power3.in',
        });
        gsap.to(el.querySelector('.btn-label'), {
          color: '#0C4A8C',
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [variant]);

  const classes = [
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded-pill',
    'whitespace-nowrap select-none isolate',
    'cursor-pointer will-change-transform',
    variantBase[variant],
    sizeClasses[size],
    className,
  ].join(' ');

  const inner = (
    <>
      {variant === 'secondary' && (
        <span
          ref={fillRef}
          aria-hidden="true"
          className="absolute inset-0 grad-bg-blue origin-left -z-10"
          style={{ transform: 'scaleX(0)' }}
        />
      )}
      <span
        className={
          variant === 'secondary'
            ? 'btn-label relative z-10 inline-flex items-center gap-2'
            : 'relative z-10 inline-flex items-center gap-2'
        }
      >
        {children}
      </span>
    </>
  );

  if ('href' in props && props.href) {
    const { href, onClick, target, rel } = props;
    return (
      <a
        ref={elRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        onClick={onClick}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        className={classes}
      >
        {inner}
      </a>
    );
  }

  const {
    onClick,
    type = 'button',
    disabled,
    ...rest
  } = props as ButtonAsButton;
  return (
    <button
      ref={elRef as React.RefObject<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={classes}
      {...rest}
    >
      {inner}
    </button>
  );
}
