import React, { useState } from 'react';
import type { MercedesCarModel, ColorOption, WheelOption, InteriorOption, PackageOption } from '../../data/content';
import { Palette, Disc, Armchair, ShieldCheck, Check, Sparkles, ArrowRight } from 'lucide-react';

interface ConfiguratorSectionProps {
  paintColor: string;
  setPaintColor: (hex: string) => void;
  selectedCar: MercedesCarModel;
}

export const ConfiguratorSection: React.FC<ConfiguratorSectionProps> = ({
  paintColor,
  setPaintColor,
  selectedCar,
}) => {
  const [selectedWheelId, setSelectedWheelId] = useState<string>(selectedCar.wheels[0]?.id || '');
  const [selectedInteriorId, setSelectedInteriorId] = useState<string>(selectedCar.interiorTrims[0]?.id || '');
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);

  const colorOptions = selectedCar.colors;
  const currentColorObj =
    colorOptions.find((c) => c.hex.toLowerCase() === paintColor.toLowerCase()) || colorOptions[0];

  const currentWheelObj = selectedCar.wheels.find((w) => w.id === selectedWheelId) || selectedCar.wheels[0];
  const currentInteriorObj = selectedCar.interiorTrims.find((i) => i.id === selectedInteriorId) || selectedCar.interiorTrims[0];

  // Dynamic Price Calculation
  const paintAddonPrice = currentColorObj?.price || 0;
  const wheelAddonPrice = currentWheelObj?.price || 0;
  const interiorAddonPrice = currentInteriorObj?.price || 0;

  const packageAddonPrice = selectedPackageIds.reduce((total, pkgId) => {
    const pkg = selectedCar.packages.find((p) => p.id === pkgId);
    return total + (pkg?.price || 0);
  }, 0);

  const totalCalculatedPrice = selectedCar.basePriceRaw + paintAddonPrice + wheelAddonPrice + interiorAddonPrice + packageAddonPrice;

  const togglePackage = (pkgId: string) => {
    if (selectedPackageIds.includes(pkgId)) {
      setSelectedPackageIds(selectedPackageIds.filter((id) => id !== pkgId));
    } else {
      setSelectedPackageIds([...selectedPackageIds, pkgId]);
    }
  };

  return (
    <section id="configurator" className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-4">
          <Palette className="w-3.5 h-3.5" />
          <span>Interactive 3D Bespoke Configurator</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white mb-4">
          CONFIGURE YOUR <span className="text-emerald-400">{selectedCar.name.toUpperCase()}</span>
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base">
          Customize exterior metallic finish, forged wheels, interior Nappa leather trim, and carbon track options with live MSRP recalculation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Options Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Exterior Paint Color Swatches */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <span className="font-mono text-xs text-neutral-400 uppercase flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" />
                <span>1. Exterior Paint Finish</span>
              </span>
              <span className="font-mono text-xs text-emerald-400 font-bold uppercase">
                {currentColorObj.name} ({paintAddonPrice > 0 ? `+$${paintAddonPrice.toLocaleString()}` : 'Included'})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {colorOptions.map((color: ColorOption) => {
                const isSelected = paintColor.toLowerCase() === color.hex.toLowerCase();
                return (
                  <button
                    key={color.id}
                    onClick={() => setPaintColor(color.hex)}
                    className={`relative h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? 'ring-2 ring-emerald-400 scale-105 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                        : 'hover:scale-100 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-emerald-400">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-neutral-400 font-body">{currentColorObj.description}</p>
          </div>

          {/* 2. Forged Wheels Option */}
          {selectedCar.wheels.length > 0 && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <span className="font-mono text-xs text-neutral-400 uppercase flex items-center gap-2">
                  <Disc className="w-4 h-4 text-cyan-400" />
                  <span>2. AMG Forged Wheels</span>
                </span>
              </div>

              <div className="space-y-3">
                {selectedCar.wheels.map((w: WheelOption) => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWheelId(w.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                      selectedWheelId === w.id
                        ? 'bg-cyan-500/10 border-cyan-400 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-white">{w.name}</div>
                      <div className="text-xs text-neutral-500 font-mono">{w.size} • {w.finish}</div>
                    </div>
                    <div className="font-mono text-xs font-bold text-cyan-400">
                      {w.price > 0 ? `+$${w.price.toLocaleString()}` : 'Standard'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Interior Leather Trim Option */}
          {selectedCar.interiorTrims.length > 0 && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <span className="font-mono text-xs text-neutral-400 uppercase flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-emerald-400" />
                  <span>3. Interior Nappa Leather Trim</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedCar.interiorTrims.map((trim: InteriorOption) => (
                  <button
                    key={trim.id}
                    onClick={() => setSelectedInteriorId(trim.id)}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                      selectedInteriorId === trim.id
                        ? 'bg-emerald-500/10 border-emerald-400 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: trim.hex }} />
                      <div>
                        <div className="text-xs font-bold text-white">{trim.name}</div>
                        <div className="text-[10px] text-neutral-500">{trim.material}</div>
                      </div>
                    </div>
                    <div className="font-mono text-xs font-bold text-emerald-400">
                      {trim.price > 0 ? `+$${trim.price.toLocaleString()}` : 'Standard'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Carbon & Track Performance Packages */}
          {selectedCar.packages.length > 0 && (
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <span className="font-mono text-xs text-neutral-400 uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>4. Carbon Aero & Telemetry Suites</span>
                </span>
              </div>

              <div className="space-y-3">
                {selectedCar.packages.map((pkg: PackageOption) => {
                  const isChecked = selectedPackageIds.includes(pkg.id);
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => togglePackage(pkg.id)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                        isChecked
                          ? 'bg-cyan-500/10 border-cyan-400 text-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="pr-4">
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <input type="checkbox" checked={isChecked} readOnly className="rounded border-neutral-700 text-cyan-500" />
                          <span>{pkg.name}</span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">{pkg.description}</p>
                      </div>
                      <div className="font-mono text-xs font-bold text-cyan-400 shrink-0">
                        +${pkg.price.toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Dynamic Spec Summary Sticky Card */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-neutral-900/95 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase">Configuration Summary</span>
                <h3 className="text-xl font-display font-extrabold text-white">{selectedCar.name}</h3>
              </div>
              <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>

            {/* Price Breakdown List */}
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>Base Model Allocation</span>
                <span className="text-white">${selectedCar.basePriceRaw.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Paint ({currentColorObj.name})</span>
                <span className="text-emerald-400">{paintAddonPrice > 0 ? `+$${paintAddonPrice.toLocaleString()}` : '$0'}</span>
              </div>
              {currentWheelObj && (
                <div className="flex justify-between text-neutral-400">
                  <span>Wheels ({currentWheelObj.name})</span>
                  <span className="text-cyan-400">{wheelAddonPrice > 0 ? `+$${wheelAddonPrice.toLocaleString()}` : '$0'}</span>
                </div>
              )}
              {currentInteriorObj && (
                <div className="flex justify-between text-neutral-400">
                  <span>Interior ({currentInteriorObj.name})</span>
                  <span className="text-emerald-400">{interiorAddonPrice > 0 ? `+$${interiorAddonPrice.toLocaleString()}` : '$0'}</span>
                </div>
              )}
              {packageAddonPrice > 0 && (
                <div className="flex justify-between text-neutral-400">
                  <span>Selected Performance Suites</span>
                  <span className="text-cyan-400">+${packageAddonPrice.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="border-t border-neutral-800 pt-4 flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400 uppercase">Total Configured MSRP</span>
              <div className="text-2xl sm:text-3xl font-display font-extrabold text-emerald-400">
                ${totalCalculatedPrice.toLocaleString()}
              </div>
            </div>

            <a
              href="#test-drive"
              className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 text-center"
            >
              <span>Lock Spec & Reserve Allocation</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
