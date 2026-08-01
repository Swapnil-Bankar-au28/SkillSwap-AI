import React from 'react';
import type { MercedesCarModel } from '../../data/content';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface InteriorSectionProps {
  selectedCar: MercedesCarModel;
}

export const InteriorSection: React.FC<InteriorSectionProps> = ({ selectedCar }) => {
  return (
    <section id="interior" className="relative min-h-screen flex items-center py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Empty left column clearance */}
        <div className="hidden lg:block lg:col-span-5 pointer-events-none">
          <div className="glass-panel p-6 rounded-2xl border border-emerald-400/20 max-w-xs">
            <div className="font-mono text-xs text-emerald-400 uppercase tracking-widest mb-1">
              COCKPIT ANGLE
            </div>
            <div className="font-display text-white text-sm font-bold">
              0.58 SCROLL PROGRESS // PITCH DOWN VIEW
            </div>
          </div>
        </div>

        {/* Right Content Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 font-mono text-xs font-semibold text-emerald-400 tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>// LUXURY AMG COCKPIT CRAFTSMANSHIP</span>
          </div>

          <h2 className="font-display font-extrabold text-4xl sm:text-6xl text-white tracking-tight leading-none">
            {selectedCar.name} CABIN
          </h2>

          <p className="text-base sm:text-lg text-gray-300 font-body leading-relaxed">
            Ergonomically sculpted around the driver with sustainable DINAMICA Alcantara, Nappa leather, and tactile forged carbon switchgear.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {selectedCar.interiorFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="glass-panel p-4 rounded-xl border border-white/10 flex items-center space-x-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="font-display font-medium text-sm text-white">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <div className="glass-panel-accent p-6 rounded-2xl border border-emerald-400/30 mt-6">
            <h4 className="font-display font-bold text-emerald-400 text-base mb-1">
              Burmester 3D High-End Spatial Surround Sound
            </h4>
            <p className="text-xs text-gray-300 font-body leading-relaxed">
              Integrated seat exciters and 22 speakers engineered specifically for the Mercedes-AMG acoustic interior cabin environment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
