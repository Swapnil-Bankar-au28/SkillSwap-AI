import React from 'react';
import { CAR_BRAND, DEALERSHIP_NAME } from '../../data/content';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 bg-carbon-900/90 border-t border-white/10 pt-16 pb-12 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center font-display font-bold text-black text-sm p-1">
                <svg viewBox="0 0 100 100" className="w-full h-full text-black fill-current">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" />
                  <polygon points="50,10 43,45 10,65 44,55 50,90 56,55 90,65 57,45" />
                </svg>
              </div>
              <span className="font-display font-bold text-lg text-white">
                {CAR_BRAND} <span className="text-emerald-400 text-xs font-mono block">AMG Franchise</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {DEALERSHIP_NAME} – Official high-performance hypercar and electric vehicle dealership.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs font-semibold text-white uppercase tracking-widest mb-4">
              Mercedes Fleet
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#fleet" className="hover:text-emerald-400 transition-colors">Mercedes-AMG ONE</a></li>
              <li><a href="#fleet" className="hover:text-emerald-400 transition-colors">Mercedes-AMG GT Black Series</a></li>
              <li><a href="#fleet" className="hover:text-emerald-400 transition-colors">Mercedes-EQS 53 4MATIC+</a></li>
              <li><a href="#fleet" className="hover:text-emerald-400 transition-colors">Mercedes-AMG SL 63 Roadster</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs font-semibold text-white uppercase tracking-widest mb-4">
              Innovations
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Panamericana Grille</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Formula 1 MGU-H E-Turbo</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">56" MBUX Hyperscreen</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Carbon-Ceramic Matrix Brakes</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs font-semibold text-white uppercase tracking-widest mb-4">
              Mercedes Concierge
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Subscribe for private circuit invitations and allocation releases.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex">
              <input
                type="email"
                placeholder="enter email address"
                className="bg-carbon-800 border border-white/10 rounded-l-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 w-full font-mono"
              />
              <button
                type="submit"
                className="bg-emerald-400 hover:bg-emerald-300 text-black font-display font-bold text-xs px-4 rounded-r-lg uppercase transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 font-mono">
          <p>© {new Date().getFullYear()} MERCEDES-BENZ & MERCEDES-AMG FRANCHISE. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-gray-300 cursor-pointer">PRIVACY POLICY</span>
            <span className="hover:text-gray-300 cursor-pointer">TERMS OF SERVICE</span>
            <span className="hover:text-gray-300 cursor-pointer">GLOBAL CONCIERGE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
