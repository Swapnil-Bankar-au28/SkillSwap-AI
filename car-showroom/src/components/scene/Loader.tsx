import React from 'react';
import { useProgress } from '@react-three/drei';
import { CAR_BRAND } from '../../data/content';

export const Loader: React.FC = () => {
  const { progress, active } = useProgress();

  if (!active && progress === 100) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-carbon-900 transition-opacity duration-700 ${
        progress === 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center max-w-sm w-full px-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center font-display font-bold text-black text-lg p-1.5 shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            <svg viewBox="0 0 100 100" className="w-full h-full text-black fill-current">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" />
              <polygon points="50,10 43,45 10,65 44,55 50,90 56,55 90,65 57,45" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl tracking-wider text-white">
            {CAR_BRAND} <span className="text-emerald-400 font-mono text-sm block">AMG FRANCHISE</span>
          </span>
        </div>

        <div className="flex justify-between w-full text-xs font-mono text-gray-400 mb-2">
          <span>INITIALIZING 3D AMG STAGE</span>
          <span className="text-emerald-400 font-bold">{Math.round(progress)}%</span>
        </div>

        <div className="w-full h-1.5 bg-carbon-700 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(0,210,190,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[10px] font-mono text-gray-500 mt-4 tracking-wider uppercase">
          MERCEDES-AMG SHADER & TELEMETRY MATRIX READY
        </p>
      </div>
    </div>
  );
};
