import React from 'react';
import type { MercedesCarModel } from '../../data/content';
import { StatCounter } from '../ui/StatCounter';
import { Activity } from 'lucide-react';

interface PerformanceSectionProps {
  selectedCar: MercedesCarModel;
}

export const PerformanceSection: React.FC<PerformanceSectionProps> = ({ selectedCar }) => {
  return (
    <section id="performance" className="relative min-h-screen flex items-center py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="w-full space-y-12">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 font-mono text-xs font-semibold text-emerald-400 tracking-widest uppercase mb-3">
            <Activity className="w-3.5 h-3.5" />
            <span>// TELEMETRY & TRACK METRICS</span>
          </div>

          <h2 className="font-display font-extrabold text-4xl sm:text-6xl text-white tracking-tight leading-none">
            {selectedCar.name} PERFORMANCE
          </h2>

          <p className="mt-4 text-base sm:text-lg text-gray-300 font-body leading-relaxed">
            Engineered with handcrafted AMG powertrain precision and sub-millisecond dynamic torque vectoring.
          </p>
        </div>

        {/* 4 Stat Counters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCounter
            value={selectedCar.horsepower}
            unit="HP"
            label="Peak Power Output"
            detail={selectedCar.engine}
            decimals={0}
          />
          <StatCounter
            value={selectedCar.zeroToSixty}
            unit="s"
            label="0–60 MPH Launch"
            detail="AMG Launch Control System"
            decimals={1}
          />
          <StatCounter
            value={selectedCar.topSpeed}
            unit="MPH"
            label="Top Track Velocity"
            detail="Electronically limited aero mode"
            decimals={0}
          />
          <StatCounter
            value={selectedCar.bodyStyle === 'electric' ? 350 : 720}
            unit={selectedCar.bodyStyle === 'electric' ? 'MI' : 'NM'}
            label={selectedCar.bodyStyle === 'electric' ? 'EPA Range' : 'Peak Torque'}
            detail={selectedCar.rangeOrEfficiency}
            decimals={0}
          />
        </div>

        {/* Mercedes-AMG Powertrain Strip */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold font-mono text-lg">
              AMG
            </div>
            <div>
              <h4 className="font-display font-bold text-white text-base">Handcrafted AMG Powertrain</h4>
              <p className="text-xs text-gray-400 font-body">"One Man, One Engine" traditional master mechanic assembly tag engraved on engine block.</p>
            </div>
          </div>

          <a
            href="#test-drive"
            className="whitespace-nowrap px-6 py-3 rounded-full bg-emerald-400 hover:bg-emerald-300 text-black font-display font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,210,190,0.4)]"
          >
            Reserve Track Test Drive
          </a>
        </div>
      </div>
    </section>
  );
};
