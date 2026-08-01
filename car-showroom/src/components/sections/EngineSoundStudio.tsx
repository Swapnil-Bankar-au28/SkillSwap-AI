import React, { useState, useEffect, useRef } from 'react';
import { MERCEDES_FLEET } from '../../data/content';
import { Play, Square, Radio } from 'lucide-react';

export const EngineSoundStudioSection: React.FC = () => {
  const [activeCarId, setActiveCarId] = useState<string>('amg-one');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [rpm, setRpm] = useState<number>(3000);

  const selectedCar = MERCEDES_FLEET.find(c => c.id === activeCarId) || MERCEDES_FLEET[0];

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startEngineSound = () => {
    if (isPlaying) {
      stopEngineSound();
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = selectedCar.soundFrequency * (rpm / 3000);
      osc.type = selectedCar.soundType === 'f1-v6' ? 'sawtooth' : selectedCar.soundType === 'electric-thrust' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
      setIsPlaying(true);
    } catch (e) {
      console.log('Audio Context Error', e);
    }
  };

  const stopEngineSound = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {}
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    if (isPlaying && oscRef.current && audioCtxRef.current) {
      const freq = selectedCar.soundFrequency * (rpm / 3000);
      oscRef.current.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
    }
  }, [rpm, selectedCar, isPlaying]);

  useEffect(() => {
    return () => {
      stopEngineSound();
    };
  }, []);

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 36;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const height = isPlaying
          ? Math.abs(Math.sin((frame + i) * 0.15) * (canvas.height * (rpm / 11000))) + 10
          : 4;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(0.5, '#06b6d4');
        gradient.addColorStop(1, '#ec4899');

        ctx.fillStyle = isPlaying ? gradient : '#334155';
        ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 3, height);
      }

      frame++;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, rpm]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Acoustic Telemetry Simulator</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              VIRTUAL <span className="text-cyan-400">ENGINE SOUND</span> STUDIO
            </h2>

            <p className="text-neutral-400 text-sm">
              Experience the distinctive acoustics of AMG Formula 1 V6 Turbo engines, high-revving flat-plane V8s, and silent high-voltage electric thrust.
            </p>

            {/* Model Selector Pills */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {MERCEDES_FLEET.slice(0, 4).map((car) => (
                <button
                  key={car.id}
                  onClick={() => {
                    setActiveCarId(car.id);
                    if (isPlaying) stopEngineSound();
                  }}
                  className={`p-3 rounded-xl border text-xs text-left transition ${
                    activeCarId === car.id
                      ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="truncate font-semibold">{car.name}</div>
                  <div className="text-[10px] text-neutral-500 uppercase">{car.soundType}</div>
                </button>
              ))}
            </div>

            {/* Play Sound Button */}
            <button
              onClick={startEngineSound}
              className={`w-full py-4 px-6 rounded-2xl font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-3 transition shadow-lg ${
                isPlaying
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-black'
              }`}
            >
              {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              <span>{isPlaying ? 'Mute Audio Simulation' : `Ignite ${selectedCar.name} Engine`}</span>
            </button>
          </div>

          {/* Right Visualizer & Tachometer */}
          <div className="lg:col-span-7 bg-neutral-950 rounded-2xl border border-neutral-800 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-neutral-500 uppercase">Selected Acoustic Profile</span>
                <h3 className="text-lg font-bold text-white">{selectedCar.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-emerald-400 uppercase">Live Engine RPM</span>
                <div className="text-2xl font-mono font-extrabold text-white">{rpm} <span className="text-xs text-neutral-400">RPM</span></div>
              </div>
            </div>

            {/* Canvas Visualizer */}
            <div className="h-32 bg-neutral-900/60 rounded-xl border border-neutral-800/80 p-2 relative overflow-hidden">
              <canvas ref={canvasRef} width={600} height={120} className="w-full h-full" />
            </div>

            {/* Throttle RPM Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono text-neutral-400 mb-2">
                <span>Idle (1,000 RPM)</span>
                <span>Mid-Range (6,000 RPM)</span>
                <span>Redline (11,000 RPM)</span>
              </div>
              <input
                type="range"
                min="1000"
                max="11000"
                step="100"
                value={rpm}
                onChange={(e) => setRpm(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
