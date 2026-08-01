import React from 'react';
import type { MercedesCarModel } from '../../data/content';

interface DesignSectionProps {
  selectedCar: MercedesCarModel;
}

export const DesignSection: React.FC<DesignSectionProps> = ({ selectedCar }) => {
  return (
    <section id="design" className="relative min-h-screen flex items-center py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Copy Container */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-block font-mono text-xs font-semibold text-emerald-400 tracking-widest uppercase">
            // AERODYNAMIC & BODY ARCHITECTURE
          </div>

          <h2 className="font-display font-extrabold text-4xl sm:text-6xl text-white tracking-tight leading-tight">
            {selectedCar.name} DESIGN
          </h2>

          <p className="text-lg text-gray-300 leading-relaxed font-body">
            Crafted at Affalterbach and Stuttgart with active aero channels, iconic AMG Panamericana front grille, and 3D Mercedes star emblems.
          </p>

          <div className="space-y-4 pt-4">
            {selectedCar.highlights.map((item, idx) => (
              <div
                key={idx}
                className="glass-panel p-5 rounded-xl border border-white/10 hover:border-emerald-400/40 transition-colors"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h3 className="font-display font-bold text-lg text-white">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-400 font-body leading-relaxed pl-5">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side camera view clearance */}
        <div className="hidden lg:block lg:col-span-6 pointer-events-none">
          <div className="glass-panel p-6 rounded-2xl border border-emerald-400/20 max-w-xs ml-auto">
            <div className="font-mono text-xs text-emerald-400 uppercase tracking-widest mb-1">
              CAMERA ORBIT VIEW
            </div>
            <div className="font-display text-white text-sm font-bold">
              0.20 SCROLL PROGRESS // AMG SIDE PROFILE
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
