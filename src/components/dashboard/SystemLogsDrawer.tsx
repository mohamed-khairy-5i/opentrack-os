import React from "react";
import { Terminal, ChevronDown, ChevronUp } from "lucide-react";

interface SystemLogsDrawerProps {
  logs: string[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  title?: string;
  lang?: "ar" | "en";
}

export const SystemLogsDrawer: React.FC<SystemLogsDrawerProps> = ({
  logs,
  isExpanded,
  onToggleExpanded,
  title = "System Telemetry",
  lang = "ar",
}) => {
  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`absolute bottom-8 ${lang === "ar" ? "left-6" : "right-6"} z-10 bg-[#12141a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden ${
        isExpanded ? "w-80 p-3.5" : "w-64 p-2.5"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Terminal className="w-3 h-3 text-cyan-400" />
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
            {title}
          </span>
        </div>
        <button
          onClick={onToggleExpanded}
          className="text-gray-400 hover:text-white transition-colors p-1"
          title={isExpanded ? "Minimize Logs" : "Expand Logs"}
        >
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
      </div>

      <div className={`mt-2 space-y-1 font-mono text-[9px] text-gray-400 ${isExpanded ? "max-h-36 overflow-y-auto" : "max-h-8 overflow-hidden"}`}>
        {logs.slice(isExpanded ? -8 : -1).map((log, idx) => (
          <div key={idx} className="flex items-center gap-1.5 truncate">
            <span className="w-1 h-1 rounded-full bg-cyan-400 shrink-0" />
            <span className="truncate">{log}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
