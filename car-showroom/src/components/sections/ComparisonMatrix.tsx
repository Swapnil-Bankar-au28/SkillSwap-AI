import React, { useState } from 'react';
import { MERCEDES_FLEET, COMPETITOR_BENCHMARKS } from '../../data/content';
import { ArrowRightLeft, ExternalLink, Sparkles } from 'lucide-react';

interface ComparisonMatrixProps {
  onSelectCar: (carId: string) => void;
}

export const ComparisonMatrixSection: React.FC<ComparisonMatrixProps> = ({ onSelectCar }) => {
  const [selectedMercedesId, setSelectedMercedesId] = useState<string>('amg-one');
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>('ferrari-sf90');
  const [highlightDifferences, setHighlightDifferences] = useState<boolean>(true);

  const mercCar = MERCEDES_FLEET.find(c => c.id === selectedMercedesId) || MERCEDES_FLEET[0];
  const compCar = COMPETITOR_BENCHMARKS.find(c => c.id === selectedCompetitorId) || COMPETITOR_BENCHMARKS[0];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-4">
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Cross-Brand Automotive Matrix</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white mb-4">
          PERFORMANCE & COST <span className="text-emerald-400">BENCHMARK</span>
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base">
          Side-by-side engineering breakdown comparing Mercedes-AMG & Maybach flagships against global supercar rivals with telemetry metrics and pricing analysis.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 mb-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Mercedes Selector */}
          <div>
            <label className="block text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">
              Select Mercedes Flagship Model
            </label>
            <select
              value={selectedMercedesId}
              onChange={(e) => setSelectedMercedesId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition"
            >
              {MERCEDES_FLEET.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.name} — {car.price} ({car.horsepower} HP)
                </option>
              ))}
            </select>
          </div>

          {/* Competitor Selector */}
          <div>
            <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
              Select Competitor Brand Rival
            </label>
            <select
              value={selectedCompetitorId}
              onChange={(e) => setSelectedCompetitorId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 transition"
            >
              {COMPETITOR_BENCHMARKS.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.brand}: {comp.name} — {comp.price} ({comp.horsepower} HP)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-neutral-400">
            <input
              type="checkbox"
              checked={highlightDifferences}
              onChange={(e) => setHighlightDifferences(e.target.checked)}
              className="rounded bg-neutral-950 border-neutral-800 text-emerald-500 focus:ring-emerald-500"
            />
            <span>Highlight Advantage Winner</span>
          </label>

          <button
            onClick={() => onSelectCar(mercCar.id)}
            className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition"
          >
            <span>Launch 3D {mercCar.name}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-3 bg-neutral-950/80 border-b border-neutral-800 p-4 sm:p-6 text-sm font-semibold">
          <div className="text-neutral-400 uppercase tracking-wider text-xs font-mono">Specification Parameter</div>
          <div className="text-emerald-400 font-display font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{mercCar.name}</span>
          </div>
          <div className="text-cyan-400 font-display font-bold">{compCar.name}</div>
        </div>

        <div className="divide-y divide-neutral-800/60 text-sm">
          {/* Price */}
          <div className="grid grid-cols-3 p-4 sm:p-6 items-center hover:bg-neutral-800/30 transition">
            <div className="font-mono text-xs text-neutral-400">MSRP Franchise Price</div>
            <div className={`font-bold text-base ${highlightDifferences && mercCar.basePriceRaw < compCar.priceRaw ? 'text-emerald-400 font-extrabold' : 'text-white'}`}>
              {mercCar.price}
            </div>
            <div className={`font-bold text-base ${highlightDifferences && compCar.priceRaw < mercCar.basePriceRaw ? 'text-cyan-400 font-extrabold' : 'text-white'}`}>
              {compCar.price}
            </div>
          </div>

          {/* Horsepower */}
          <div className="grid grid-cols-3 p-4 sm:p-6 items-center hover:bg-neutral-800/30 transition">
            <div className="font-mono text-xs text-neutral-400">Total Horsepower (HP)</div>
            <div className={`font-bold ${highlightDifferences && mercCar.horsepower > compCar.horsepower ? 'text-emerald-400 font-extrabold' : 'text-white'}`}>
              {mercCar.horsepower} HP
            </div>
            <div className={`font-bold ${highlightDifferences && compCar.horsepower > mercCar.horsepower ? 'text-cyan-400 font-extrabold' : 'text-white'}`}>
              {compCar.horsepower} HP
            </div>
          </div>

          {/* 0-60 MPH Acceleration */}
          <div className="grid grid-cols-3 p-4 sm:p-6 items-center hover:bg-neutral-800/30 transition">
            <div className="font-mono text-xs text-neutral-400">0–60 MPH Acceleration</div>
            <div className={`font-bold ${highlightDifferences && mercCar.zeroToSixty < compCar.zeroToSixty ? 'text-emerald-400 font-extrabold' : 'text-white'}`}>
              {mercCar.zeroToSixty} sec
            </div>
            <div className={`font-bold ${highlightDifferences && compCar.zeroToSixty < mercCar.zeroToSixty ? 'text-cyan-400 font-extrabold' : 'text-white'}`}>
              {compCar.zeroToSixty} sec
            </div>
          </div>

          {/* Top Speed */}
          <div className="grid grid-cols-3 p-4 sm:p-6 items-center hover:bg-neutral-800/30 transition">
            <div className="font-mono text-xs text-neutral-400">Top Track Velocity</div>
            <div className={`font-bold ${highlightDifferences && mercCar.topSpeed > compCar.topSpeed ? 'text-emerald-400 font-extrabold' : 'text-white'}`}>
              {mercCar.topSpeed} MPH
            </div>
            <div className={`font-bold ${highlightDifferences && compCar.topSpeed > mercCar.topSpeed ? 'text-cyan-400 font-extrabold' : 'text-white'}`}>
              {compCar.topSpeed} MPH
            </div>
          </div>

          {/* Powertrain / Engine */}
          <div className="grid grid-cols-3 p-4 sm:p-6 items-center hover:bg-neutral-800/30 transition">
            <div className="font-mono text-xs text-neutral-400">Engine / Powertrain</div>
            <div className="text-neutral-200 text-xs sm:text-sm">{mercCar.engine}</div>
            <div className="text-neutral-200 text-xs sm:text-sm">{compCar.engine}</div>
          </div>

          {/* Key Advantage Summary */}
          <div className="grid grid-cols-3 p-4 sm:p-6 items-center bg-neutral-950/40">
            <div className="font-mono text-xs text-emerald-400">Platform Value Proposition</div>
            <div className="text-xs text-emerald-300 pr-2">{mercCar.description}</div>
            <div className="text-xs text-cyan-300 pr-2">{compCar.keyAdvantage}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
