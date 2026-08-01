import React from 'react';
import type { MercedesCarModel } from '../../data/content';
import { ChevronDown, Zap, Car } from 'lucide-react';

interface HeroSectionProps {
  selectedCar: MercedesCarModel;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ selectedCar }) => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-between pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Hero Text Content Overlay (3D Stage Canvas lives fixed inset-0 z-0 behind this) */}
      <div className="relative z-10 max-w-2xl mt-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-panel border border-emerald-400/30 text-emerald-400 font-mono text-xs tracking-widest uppercase mb-4 shadow-[0_0_20px_rgba(0,210,190,0.2)]">
          <Zap className="w-3.5 h-3.5" />
          <span>{selectedCar.series} // {selectedCar.badge}</span>
        </div>

        <h1 className="font-display font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white leading-none drop-shadow-md">
          {selectedCar.name.toUpperCase()}
        </h1>

        <p className="mt-3 font-display font-semibold text-xl sm:text-2xl text-emerald-400 tracking-wide">
          {selectedCar.tagline}
        </p>

        <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-xl leading-relaxed font-body">
          {selectedCar.description}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#configurator"
            className="px-8 py-4 rounded-full bg-emerald-400 hover:bg-emerald-300 text-black font-display font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_30px_rgba(0,210,190,0.4)] hover:scale-105"
          >
            Configure Paint & Spec
          </a>
          <a
            href="#fleet"
            className="px-8 py-4 rounded-full glass-panel text-white hover:text-emerald-400 font-display font-bold text-sm tracking-wider uppercase transition-all border border-white/10 hover:border-emerald-400/50 flex items-center space-x-2"
          >
            <Car className="w-4 h-4 text-emerald-400" />
            <span>Switch Mercedes Model</span>
          </a>
        </div>
      </div>

      {/* Hero Bottom Telemetry Spec Bar */}
      <div className="relative z-10 mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-white/10 pt-6 gap-6 glass-panel px-6 py-4 rounded-2xl">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-6 sm:gap-10">
          <div>
            <div className="font-mono text-xs text-gray-400 uppercase">POWER</div>
            <div className="font-display font-bold text-2xl text-emerald-400">{selectedCar.horsepower} HP</div>
          </div>
          <div>
            <div className="font-mono text-xs text-gray-400 uppercase">0–60 MPH</div>
            <div className="font-display font-bold text-2xl text-white">{selectedCar.zeroToSixty}s</div>
          </div>
          <div>
            <div className="font-mono text-xs text-gray-400 uppercase">TOP SPEED</div>
            <div className="font-display font-bold text-2xl text-white">{selectedCar.topSpeed} MPH</div>
          </div>
          <div className="hidden sm:block">
            <div className="font-mono text-xs text-gray-400 uppercase">STARTING PRICE</div>
            <div className="font-display font-bold text-xl text-amber-400">{selectedCar.price}</div>
          </div>
        </div>

        <a
          href="#fleet"
          className="flex items-center space-x-2 text-xs font-mono text-gray-400 hover:text-emerald-400 transition-colors animate-bounce"
        >
          <span>SCROLL FOR 3D CAMERA SHOTS</span>
          <ChevronDown className="w-4 h-4 text-emerald-400" />
        </a>
      </div>
    </section>
  );
};
