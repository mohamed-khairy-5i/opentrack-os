"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, Wifi, WifiOff, MapPin, Gauge, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { RoutingService } from "@/services/RoutingService";

export default function DriverApp() {
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [streetName, setStreetName] = useState<string>("Standby");
  const [packetsSent, setPacketsSent] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const watchId = useRef<number | null>(null);
  const broadcastChannel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    try {
      broadcastChannel.current = new BroadcastChannel("opentrack_telemetry");
    } catch (e) {
      console.warn("BroadcastChannel not supported in this browser");
    }

    return () => {
      broadcastChannel.current?.close();
    };
  }, []);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setErrorMsg("GPS is not supported by your browser");
      return;
    }

    setErrorMsg(null);
    setIsOnline(true);

    watchId.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy: acc, speed: spd } = pos.coords;
        const currentPos: [number, number] = [latitude, longitude];

        setLocation({ lat: latitude, lng: longitude });
        setAccuracy(acc ? Math.round(acc) : 5);
        setSpeed(spd ? Math.round(spd * 3.6) : 0); // Convert m/s to km/h

        // Snap to road and get street name
        try {
          const snap = await RoutingService.snapToRoad(currentPos);
          setStreetName(snap.streetName);
        } catch {
          setStreetName("Urban Road");
        }

        // 1. Broadcast locally (for cross-tab / PWA real-time streaming)
        broadcastChannel.current?.postMessage({
          lat: latitude,
          lng: longitude,
          speed: spd,
          accuracy: acc,
          timestamp: new Date().toISOString(),
        });

        setPacketsSent((prev) => prev + 1);
      },
      (err) => {
        console.warn("[GPS Error]", err.message);
        setErrorMsg(`GPS Alert: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );
  };

  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsOnline(false);
  };

  return (
    <main className="min-h-screen bg-[#07080c] text-white flex flex-col justify-between p-6 max-w-md mx-auto relative overflow-hidden font-sans">
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between pb-6 border-b border-white/5">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-mono text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-pulse" : "bg-white/20"
            }`}
          />
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">
            {isOnline ? "LIVE TRANSMITTING" : "STANDBY"}
          </span>
        </div>
      </header>

      {/* Center Section: Main Driver Card & Action Button */}
      <div className="relative z-10 my-auto py-8 flex flex-col items-center text-center">
        {/* Title */}
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          OpenTrack Driver
        </h1>
        <p className="text-xs text-white/40 mt-1 font-mono">Zero-Cost Mobile Telemetry Beacon</p>

        {/* Big Start / End Shift Button */}
        <div className="my-8 relative flex items-center justify-center">
          {isOnline && (
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"
            />
          )}

          <button
            onClick={isOnline ? stopTracking : startTracking}
            className={`relative z-10 w-44 h-44 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-500 shadow-2xl active:scale-95 ${
              isOnline
                ? "bg-gradient-to-b from-red-500/20 to-red-600/30 border-red-500/50 text-red-400 hover:border-red-400"
                : "bg-gradient-to-b from-blue-500/20 to-cyan-600/30 border-blue-500/50 text-blue-400 hover:border-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
            }`}
          >
            <Navigation className={`w-10 h-10 mb-2 ${isOnline ? "animate-pulse" : ""}`} />
            <span className="font-bold text-sm tracking-wider uppercase">
              {isOnline ? "END SHIFT" : "GO ONLINE"}
            </span>
            <span className="text-[9px] font-mono text-white/40 mt-1">
              {isOnline ? "Tap to Stop" : "Tap to Transmit"}
            </span>
          </button>
        </div>

        {errorMsg && (
          <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono mb-4">
            {errorMsg}
          </div>
        )}

        {/* Live Current Road Banner */}
        <div className="w-full glass p-4 rounded-2xl border border-white/10 shadow-xl bg-black/40 backdrop-blur-xl">
          <p className="text-[9px] font-mono uppercase tracking-widest text-white/40">Current Road Match</p>
          <p className="text-base font-bold text-white mt-1 truncate">{streetName}</p>
        </div>
      </div>

      {/* Bottom Telemetry Grid */}
      <footer className="relative z-10 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {/* Speed */}
          <div className="glass p-3 rounded-xl border border-white/5 bg-white/5 text-center">
            <Gauge className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
            <p className="text-[8px] font-mono text-white/40 uppercase">Speed</p>
            <p className="text-sm font-bold font-mono text-white mt-0.5">
              {speed !== null ? speed : "--"} <span className="text-[9px] text-white/40">km/h</span>
            </p>
          </div>

          {/* GPS Accuracy */}
          <div className="glass p-3 rounded-xl border border-white/5 bg-white/5 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-green-400 mx-auto mb-1" />
            <p className="text-[8px] font-mono text-white/40 uppercase">Accuracy</p>
            <p className="text-sm font-bold font-mono text-white mt-0.5">
              {accuracy !== null ? `±${accuracy}m` : "--"}
            </p>
          </div>

          {/* Packets */}
          <div className="glass p-3 rounded-xl border border-white/5 bg-white/5 text-center">
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 mx-auto mb-1 ${isOnline ? "animate-spin" : ""}`} />
            <p className="text-[8px] font-mono text-white/40 uppercase">Signals</p>
            <p className="text-sm font-bold font-mono text-white mt-0.5">{packetsSent}</p>
          </div>
        </div>

        {/* Coordinates Footer */}
        <div className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-[9px] font-mono text-white/40">
          <span>GPS COORDINATES</span>
          <span className="text-white/70">
            {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Awaiting Satellite Lock"}
          </span>
        </div>
      </footer>
    </main>
  );
}
