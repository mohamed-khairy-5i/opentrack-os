import React from "react";
import { Users, Bike, Car } from "lucide-react";
import { Driver } from "@/types/fleet";

interface FleetDrawerProps {
  fleet: Driver[];
  selectedDriverId: string;
  onSelectDriver: (driverId: string) => void;
}

export const FleetDrawer: React.FC<FleetDrawerProps> = ({
  fleet,
  selectedDriverId,
  onSelectDriver,
}) => {
  return (
    <div className="absolute top-20 right-6 z-10 w-80 bg-[#12141a]/85 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 shadow-2xl">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <Users className="w-3 h-3 text-blue-400" />
          <span>Active Couriers ({fleet.length})</span>
        </span>
        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
          ALL LIVE
        </span>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {fleet.map((driver) => {
          const isSelected = driver.id === selectedDriverId;
          return (
            <button
              key={driver.id}
              onClick={() => onSelectDriver(driver.id)}
              className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                isSelected
                  ? "bg-blue-500/15 border-blue-500/40 shadow-lg shadow-blue-500/10"
                  : "bg-white/[0.03] border-white/5 hover:bg-white/[0.07]"
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${driver.color}25`, border: `1px solid ${driver.color}60` }}
                >
                  {driver.vehicleType === "car" ? (
                    <Car className="w-3.5 h-3.5" style={{ color: driver.color }} />
                  ) : (
                    <Bike className="w-3.5 h-3.5" style={{ color: driver.color }} />
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-gray-200 truncate">{driver.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{driver.currentStreet}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono font-bold text-gray-300">
                  {driver.speed} <span className="text-[8px] text-gray-500 font-normal">km/h</span>
                </span>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: driver.color }}
                  />
                  <span className="text-[8px] uppercase tracking-wider text-gray-400">
                    {driver.status}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
