import React from 'react';
import { Radio, Crosshair, Compass, Gauge, ArrowUpRight, Clock } from 'lucide-react';

export default function TelemetryHUD({
  satellites,
  selectedSat,
  onSelectSat,
  autoFollow,
  setAutoFollow,
  dataSource,
  utcTime,
}) {
  return (
    <>
      {/* Top Bar: Mission Title & Live Feed Status */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-4 pointer-events-none z-10">
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 px-4 py-3 rounded-xl pointer-events-auto flex items-center gap-3 shadow-2xl">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider uppercase text-slate-100">
              OrbitPulse // Telemetry Console
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              FEED: {dataSource} • UTC {utcTime}
            </p>
          </div>
        </div>

        {/* Camera Lock Toggle */}
        <button
          onClick={() => setAutoFollow(!autoFollow)}
          className={`pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono uppercase tracking-wider transition shadow-xl backdrop-blur-md ${
            autoFollow
              ? 'bg-sky-500/20 border-sky-400 text-sky-300'
              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          {autoFollow ? 'Target Lock: ON' : 'Target Lock: OFF'}
        </button>
      </div>

      {/* Left Sidebar: Tracked Objects Selector */}
      <div className="absolute top-24 left-4 w-64 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl p-3 z-10 shadow-2xl max-h-[60vh] overflow-y-auto">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-400 px-2 pb-2 border-b border-slate-800/80">
          <Radio className="w-3.5 h-3.5 text-sky-400" />
          <span>Active Objects ({satellites.length})</span>
        </div>
        <div className="mt-2 space-y-1">
          {satellites.map((sat) => {
            const isSelected = sat.name === selectedSat?.name;
            return (
              <button
                key={sat.name}
                onClick={() => onSelectSat(sat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-sky-500/20 border border-sky-500/40 text-sky-300 font-semibold'
                    : 'hover:bg-slate-900 text-slate-300'
                }`}
              >
                <span className="truncate">{sat.name}</span>
                <span className="text-[10px] text-slate-500">
                  {Math.round(sat.alt)}km
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Telemetry Panel for Selected Satellite */}
      {selectedSat && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:w-[540px] bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-4 z-10 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400">
                Selected Space Object
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {selectedSat.name}
              </h2>
            </div>
            <div className="text-right font-mono text-xs text-slate-400">
              <div>INC: {selectedSat.inclination}°</div>
              <div>PERIOD: {selectedSat.periodMinutes} min</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="bg-slate-900/90 border border-slate-800/80 p-2.5 rounded-lg">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                Altitude
              </div>
              <div className="text-sm font-bold text-slate-100 mt-1">
                {selectedSat.alt.toFixed(1)} <span className="text-xs font-normal text-slate-400">km</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 p-2.5 rounded-lg">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase">
                <Gauge className="w-3.5 h-3.5 text-sky-400" />
                Velocity
              </div>
              <div className="text-sm font-bold text-slate-100 mt-1">
                {selectedSat.speed.toFixed(2)} <span className="text-xs font-normal text-slate-400">km/s</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 p-2.5 rounded-lg">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                Latitude
              </div>
              <div className="text-sm font-bold text-slate-100 mt-1">
                {selectedSat.lat.toFixed(3)}°
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 p-2.5 rounded-lg">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Longitude
              </div>
              <div className="text-sm font-bold text-slate-100 mt-1">
                {selectedSat.lng.toFixed(3)}°
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}