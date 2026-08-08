import React, { useEffect, useState } from 'react';

interface ScrollProgressBarProps {
  scrollProgressRef: React.MutableRefObject<number>;
}

export const ScrollProgressBar: React.FC<ScrollProgressBarProps> = ({ scrollProgressRef }) => {
  const [progressPct, setProgressPct] = useState(0);

  useEffect(() => {
    let animationFrameId: number;

    const updateBar = () => {
      setProgressPct(scrollProgressRef.current * 100);
      animationFrameId = requestAnimationFrame(updateBar);
    };

    animationFrameId = requestAnimationFrame(updateBar);
    return () => cancelAnimationFrame(animationFrameId);
  }, [scrollProgressRef]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-carbon-900/60 backdrop-blur-sm pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-all duration-75"
        style={{ width: `${progressPct}%` }}
      />
    </div>
  );
};
