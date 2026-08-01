import React from 'react';
import { MERCEDES_FEATURES_GLOBAL } from '../../data/content';
import { Grid, Zap, Monitor, Disc, Cpu, Activity, ShieldAlert } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Grid':
        return <Grid className="w-6 h-6 text-emerald-400" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-emerald-400" />;
      case 'Monitor':
        return <Monitor className="w-6 h-6 text-emerald-400" />;
      case 'Disc':
        return <Disc className="w-6 h-6 text-emerald-400" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-emerald-400" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-emerald-400" />;
      default:
        return <ShieldAlert className="w-6 h-6 text-emerald-400" />;
    }
  };

  return (
    <section id="features" className="relative min-h-screen flex items-center py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="w-full space-y-12">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="inline-block font-mono text-xs font-semibold text-emerald-400 tracking-widest uppercase mb-3">
            // MERCEDES-AMG ENGINEERING INNOVATIONS
          </div>

          <h2 className="font-display font-extrabold text-4xl sm:text-6xl text-white tracking-tight leading-none">
            AFFALTERBACH TECHNOLOGY
          </h2>

          <p className="mt-4 text-base sm:text-lg text-gray-300 font-body leading-relaxed">
            From Formula 1 hybrid motor recovery to 56-inch MBUX Hyperscreen AI cockpits, discover Mercedes-AMG performance engineering.
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MERCEDES_FEATURES_GLOBAL.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-emerald-400/40 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {getIcon(item.iconName)}
              </div>

              <div className="inline-block font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                {item.category}
              </div>

              <h3 className="font-display font-bold text-xl text-white mt-1 group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h3>

              <p className="mt-2 text-xs text-gray-400 font-body leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
