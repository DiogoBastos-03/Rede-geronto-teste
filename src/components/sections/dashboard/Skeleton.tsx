interface SkeletonProps {
  height?: number;
  className?: string;
  rounded?: string;
}

export default function Skeleton({
  height = 16,
  className = '',
  rounded = '6px',
}: SkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`relative overflow-hidden ${className}`}
      style={{
        height,
        borderRadius: rounded,
        background:
          'linear-gradient(90deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
      }}
    />
  );
}
