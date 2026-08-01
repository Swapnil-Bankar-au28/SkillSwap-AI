import React, { useState, useEffect } from 'react';
import { MERCEDES_FLEET } from '../../data/content';
import type { MercedesCarModel } from '../../data/content';
import { ChevronRight, Search, ArrowUpDown, ChevronLeft, ShoppingBag, Database, X, Sparkles, RefreshCcw, Eye } from 'lucide-react';

interface FleetCatalogProps {
  activeCarId: string;
  onSelectCar: (carId: string) => void;
  onAddToCart?: (car: MercedesCarModel) => void;
}

export const FleetCatalogSection: React.FC<FleetCatalogProps> = ({
  activeCarId,
  onSelectCar,
  onAddToCart,
}) => {
  const [cars, setCars] = useState<MercedesCarModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination & Filter States
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [bodyStyleFilter, setBodyStyleFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('default');

  // Detail Modal State
  const [detailCar, setDetailCar] = useState<MercedesCarModel | null>(null);

  const fetchCarsFromApi = async () => {
    setLoading(true);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '6',
        search: searchTerm,
        bodyStyle: bodyStyleFilter,
        sort: sortOption,
      });

      let response;
      try {
        response = await fetch(`/api/cars?${queryParams.toString()}`);
        if (!response.ok) throw new Error();
      } catch (e) {
        response = await fetch(`http://localhost:5000/api/cars?${queryParams.toString()}`);
      }
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const mappedData: MercedesCarModel[] = result.data.map((item: any) => ({
          id: item.carId || item.id,
          name: item.name,
          series: item.series || 'Mercedes-AMG',
          tagline: item.tagline || 'HERITAGE PERFORMANCE',
          badge: item.badge || 'FLAGSHIP ALLOCATION',
          price: item.price,
          basePriceRaw: item.basePriceRaw || 150000,
          engine: item.engine,
          horsepower: item.horsepower,
          zeroToSixty: item.zeroToSixty,
          topSpeed: item.topSpeed,
          rangeOrEfficiency: item.rangeOrEfficiency,
          description: item.description,
          bodyStyle: item.bodyStyle || 'track',
          image: item.image,
          defaultColor: item.colors?.[0]?.hex || '#101216',
          soundType: 'v8-biturbo',
          soundFrequency: 340,
          colors: item.colors || [{ id: 'black', name: 'Obsidian Black', hex: '#101216', accent: '#4b5563', finish: 'metallic', description: 'Obsidian Black', price: 0 }],
          wheels: item.wheels || [{ id: 'amg-20', name: '20" AMG Alloy', size: '20"', finish: 'Matte Black', price: 0 }],
          interiorTrims: item.interiorTrims || [{ id: 'nappa-black', name: 'Nappa Leather Black', material: 'Nappa', hex: '#1e293b', price: 0 }],
          packages: item.packages || [],
          highlights: item.highlights || [{ title: 'Automotive API Telemetry', text: 'Live vehicle specs enriched via Automotive API.' }],
          interiorFeatures: item.interiorFeatures || ['Handcrafted Leather Interior', 'Burmester Surround Audio']
        }));

        setCars(mappedData);
        setTotalPages(result.totalPages || 1);
        setTotalCount(result.totalCount || mappedData.length);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.log('API Fetch fallback to MERCEDES_FLEET dataset');
    }

    // Comprehensive Fallback Filtering & Pagination over MERCEDES_FLEET
    let filtered = [...MERCEDES_FLEET];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.series.toLowerCase().includes(q) ||
        c.engine.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.badge.toLowerCase().includes(q)
      );
    }

    if (bodyStyleFilter && bodyStyleFilter !== 'all') {
      filtered = filtered.filter(c => c.bodyStyle === bodyStyleFilter);
    }

    if (sortOption === 'price-asc') {
      filtered.sort((a, b) => a.basePriceRaw - b.basePriceRaw);
    } else if (sortOption === 'price-desc') {
      filtered.sort((a, b) => b.basePriceRaw - a.basePriceRaw);
    } else if (sortOption === 'hp-desc') {
      filtered.sort((a, b) => b.horsepower - a.horsepower);
    } else if (sortOption === 'speed-desc') {
      filtered.sort((a, b) => a.zeroToSixty - b.zeroToSixty);
    }

    const limit = 6;
    const count = filtered.length;
    const calcTotalPages = Math.ceil(count / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedCars = filtered.slice(startIndex, startIndex + limit);

    setCars(paginatedCars);
    setTotalCount(count);
    setTotalPages(calcTotalPages);
    setLoading(false);
  };

  useEffect(() => {
    fetchCarsFromApi();
  }, [page, bodyStyleFilter, sortOption]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCarsFromApi();
  };

  const handleSelectAndScroll = (carId: string) => {
    onSelectCar(carId);
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setBodyStyleFilter('all');
    setSortOption('default');
    setPage(1);
  };

  return (
    <section id="fleet" className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="w-full space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-800 pb-8">
          <div>
            <div className="inline-flex items-center space-x-2 font-mono text-xs font-semibold text-emerald-400 tracking-widest uppercase mb-3">
              <Database className="w-3.5 h-3.5" />
              <span>// PAGINATED FLEET CATALOG & AUTOMOTIVE API</span>
            </div>

            <h2 className="font-display font-extrabold text-4xl sm:text-6xl text-white tracking-tight leading-none">
              FRANCHISE <span className="text-emerald-400">FLEET CATALOG</span>
            </h2>

            <p className="mt-3 text-sm sm:text-base text-neutral-400 font-body max-w-2xl">
              Real-time vehicle catalog powered by Third-Party Automotive Data Services ({totalCount} Available Flagships).
            </p>
          </div>

          {/* Third-Party API Live Indicator */}
          <div className="inline-flex items-center gap-2 bg-neutral-900 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Automotive API Connected</span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="md:col-span-6 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search models, V8, Formula 1, Electric, Maybach..."
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-emerald-400 font-mono"
              />
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setPage(1);
                  }}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Sort Dropdown */}
            <div className="md:col-span-6 flex items-center gap-3 justify-end">
              <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sort:</span>
              </span>
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setPage(1);
                }}
                className="bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-emerald-400"
              >
                <option value="default">Default Order</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="hp-desc">Horsepower: Highest First</option>
                <option value="speed-desc">0-60 Speed: Fastest First</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-800/60">
            {[
              { id: 'all', label: 'All Vehicles' },
              { id: 'hypercar', label: 'F1 Hypercar' },
              { id: 'track', label: 'V8 Track Supercars' },
              { id: 'electric', label: '100% Electric' },
              { id: 'roadster', label: 'Roadsters' },
              { id: 'luxury-sedan', label: 'Maybach V12 Luxury' },
              { id: 'offroad', label: 'Super-SUVs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setBodyStyleFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition ${
                  bodyStyleFilter === tab.id
                    ? 'bg-emerald-400 text-black font-bold shadow-lg shadow-emerald-500/20'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State when Search/Filter returns 0 results */}
        {cars.length === 0 && !loading && (
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-500 mx-auto">
              <Search className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-white">No Flagships Found</h3>
            <p className="text-xs text-neutral-400 font-mono">
              No vehicles matched your search query <span className="text-emerald-400 font-bold">"{searchTerm}"</span> or selected filter.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 mx-auto"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Reset All Filters & View All Cars</span>
            </button>
          </div>
        )}

        {/* Vehicle Cards Grid */}
        {cars.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car) => {
              const isSelected = activeCarId === car.id;

              return (
                <div
                  key={car.id}
                  className={`group relative bg-neutral-900/90 border rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-2xl ${
                    isSelected
                      ? 'border-emerald-400 ring-2 ring-emerald-400/40'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Badge Header */}
                  <div className="p-6 pb-0 flex items-center justify-between z-10">
                    <span className="px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-emerald-400 text-[10px] font-mono font-semibold uppercase tracking-widest">
                      {car.badge}
                    </span>
                    <span className="font-mono text-sm font-extrabold text-white">{car.price}</span>
                  </div>

                  {/* Car Image Stage Preview (Clickable to open Full Details Modal) */}
                  <div
                    onClick={() => setDetailCar(car)}
                    className="relative h-44 my-4 flex items-center justify-center p-4 cursor-pointer"
                    title="Click to view full specs & options"
                  >
                    <img
                      src={car.image}
                      alt={car.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-full bg-emerald-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg">
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Full Specs</span>
                      </span>
                    </div>
                  </div>

                  {/* Specs Content */}
                  <div className="p-6 space-y-4 bg-neutral-950/60 border-t border-neutral-800 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        onClick={() => setDetailCar(car)}
                        className="font-display font-extrabold text-xl text-white tracking-tight cursor-pointer hover:text-emerald-400 transition"
                      >
                        {car.name}
                      </h3>
                      <p className="text-xs font-mono text-neutral-400 mt-1 line-clamp-2">{car.description}</p>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-neutral-800/80 text-center font-mono text-xs">
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase">0-60 MPH</div>
                        <div className="font-extrabold text-emerald-400">{car.zeroToSixty}s</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase">Power</div>
                        <div className="font-extrabold text-white">{car.horsepower} HP</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase">Top Speed</div>
                        <div className="font-extrabold text-cyan-400">{car.topSpeed} MPH</div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => setDetailCar(car)}
                        className="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Details</span>
                      </button>

                      {onAddToCart && (
                        <button
                          onClick={() => onAddToCart(car)}
                          className="py-2.5 px-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {cars.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-6 font-mono text-xs shadow-xl">
            <div className="text-neutral-400">
              Showing Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span> ({totalCount} total vehicles)
            </div>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white disabled:opacity-40 hover:border-emerald-400 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`w-8 h-8 rounded-xl font-bold font-mono text-xs transition ${
                    page === pNum
                      ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {pNum}
                </button>
              ))}

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white disabled:opacity-40 hover:border-emerald-400 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FULL CAR SPEC & DETAILS MODAL */}
      {detailCar && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-emerald-500/30 rounded-3xl w-full max-w-3xl text-white shadow-2xl overflow-hidden relative my-8">
            {/* Header */}
            <div className="p-6 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{detailCar.badge}</span>
                <h3 className="text-xl font-display font-extrabold text-white">{detailCar.name}</h3>
              </div>
              <button
                onClick={() => setDetailCar(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto font-body">
              {/* Image Preview & Key Badges */}
              <div className="bg-neutral-900/80 rounded-2xl p-6 border border-neutral-800 text-center relative overflow-hidden">
                <img
                  src={detailCar.image}
                  alt={detailCar.name}
                  className="max-h-56 max-w-full object-contain mx-auto filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]"
                />
                <div className="mt-4 flex items-center justify-between text-xs font-mono border-t border-neutral-800/80 pt-4">
                  <span className="text-neutral-400">Automotive API Status: <span className="text-emerald-400 font-bold">Live Verified</span></span>
                  <span className="text-2xl font-extrabold font-display text-emerald-400">{detailCar.price}</span>
                </div>
              </div>

              {/* 4 KPI Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center font-mono">
                  <div className="text-[10px] text-neutral-500 uppercase">0-60 Acceleration</div>
                  <div className="text-lg font-bold text-emerald-400">{detailCar.zeroToSixty}s</div>
                </div>
                <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center font-mono">
                  <div className="text-[10px] text-neutral-500 uppercase">Total Power</div>
                  <div className="text-lg font-bold text-white">{detailCar.horsepower} HP</div>
                </div>
                <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center font-mono">
                  <div className="text-[10px] text-neutral-500 uppercase">Top Track Speed</div>
                  <div className="text-lg font-bold text-cyan-400">{detailCar.topSpeed} MPH</div>
                </div>
                <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center font-mono">
                  <div className="text-[10px] text-neutral-500 uppercase">Powertrain</div>
                  <div className="text-xs font-bold text-emerald-300 truncate">{detailCar.rangeOrEfficiency}</div>
                </div>
              </div>

              {/* Engine & Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Engine & Telemetry</h4>
                <p className="text-sm text-neutral-300 leading-relaxed font-body">{detailCar.description}</p>
                <div className="text-xs font-mono text-neutral-400">Powertrain Specs: <span className="text-white font-bold">{detailCar.engine}</span></div>
              </div>

              {/* Highlights */}
              {detailCar.highlights && detailCar.highlights.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Engineering Highlights</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {detailCar.highlights.map((h, idx) => (
                      <div key={idx} className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{h.title}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1 font-mono">{h.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons Footer */}
            <div className="p-6 bg-neutral-900 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => {
                  setDetailCar(null);
                  handleSelectAndScroll(detailCar.id);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:border-emerald-400 transition"
              >
                <span>Launch 3D Stage</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {onAddToCart && (
                <button
                  onClick={() => {
                    onAddToCart(detailCar);
                    setDetailCar(null);
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add {detailCar.name} to Cart</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
