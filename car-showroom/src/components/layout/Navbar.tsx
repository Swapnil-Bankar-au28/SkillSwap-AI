import React, { useState, useEffect } from 'react';
import type { MercedesCarModel } from '../../data/content';
import { Menu, X, ChevronRight, Car, ArrowRightLeft, Radio, Calculator, LayoutDashboard, Sparkles, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  selectedCar: MercedesCarModel;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartItemsCount?: number;
  onOpenCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedCar,
  activeTab,
  setActiveTab,
  cartItemsCount = 0,
  onOpenCart,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tabs = [
    { id: 'showroom', name: '3D Showroom', icon: Car },
    { id: 'configurator', name: '3D Configurator', icon: Sparkles },
    { id: 'compare', name: 'Spec Matrix', icon: ArrowRightLeft },
    { id: 'sound', name: 'Sound Studio', icon: Radio },
    { id: 'finance', name: 'Finance & Trade-In', icon: Calculator },
    { id: 'crm', name: 'Executive CRM', icon: LayoutDashboard },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 py-3 shadow-2xl'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button onClick={() => setActiveTab('showroom')} className="flex items-center space-x-3 group text-left">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-400 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform p-1.5">
            <svg viewBox="0 0 100 100" className="w-full h-full text-black fill-current">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" />
              <polygon points="50,10 43,45 10,65 44,55 50,90 56,55 90,65 57,45" />
            </svg>
          </div>
          <div>
            <span className="font-display font-bold text-base sm:text-lg tracking-wider text-white block leading-none">
              Mercedes-Benz
            </span>
            <span className="font-mono text-[10px] text-emerald-400 font-semibold uppercase tracking-widest block mt-0.5">
              {selectedCar.name}
            </span>
          </div>
        </button>

        {/* Center Desktop Platform Tabs */}
        <div className="hidden lg:flex items-center gap-1 bg-neutral-900/80 p-1.5 rounded-2xl border border-neutral-800 backdrop-blur-md">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-2 transition ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold shadow-lg'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Cart Button */}
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="relative px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-mono text-xs flex items-center gap-2 transition"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Cart</span>
              {cartItemsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-black font-bold text-[10px]">
                  {cartItemsCount}
                </span>
              )}
            </button>
          )}

          <a
            href="#test-drive"
            className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-display font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(0,210,190,0.4)] flex items-center space-x-1"
          >
            <span>Book Test Drive</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white relative"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 text-black text-[10px] font-bold flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-neutral-950/95 border-t border-neutral-800 px-6 py-6 space-y-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-left flex items-center gap-3 ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-neutral-300 hover:bg-neutral-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
