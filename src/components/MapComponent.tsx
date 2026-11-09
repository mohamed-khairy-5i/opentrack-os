import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { RoutingService, RouteResponse } from "@/services/RoutingService";
import { SearchService, PlaceResult } from "@/services/SearchService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  X,
  Navigation,
  Cpu,
  Cloud,
  Compass,
  Terminal,
  ChevronDown,
  ChevronUp,
  Users,
  Bike,
  Car,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

export interface Driver {
  id: string;
  name: string;
  vehicleType: "bike" | "car" | "scooter";
  color: string;
  coords: { lat: number; lng: number };
  currentStreet: string;
  destination: { lat: number; lng: number; name: string };
  status: "delivering" | "en_route" | "idle";
  speed: number;
  routeInfo?: RouteResponse | null;
}

const INITIAL_FLEET: Driver[] = [
  {
    id: "driver_1",
    name: "كابتن أحمد (دراجة سريعة)",
    vehicleType: "bike",
    color: "#3b82f6", // Neon Blue
    coords: { lat: 30.0444, lng: 31.2357 }, // Tahrir Square
    currentStreet: "ميدان التحرير",
    destination: { lat: 30.0131, lng: 31.2089, name: "جامعة القاهرة (Giza)" },
    status: "delivering",
    speed: 38,
  },
  {
    id: "driver_2",
    name: "كابتن محمود (فان توصيل)",
    vehicleType: "car",
    color: "#10b981", // Emerald Green
    coords: { lat: 30.0626, lng: 31.3285 }, // Nasr City
    currentStreet: "طريق النصر",
    destination: { lat: 30.0911, lng: 31.3235, name: "ميدان الكوربة (Heliopolis)" },
    status: "en_route",
    speed: 45,
  },
  {
    id: "driver_3",
    name: "كابتن يوسف (سكوتر شحن)",
    vehicleType: "scooter",
    color: "#f59e0b", // Amber Gold
    coords: { lat: 30.0571, lng: 31.2173 }, // Zamalek
    currentStreet: "شارع 26 يوليو",
    destination: { lat: 30.0512, lng: 31.1986, name: "ميدان سفنكس (Mohandessin)" },
    status: "delivering",
    speed: 32,
  },
];

export const MapComponent = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const driverMarkers = useRef<{ [key: string]: L.CircleMarker }>({});
  const destMarkers = useRef<{ [key: string]: L.CircleMarker }>({});
  const routeLayer = useRef<L.LayerGroup | null>(null);

  // Fleet & Selection State
  const [fleet, setFleet] = useState<Driver[]>(INITIAL_FLEET);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("driver_1");
  const [isFleetListOpen, setIsFleetListOpen] = useState<boolean>(true);

  // Search Engine State (Nominatim)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Routing & Mode Configuration
  const [isRoutingEnabled, setIsRoutingEnabled] = useState<boolean>(true);
  const [dataSourceMode, setDataSourceMode] = useState<"mock" | "firebase">("mock");
  const [isLogsExpanded, setIsLogsExpanded] = useState<boolean>(false);

  // Playback & History Simulation State
  const [isPlaybackMode, setIsPlaybackMode] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(100); // 0% to 100%
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [isLoaded, setIsLoaded] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>(["[Live] OpenTrack Fleet Engine Online"]);

  const addLog = (msg: string) => {
    setDebugLog((prev) => [...prev.slice(-4), msg]);
    console.log(`[OpenTrack] ${msg}`);
  };

  const activeDriver = fleet.find((d) => d.id === selectedDriverId) || fleet[0];

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || map.current || !mapContainer.current) return;

    try {
      addLog("Initializing Multi-Fleet Canvas...");

      map.current = L.map(mapContainer.current, {
        center: [activeDriver.coords.lat, activeDriver.coords.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        className: "map-tiles-dark",
      }).addTo(map.current);

      setIsLoaded(true);
      addLog("Multi-Courier Network Ready");

      // Initialize all driver markers & destination markers
      fleet.forEach((driver) => {
        // Driver Pulse Marker
        const m = L.circleMarker([driver.coords.lat, driver.coords.lng], {
          radius: 9,
          fillColor: driver.color,
          color: "#fff",
          weight: 2.5,
          opacity: 1,
          fillOpacity: 1,
          className: "marker-pulse",
        }).addTo(map.current!);

        m.on("click", () => {
          setSelectedDriverId(driver.id);
          addLog(`Focused: ${driver.name}`);
        });

        driverMarkers.current[driver.id] = m;

        // Destination Marker
        const dm = L.circleMarker([driver.destination.lat, driver.destination.lng], {
          radius: 6,
          fillColor: "#ef4444",
          color: "#fff",
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.8,
        }).addTo(map.current!);

        destMarkers.current[driver.id] = dm;
      });

      return () => {
        map.current?.remove();
        map.current = null;
      };
    } catch (err: any) {
      addLog(`Engine Error: ${err?.message}`);
      setIsLoaded(true);
    }
  }, []);

  // 2. Calculate / Re-Calculate Street Path for Active Driver
  const calculateDriverRoute = async (driver: Driver) => {
    if (!isRoutingEnabled) return;

    try {
      const snapResult = await RoutingService.snapToRoad([driver.coords.lat, driver.coords.lng]);
      const route = await RoutingService.fetchRoute(snapResult.coord, [
        driver.destination.lat,
        driver.destination.lng,
      ]);
      route.destinationName = driver.destination.name;

      setFleet((prev) =>
        prev.map((d) =>
          d.id === driver.id
            ? { ...d, currentStreet: snapResult.streetName, routeInfo: route }
            : d
        )
      );

      addLog(`Route (${driver.name.split(" ")[1]}): ${route.distance.toFixed(1)}km | ${snapResult.streetName}`);
    } catch (err) {
      console.warn("Route calc note:", err);
    }
  };

  // Re-calculate route when active driver changes or destination changes
  useEffect(() => {
    if (activeDriver) {
      calculateDriverRoute(activeDriver);
    }
  }, [selectedDriverId, activeDriver.destination.lat, activeDriver.destination.lng, isRoutingEnabled]);

  // 3. Autonomous Fleet Movement Simulation (Zero-Config Standalone Mode)
  useEffect(() => {
    if (dataSourceMode !== "mock" || isPlaybackMode) return;

    const interval = setInterval(async () => {
      setFleet((prevFleet) => {
        return prevFleet.map((driver) => {
          // Smooth step towards individual destination
          const dLat = (driver.destination.lat - driver.coords.lat) * 0.04 + (Math.random() - 0.5) * 0.0003;
          const dLng = (driver.destination.lng - driver.coords.lng) * 0.04 + (Math.random() - 0.5) * 0.0003;

          const nextLat = driver.coords.lat + dLat;
          const nextLng = driver.coords.lng + dLng;

          // Asynchronously update street name
          RoutingService.snapToRoad([nextLat, nextLng]).then((snap) => {
            setFleet((current) =>
              current.map((d) => (d.id === driver.id ? { ...d, currentStreet: snap.streetName } : d))
            );
          });

          return {
            ...driver,
            coords: { lat: nextLat, lng: nextLng },
            speed: Math.floor(25 + Math.random() * 25),
          };
        });
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [dataSourceMode, isPlaybackMode]);

  // 4. Update Leaflet Markers & Active Route Rendering
  useEffect(() => {
    if (!map.current) return;

    // Update all driver positions on map
    fleet.forEach((driver) => {
      const m = driverMarkers.current[driver.id];
      if (m) {
        m.setLatLng([driver.coords.lat, driver.coords.lng]);
        // Highlight active driver marker with larger radius & bright border
        if (driver.id === selectedDriverId) {
          m.setRadius(10);
          m.setStyle({ weight: 3.5, color: "#ffffff" });
        } else {
          m.setRadius(7);
          m.setStyle({ weight: 1.5, color: "#ffffff80" });
        }
      }

      const dm = destMarkers.current[driver.id];
      if (dm) {
        dm.setLatLng([driver.destination.lat, driver.destination.lng]);
        // Only show active driver destination prominently
        dm.setStyle({ opacity: driver.id === selectedDriverId ? 1 : 0.35 });
      }
    });

    // Render active driver path
    if (isRoutingEnabled && activeDriver.routeInfo && activeDriver.routeInfo.geometry) {
      if (routeLayer.current) map.current.removeLayer(routeLayer.current);

      const mainPath = L.geoJSON(activeDriver.routeInfo.geometry, {
        style: {
          color: activeDriver.color,
          weight: 5,
          opacity: 0.85,
          lineCap: "round",
          lineJoin: "round",
        },
      });

      const glowPath = L.geoJSON(activeDriver.routeInfo.geometry, {
        style: {
          color: activeDriver.color,
          weight: 13,
          opacity: 0.25,
          lineCap: "round",
        },
      });

      routeLayer.current = L.layerGroup([glowPath, mainPath]).addTo(map.current);
    } else {
      if (routeLayer.current && map.current) {
        map.current.removeLayer(routeLayer.current);
        routeLayer.current = null;
      }
    }
  }, [fleet, selectedDriverId, isRoutingEnabled]);

  // 5. Places Search Handler (Nominatim)
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await SearchService.searchPlaces(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setShowDropdown(results.length > 0);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectDestination = (place: PlaceResult) => {
    setFleet((prev) =>
      prev.map((d) =>
        d.id === selectedDriverId
          ? {
              ...d,
              destination: { lat: place.lat, lng: place.lng, name: place.name },
            }
          : d
      )
    );

    setSearchQuery(place.name);
    setShowDropdown(false);

    if (map.current) {
      const bounds = L.latLngBounds([
        [activeDriver.coords.lat, activeDriver.coords.lng],
        [place.lat, place.lng],
      ]);
      map.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }

    addLog(`Destination for ${activeDriver.name.split(" ")[1]}: ${place.name}`);
  };

  // 6. Playback Simulator Timer
  useEffect(() => {
    if (!isPlaybackMode || !isPlaying) return;

    const interval = setInterval(() => {
      setPlaybackProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return prev + 2;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isPlaybackMode, isPlaying]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <div ref={mapContainer} className="w-full h-full absolute inset-0 z-0 bg-[#050505]" />

      {/* =========================================================================
          Top Interactive Places Search Bar (Free Nominatim Geocoding)
      ========================================================================= */}
      <div className="absolute top-6 right-6 z-[100] w-80 md:w-96">
        <div className="relative">
          <div className="relative flex items-center glass rounded-2xl border border-white/10 shadow-2xl bg-black/60 backdrop-blur-xl overflow-hidden focus-within:border-blue-500/50 transition-all duration-300">
            <div className="pl-4 text-white/40">
              <Search className={`w-4 h-4 ${isSearching ? "animate-spin text-blue-400" : ""}`} />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`بحث عن وجهة لـ (${activeDriver.name.split(" ")[1]})...`}
              className="w-full bg-transparent px-3 py-3.5 text-xs text-white placeholder-white/40 focus:outline-none font-medium"
            />

            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowDropdown(false);
                }}
                className="pr-4 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          <AnimatePresence>
            {showDropdown && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl border border-white/10 shadow-2xl bg-black/80 backdrop-blur-2xl overflow-hidden z-[110]"
              >
                <div className="p-2 divide-y divide-white/5">
                  {searchResults.map((place) => (
                    <button
                      key={place.placeId}
                      onClick={() => selectDestination(place)}
                      className="w-full p-2.5 flex items-start gap-3 rounded-xl hover:bg-white/10 text-right transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-xs font-semibold text-white/90 truncate">{place.name}</p>
                        <p className="text-[10px] text-white/40 truncate mt-0.5">{place.displayName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* =========================================================================
          Multi-Driver Fleet Selector Panel (Top Right below Search)
      ========================================================================= */}
      <div className="absolute top-24 right-6 z-[95] w-80 md:w-96">
        <div className="glass rounded-2xl border border-white/10 shadow-2xl bg-black/50 backdrop-blur-xl p-3">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[11px] font-bold text-white/80">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Fleet Couriers ({fleet.length})</span>
            </div>
            <button
              onClick={() => setIsFleetListOpen(!isFleetListOpen)}
              className="text-[9px] font-mono text-white/40 hover:text-white"
            >
              {isFleetListOpen ? "Collapse ▴" : "Expand ▾"}
            </button>
          </div>

          {isFleetListOpen && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {fleet.map((driver) => {
                const isSelected = driver.id === selectedDriverId;
                return (
                  <button
                    key={driver.id}
                    onClick={() => {
                      setSelectedDriverId(driver.id);
                      if (map.current) {
                        map.current.panTo([driver.coords.lat, driver.coords.lng], { animate: true });
                      }
                      addLog(`Focused: ${driver.name}`);
                    }}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all duration-300 text-left ${
                      isSelected
                        ? "bg-white/10 border-white/20 shadow-lg"
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: driver.color,
                          boxShadow: `0 0 8px ${driver.color}`,
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white/90 truncate">{driver.name}</p>
                        <p className="text-[9px] text-white/40 truncate">{driver.currentStreet}</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 pl-2">
                      <span className="text-[10px] font-mono font-bold text-blue-400">{driver.speed} km/h</span>
                      <p className="text-[8px] text-white/30 uppercase tracking-wider">{driver.status}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          Route Navigation Card (Glassmorphism & Live Status)
      ========================================================================= */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          className="absolute bottom-8 left-6 z-[100] w-84 glass p-5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-black/50"
        >
          {/* Card Header & Controls */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse"
                style={{
                  backgroundColor: activeDriver.color,
                  boxShadow: `0 0 8px ${activeDriver.color}`,
                }}
              />
              <span className="text-[11px] font-bold text-white/90 truncate">
                {activeDriver.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Playback Mode Button */}
              <button
                onClick={() => {
                  const nextPlayback = !isPlaybackMode;
                  setIsPlaybackMode(nextPlayback);
                  if (nextPlayback) setIsPlaying(true);
                  addLog(`Trip Playback: ${nextPlayback ? "Started" : "Stopped"}`);
                }}
                className={`px-2 py-0.5 rounded-full text-[8px] font-mono border transition-all ${
                  isPlaybackMode
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                    : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                }`}
                title="Toggle Trip History Playback"
              >
                <span>REPLAY</span>
              </button>

              {/* Mode Toggle */}
              <button
                onClick={() => {
                  const nextMode = dataSourceMode === "mock" ? "firebase" : "mock";
                  setDataSourceMode(nextMode);
                  addLog(`Data Provider: ${nextMode.toUpperCase()}`);
                }}
                className="px-2 py-0.5 rounded-full text-[8px] font-mono border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 flex items-center gap-1"
                title="Toggle Data Source: Mock Simulator vs Firebase"
              >
                {dataSourceMode === "mock" ? <Cpu className="w-2.5 h-2.5 text-cyan-400" /> : <Cloud className="w-2.5 h-2.5 text-blue-400" />}
                <span>{dataSourceMode.toUpperCase()}</span>
              </button>

              {/* Engine Toggle */}
              <button
                onClick={() => {
                  const nextState = !isRoutingEnabled;
                  setIsRoutingEnabled(nextState);
                  addLog(`Routing Plugin: ${nextState ? "Activated" : "Suspended"}`);
                }}
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

          {/* Current Street Section */}
          <div className="mb-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <div className="min-w-0 flex-1">
              <p className="text-[8px] text-white/40 uppercase tracking-widest font-mono">Current Street</p>
              <p className="text-xs font-semibold text-white/90 truncate">{activeDriver.currentStreet}</p>
            </div>
          </div>

          {/* History Playback Scrubber (When in Replay Mode) */}
          {isPlaybackMode ? (
            <div className="p-3 mb-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between text-[9px] font-mono text-purple-300">
                <span>TRIP REPLAY</span>
                <span>{playbackProgress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={playbackProgress}
                onChange={(e) => setPlaybackProgress(Number(e.target.value))}
                className="w-full accent-purple-400 h-1 bg-white/10 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[9px] font-bold flex items-center gap-1"
                >
                  {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                  <span>{isPlaying ? "PAUSE" : "PLAY"}</span>
                </button>
                <button
                  onClick={() => {
                    setPlaybackProgress(0);
                    setIsPlaying(true);
                  }}
                  className="text-[9px] text-white/40 hover:text-white flex items-center gap-1 font-mono"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Restart</span>
                </button>
              </div>
            </div>
          ) : isRoutingEnabled && activeDriver.routeInfo ? (
            <>
              {/* Distance & ETA Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[8px] text-white/40 uppercase tracking-wider font-mono">Distance to Target</p>
                  <p className="text-lg font-mono font-bold text-blue-400 mt-0.5">
                    {activeDriver.routeInfo.distance.toFixed(2)}{" "}
                    <span className="text-[10px] text-white/40 font-normal">km</span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[8px] text-white/40 uppercase tracking-wider font-mono">Estimated Time (ETA)</p>
                  <p className="text-lg font-mono font-bold text-green-400 mt-0.5">
                    {Math.ceil(activeDriver.routeInfo.duration)}{" "}
                    <span className="text-[10px] text-white/40 font-normal">min</span>
                  </p>
                </div>
              </div>

              {/* Destination Status */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-white/50">
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  <span className="truncate text-white/70">Target: {activeDriver.destination.name}</span>
                </div>
                <span className="text-blue-400/80 font-mono text-[8px] flex-shrink-0">OSRM Free</span>
              </div>
            </>
          ) : (
            <div className="py-2 text-center text-[10px] text-white/30 font-mono">
              {isRoutingEnabled ? "Calculating Street Route..." : "Routing paused. Raw GPS Tracking active."}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* =========================================================================
          System Event Feed (Bottom Right - Collapsible & Non-blocking)
      ========================================================================= */}
      <div className="absolute bottom-8 right-6 z-[100] font-mono text-[9px]">
        {/* Collapsible Header Button */}
        <button
          onClick={() => setIsLogsExpanded(!isLogsExpanded)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white shadow-2xl hover:border-white/20 transition-all duration-300 ml-auto"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <Terminal className="w-3 h-3 text-blue-400" />
          <span className="uppercase tracking-[0.15em] font-bold text-[8px] text-white/60">
            System Logs ({debugLog.length})
          </span>
          {isLogsExpanded ? (
            <ChevronDown className="w-3 h-3 text-white/40" />
          ) : (
            <ChevronUp className="w-3 h-3 text-white/40" />
          )}
        </button>

        {/* Expandable Logs Drawer */}
        <AnimatePresence>
          {isLogsExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="mt-2 p-3 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-xl text-blue-400 min-w-[260px] max-w-[320px] shadow-2xl space-y-1.5"
            >
              {debugLog.map((log, i) => (
                <div key={i} className="flex gap-2 opacity-85 text-[8.5px]">
                  <span className="text-white/20">#</span>
                  <span className="truncate">{log}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b0c10] z-[99]">
          <div className="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin mb-4" />
          <div className="text-white/30 font-mono text-[8px] tracking-[0.3em] uppercase">
            Establishing Secure Link
          </div>
        </div>
      )}

      <style jsx global>{`
        .marker-pulse {
          animation: marker-glow-pulse 2s infinite;
        }
        @keyframes marker-glow-pulse {
          0% {
            filter: drop-shadow(0 0 2px currentColor);
          }
          50% {
            filter: drop-shadow(0 0 12px currentColor);
          }
          100% {
            filter: drop-shadow(0 0 2px currentColor);
          }
        }
        .map-tiles-dark {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
      `}</style>
    </div>
  );
};
