import React from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TripPlaybackBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  progress: number;
  onChangeProgress: (val: number) => void;
  onReset: () => void;
}

export const TripPlaybackBar: React.FC<TripPlaybackBarProps> = ({
  isPlaying,
  onTogglePlay,
  progress,
  onChangeProgress,
  onReset,
}) => {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-[420px] max-w-[90vw] bg-[#12141a]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-3 shadow-2xl shadow-purple-500/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-purple-300 font-bold tracking-wider uppercase flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span>Trip History Replay</span>
        </span>
        <span className="text-[10px] font-mono text-gray-400">
          Scrubber: <span className="text-purple-300 font-bold">{Math.round(progress)}%</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onTogglePlay}
          className="w-7 h-7 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 flex items-center justify-center transition-all shrink-0"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        <button
          onClick={onReset}
          className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all shrink-0"
          title="Reset Scrubber"
        >
          <RotateCcw className="w-3 h-3" />
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => onChangeProgress(Number(e.target.value))}
          className="w-full accent-purple-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};
