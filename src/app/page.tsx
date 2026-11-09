"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Smartphone, Star, Globe } from "lucide-react";
import { OpenTrackLogo } from "@/components/icons/OpenTrackLogo";
import { Language, getDictionary } from "@/lib/i18n";

const OpenTrackMap = dynamic(() => import("@/components/map/OpenTrackMap").then(mod => mod.OpenTrackMap), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0b0c10] flex items-center justify-center font-mono text-[8px] text-white/20 uppercase tracking-[0.3em]">Loading Engine...</div>
});

export default function Home() {
  const [lang, setLang] = useState<Language>("ar");
  const dict = getDictionary(lang);
  const [courierCount, setCourierCount] = useState(3);
  const [status, setStatus] = useState("Operational");
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Listen to local PWA Driver Broadcasts
    try {
      const channel = new BroadcastChannel("opentrack_driver_channel");
      channel.onmessage = () => {
        setStatus("PWA Linked");
        setIsLive(true);
      };
      return () => channel.close();
    } catch {
      setStatus("Autonomous Engine");
    }
  }, []);

  const toggleLanguage = () => {
    setLang((prev) => (prev === "ar" ? "en" : "ar"));
  };

  return (
    <main dir={lang === "ar" ? "rtl" : "ltr"} className="relative w-full h-screen overflow-hidden bg-[#0b0c10]">
      {/* Map Layer */}
      <OpenTrackMap language={lang} onLanguageChange={setLang} />

      {/* Glassmorphism Dashboard UI */}
      <div className={`absolute top-6 ${lang === "ar" ? "right-6" : "left-6"} z-10 w-80 glass p-6 rounded-2xl shadow-2xl transition-all duration-500 hover:scale-[1.02]`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OpenTrackLogo size={36} glow={true} />
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                {dict.appTitle}
              </h1>
              <p className="text-[11px] font-mono text-gray-400">{dict.appSubtitle}</p>
            </div>
          </div>

          <button
            onClick={toggleLanguage}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1"
            title="Toggle Language: Arabic / English"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px]">{lang === "ar" ? "EN" : "عربي"}</span>
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{dict.activeCouriers}</p>
            <p className="text-2xl font-mono mt-1 text-blue-400">
              {courierCount.toString().padStart(2, '0')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{dict.systemStatus}</p>
            <div className={`flex items-center mt-2 gap-2 text-sm ${isLive ? 'text-green-400' : 'text-yellow-500'}`}>
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-yellow-500'}`} />
              {status === "PWA Linked" ? dict.pwaLinked : status === "Autonomous Engine" ? dict.autonomousEngine : dict.operational}
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
            <span>{dict.openDriverApp}</span>
          </Link>

          <a
            href="https://github.com/mohamed-khairy-5i/opentrack-os"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 group"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400/20 group-hover:scale-110 transition-transform" />
            <span>{dict.starOnGithub}</span>
          </a>

          <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest font-bold pt-1">
            <span>{dict.region}</span>
            <span className="text-gray-300">{dict.cairoEg}</span>
          </div>
        </div>
      </div>
    </main>
  );
}

