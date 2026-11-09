import React from "react";
import { Navigation, Compass, Cpu } from "lucide-react";
import { Driver, TelemetrySourceMode } from "@/types/fleet";

interface RouteInfoCardProps {
  activeDriver: Driver;
  isRoutingEnabled: boolean;
  onToggleRouting: () => void;
  dataSourceMode: TelemetrySourceMode;
  onToggleDataSource: () => void;
  isPlaybackMode: boolean;
  onTogglePlayback: () => void;
}

export const RouteInfoCard: React.FC<RouteInfoCardProps> = ({
  activeDriver,
  isRoutingEnabled,
  onToggleRouting,
  dataSourceMode,
  onToggleDataSource,
  isPlaybackMode,
  onTogglePlayback,
}) => {
  return (
    <div className="absolute bottom-8 left-6 z-10 w-80 bg-[#12141a]/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl space-y-3">
      {/* Target Destination & Current Street */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 flex items-center gap-1">
            <Compass className="w-3 h-3 text-blue-400" />
            <span>Target Destination</span>
          </span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
            style={{ backgroundColor: `${activeDriver.color}20`, color: activeDriver.color }}
          >
            {activeDriver.name.split(" ")[0]}
          </span>
        </div>
        <p className="text-xs font-bold text-gray-200 mt-1 truncate">
          {activeDriver.destination.name}
        </p>
        <p className="text-[10px] text-gray-400 truncate mt-0.5">
          📍 الشارع الحالي: {activeDriver.currentStreet}
        </p>
      </div>

      {/* Metrics Row (Distance, ETA, Speed) */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-center">
          <p className="text-[8px] uppercase tracking-wider text-gray-500">Distance</p>
          <p className="text-xs font-mono font-bold text-blue-400 mt-0.5">
            {activeDriver.routeInfo ? activeDriver.routeInfo.distance.toFixed(1) : "--"}{" "}
            <span className="text-[8px] font-normal text-gray-500">km</span>
          </p>
        </div>

        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-center">
          <p className="text-[8px] uppercase tracking-wider text-gray-500">ETA</p>
          <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
            {activeDriver.routeInfo ? Math.round(activeDriver.routeInfo.duration) : "--"}{" "}
            <span className="text-[8px] font-normal text-gray-500">min</span>
          </p>
        </div>

        <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-center">
          <p className="text-[8px] uppercase tracking-wider text-gray-500">Speed</p>
          <p className="text-xs font-mono font-bold text-purple-400 mt-0.5">
            {activeDriver.speed}{" "}
            <span className="text-[8px] font-normal text-gray-500">km/h</span>
          </p>
        </div>
      </div>

      {/* Control Toggles Bar */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
        <span className="text-[9px] font-mono text-gray-400">Controls</span>

        <div className="flex items-center gap-1.5">
          {/* Replay Scrubber Toggle */}
          <button
            onClick={onTogglePlayback}
            className={`px-2 py-0.5 rounded-full text-[8px] font-mono border transition-all ${
              isPlaybackMode
                ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
            }`}
            title="Toggle Trip History Playback"
          >
            <span>REPLAY</span>
          </button>

          {/* Telemetry Source Toggle */}
          <button
            onClick={onToggleDataSource}
            className="px-2 py-0.5 rounded-full text-[8px] font-mono border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 flex items-center gap-1"
            title="Toggle Data Source: Autonomous SIM vs PWA Live Link"
          >
            {dataSourceMode === "sim" ? (
              <Cpu className="w-2.5 h-2.5 text-cyan-400" />
            ) : (
              <Navigation className="w-2.5 h-2.5 text-emerald-400" />
            )}
            <span>{dataSourceMode.toUpperCase()}</span>
          </button>

          {/* Routing Engine Toggle */}
          <button
            onClick={onToggleRouting}
            className={`px-2 py-0.5 rounded-full text-[8px] font-bold transition-all border ${
              isRoutingEnabled
                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                : "bg-white/5 text-white/40 border-white/10"
            }`}
          >
            {isRoutingEnabled ? "ON" : "OFF"}
          </button>
        </div>
      </div>
    </div>
  );
};
