"use client";

import { useEffect, useRef, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Smartphone } from "lucide-react";

const MapComponent = dynamic(() => import("@/components/MapComponent").then(mod => mod.MapComponent), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0b0c10] flex items-center justify-center font-mono text-[8px] text-white/20 uppercase tracking-[0.3em]">Loading Engine...</div>
});

export default function Home() {
  const [courierCount, setCourierCount] = useState(3);
  const [status, setStatus] = useState("Operational");
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Standalone Mock default
    if (!db) {
      setCourierCount(3);
      setIsLive(true);
      setStatus("Standalone Engine");
      return;
    }

    // Sync Courier Count if Firebase is configured
    try {
      const countRef = ref(db, "stats/active_couriers");
      const unsubscribeCount = onValue(countRef, (snapshot) => {
        setCourierCount(snapshot.val() || 3);
        setIsLive(true);
        setStatus("Cloud Synced");
      }, (error) => {
        setCourierCount(3);
        setIsLive(true);
        setStatus("Standalone Engine");
      });

      return () => unsubscribeCount();
    } catch {
      setCourierCount(3);
      setIsLive(true);
      setStatus("Standalone Engine");
    }
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0b0c10]">
      {/* Map Layer */}
      <MapComponent />

      {/* Glassmorphism Dashboard UI */}
      <div className="absolute top-6 left-6 z-10 w-80 glass p-6 rounded-2xl shadow-2xl transition-all duration-500 hover:scale-[1.02]">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          OpenTrack OS
        </h1>
        <p className="text-sm text-gray-400 mt-1">Live Delivery Monitor</p>

        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Active Couriers</p>
            <p className="text-2xl font-mono mt-1 text-blue-400">
              {courierCount.toString().padStart(2, '0')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-500 uppercase tracking-wider">System Status</p>
            <div className={`flex items-center mt-2 gap-2 text-sm ${isLive ? 'text-green-400' : 'text-yellow-500'}`}>
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-yellow-500'}`} />
              {status}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
          <Link
            href="/driver"
            target="_blank"
            className="w-full py-2.5 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 group"
          >
            <Smartphone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span>Open Driver App (Phone PWA)</span>
          </Link>

          <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            <span>Region</span>
            <span className="text-gray-300">Cairo, EG</span>
          </div>
        </div>
      </div>
    </main>
  );
}

