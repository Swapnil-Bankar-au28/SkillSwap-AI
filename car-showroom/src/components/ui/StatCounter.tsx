import React, { useEffect, useState, useRef } from 'react';

interface StatCounterProps {
  value: number;
  unit: string;
  label: string;
  detail: string;
  decimals?: number;
}

export const StatCounter: React.FC<StatCounterProps> = ({
  value,
  unit,
  label,
  detail,
  decimals = 0,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const duration = 1600; // ms
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = easeProgress * value;

            setDisplayValue(currentVal);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplayValue(value);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div
      ref={containerRef}
      className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-amber-500/40 transition-all duration-300 group"
    >
      <div className="flex items-baseline space-x-1 font-display">
        <span className="text-4xl sm:text-5xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
          {displayValue.toFixed(decimals)}
        </span>
        <span className="text-xl font-bold text-amber-500">{unit}</span>
      </div>

      <div className="mt-2 text-sm font-semibold tracking-wider text-gray-300 uppercase font-mono">
        {label}
      </div>

      <p className="mt-1 text-xs text-gray-400 leading-relaxed font-body">
        {detail}
      </p>
    </div>
  );
};
