import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RoutingService, RouteResponse } from "@/lib/routing";
import { SearchService, PlaceResult } from "@/lib/search";
import { Driver, TelemetrySourceMode } from "@/types/fleet";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { FleetDrawer } from "@/components/dashboard/FleetDrawer";
import { RouteInfoCard } from "@/components/dashboard/RouteInfoCard";
import { SystemLogsDrawer } from "@/components/dashboard/SystemLogsDrawer";
import { TripPlaybackBar } from "@/components/dashboard/TripPlaybackBar";

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

export const OpenTrackMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const driverMarkers = useRef<{ [key: string]: L.CircleMarker }>({});
  const destMarkers = useRef<{ [key: string]: L.CircleMarker }>({});
  const geofenceCircles = useRef<{ [key: string]: L.Circle }>({});
  const routeLayer = useRef<L.LayerGroup | null>(null);

  // Fleet & Selection State
  const [fleet, setFleet] = useState<Driver[]>(INITIAL_FLEET);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("driver_1");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Routing & Mode Configuration
  const [isRoutingEnabled, setIsRoutingEnabled] = useState<boolean>(true);
  const [dataSourceMode, setDataSourceMode] = useState<TelemetrySourceMode>("sim");
  const [isLogsExpanded, setIsLogsExpanded] = useState<boolean>(false);

  // Playback & History Simulation State
  const [isPlaybackMode, setIsPlaybackMode] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(100);
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

      // Create Markers for each driver
      fleet.forEach((driver) => {
        if (!map.current) return;

        // Courier Location Marker
        const dMarker = L.circleMarker([driver.coords.lat, driver.coords.lng], {
          radius: driver.id === selectedDriverId ? 9 : 7,
          fillColor: driver.color,
          fillOpacity: 1,
          color: "#ffffff",
          weight: driver.id === selectedDriverId ? 3 : 1.5,
        })
          .addTo(map.current)
          .bindPopup(`<b>${driver.name}</b><br>${driver.currentStreet}`);

        driverMarkers.current[driver.id] = dMarker;

        // Destination Marker
        const destMarker = L.circleMarker([driver.destination.lat, driver.destination.lng], {
          radius: 5,
          fillColor: driver.color,
          fillOpacity: 0.6,
          color: "#ffffff",
          weight: 1,
        })
          .addTo(map.current)
          .bindPopup(`<b>الوجهة:</b> ${driver.destination.name}`);

        destMarkers.current[driver.id] = destMarker;

        // Geofencing Arrival Perimeter Circle (350m radius)
        const geofence = L.circle([driver.destination.lat, driver.destination.lng], {
          radius: 350,
          color: driver.color,
          fillColor: driver.color,
          fillOpacity: 0.08,
          weight: 1,
          dashArray: "4, 6",
        }).addTo(map.current);

        geofenceCircles.current[driver.id] = geofence;
      });

      setIsLoaded(true);
      addLog("Cairo Central GIS Loaded");
    } catch (err: any) {
      addLog(`Initialization Error: ${err.message}`);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // 2. Calculate Routes for All Drivers
  const calculateDriverRoute = async (targetDriver: Driver) => {
    if (!isRoutingEnabled) return;

    try {
      const route = await RoutingService.fetchRoute(
        [targetDriver.coords.lat, targetDriver.coords.lng],
        [targetDriver.destination.lat, targetDriver.destination.lng]
      );

      setFleet((prev) =>
        prev.map((d) => (d.id === targetDriver.id ? { ...d, routeInfo: route } : d))
      );

      addLog(`Route Synced for ${targetDriver.name.split(" ")[0]} (${route.distance.toFixed(1)} km)`);
    } catch (e: any) {
      addLog(`Route Calculation Warning: ${e.message}`);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (activeDriver) {
      calculateDriverRoute(activeDriver);
    }
  }, [selectedDriverId, activeDriver.destination.lat, activeDriver.destination.lng, isRoutingEnabled]);

  // 3. Autonomous Fleet Movement Simulation (Zero-Config Standalone Mode)
  useEffect(() => {
    if (dataSourceMode !== "sim" || isPlaybackMode) return;

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

  // 4b. Live PWA Driver Telemetry Link (Zero-Cost Cross-Tab / Mobile Sync)
  useEffect(() => {
    try {
      const channel = new BroadcastChannel("opentrack_telemetry");
      channel.onmessage = (event) => {
        const data = event.data;
        if (data && typeof data.lat === "number" && typeof data.lng === "number") {
          setFleet((prev) =>
            prev.map((d) =>
              d.id === "driver_1"
                ? {
                    ...d,
                    coords: { lat: data.lat, lng: data.lng },
                    speed: data.speed ? Math.round(data.speed) : d.speed,
                  }
                : d
            )
          );
          setDataSourceMode("pwa");
          addLog(`📡 PWA Signal: ${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`);
        }
      };
      return () => channel.close();
    } catch {
      // BroadcastChannel fallback
    }
  }, []);

  // 5. Places Search Handler (Nominatim)
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await SearchService.searchPlaces(searchQuery, "eg");
        setSearchResults(results);
        setShowDropdown(true);
      } catch (e: any) {
        addLog(`Search Warning: ${e.message}`);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectPlace = (place: PlaceResult) => {
    const lat = place.lat;
    const lng = place.lng;
    const cleanName = place.name || place.displayName.split(",")[0];

    setFleet((prev) =>
      prev.map((d) =>
        d.id === selectedDriverId
          ? {
              ...d,
              destination: { lat, lng, name: cleanName },
            }
          : d
      )
    );

    setShowDropdown(false);
    setSearchQuery("");
    geofenceCircles.current[selectedDriverId]?.setLatLng([lat, lng]);
    addLog(`Destination updated: ${cleanName}`);

    if (map.current) {
      map.current.flyTo([lat, lng], 14, { duration: 1.5 });
    }
  };

  // 6. Playback scrubber loop
  useEffect(() => {
    let playTimer: NodeJS.Timeout;
    if (isPlaying && isPlaybackMode) {
      playTimer = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 2;
        });
      }, 250);
    }
    return () => clearInterval(playTimer);
  }, [isPlaying, isPlaybackMode]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0b0c10]">
      {/* 1. Underlying Leaflet Map Canvas */}
      <div ref={mapContainer} className="absolute inset-0 z-0 bg-[#0b0c10]" />

      {/* 2. Top-Right Search Autocomplete Bar */}
      <SearchBar
        query={searchQuery}
        onChangeQuery={setSearchQuery}
        results={searchResults}
        isSearching={isSearching}
        showDropdown={showDropdown}
        onSelectPlace={handleSelectPlace}
        onClear={() => {
          setSearchQuery("");
          setShowDropdown(false);
        }}
      />

      {/* 3. Multi-Courier Fleet Drawer */}
      <FleetDrawer
        fleet={fleet}
        selectedDriverId={selectedDriverId}
        onSelectDriver={(driverId) => {
          setSelectedDriverId(driverId);
          const d = fleet.find((item) => item.id === driverId);
          if (d && map.current) {
            map.current.flyTo([d.coords.lat, d.coords.lng], 14, { duration: 1.2 });
            addLog(`Switched focus to ${d.name}`);
          }
        }}
      />

      {/* 4. Bottom-Left Active Route Info Card */}
      <RouteInfoCard
        activeDriver={activeDriver}
        isRoutingEnabled={isRoutingEnabled}
        onToggleRouting={() => {
          setIsRoutingEnabled(!isRoutingEnabled);
          addLog(`Routing Engine: ${!isRoutingEnabled ? "Active" : "Suspended"}`);
        }}
        dataSourceMode={dataSourceMode}
        onToggleDataSource={() => {
          const next = dataSourceMode === "sim" ? "pwa" : "sim";
          setDataSourceMode(next);
          addLog(`Telemetry Mode: ${next === "sim" ? "Autonomous SIM" : "PWA Live"}`);
        }}
        isPlaybackMode={isPlaybackMode}
        onTogglePlayback={() => {
          setIsPlaybackMode(!isPlaybackMode);
          addLog(`Playback Scrubber: ${!isPlaybackMode ? "Active" : "Disabled"}`);
        }}
      />

      {/* 5. Bottom-Center Trip Playback Scrubber (when Playback is toggled) */}
      {isPlaybackMode && (
        <TripPlaybackBar
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          progress={playbackProgress}
          onChangeProgress={setPlaybackProgress}
          onReset={() => {
            setPlaybackProgress(0);
            setIsPlaying(false);
          }}
        />
      )}

      {/* 6. Bottom-Right Non-Blocking System Telemetry Drawer */}
      <SystemLogsDrawer
        logs={debugLog}
        isExpanded={isLogsExpanded}
        onToggleExpanded={() => setIsLogsExpanded(!isLogsExpanded)}
      />
    </div>
  );
};

export default OpenTrackMap;
