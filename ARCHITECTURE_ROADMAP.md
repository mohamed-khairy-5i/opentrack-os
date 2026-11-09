# OpenTrack OS - Architecture & Scenarios Roadmap 🗺️🚀
> **The Zero-Cost, Plug-and-Play Open Source Alternative to Google Maps & Fleet Engine for React & Next.js**

---

## 1. High-Level Architecture Overview

OpenTrack OS is structured into four decoupled layers, ensuring it can function **100% standalone with zero backend setup**, or plug into custom backends (Firebase, WebSockets, Supabase, REST APIs).

```mermaid
graph TD
    subgraph UI_Layer ["1. UI & Visual Layer (Client)"]
        A["Dashboard & Intel Card (Glassmorphism)"]
        B["Leaflet Canvas (Dark Theme Tiles)"]
        C["Glowing Dual-Path Layer (Neon Polyline)"]
        D["Interactive Street Search (Nominatim Autocomplete)"]
    end

    subgraph Logic_Layer ["2. GIS & Logic Engine"]
        E["RoutingService.ts (OSRM Pathfinding)"]
        F["Map Matching (Road Snapping & Street Extraction)"]
        G["Navigation State & ETA Calculator"]
    end

    subgraph Data_Layer ["3. Transport & Telemetry Abstraction"]
        H["Data Provider Adapter"]
        I["Mock Engine (Zero-Config Default)"]
        J["Firebase Realtime Adapter (Optional)"]
        K["WebSocket / REST Adapter (Optional)"]
    end

    subgraph Driver_Layer ["4. Location Origin (Data Source)"]
        L["Virtual Telemetry Simulator"]
        M["Mobile Web PWA (HTML5 Geolocation)"]
    end

    L --> H
    M --> H
    H --> I
    H --> J
    H --> K
    I --> F
    J --> F
    K --> F
    F --> E
    E --> G
    G --> A
    E --> C
    F --> B
```

---

## 2. Detailed Technical Scenarios

### 🎬 Scenario A: Instant Standalone / Mock Mode (The "Zero-Setup" Experience)
**Goal:** A developer clones the repo from GitHub and runs `npm run dev`. The map, moving vehicle, neon route, and telemetry MUST work instantly out-of-the-box without touching an API key, database, or credit card.

```mermaid
sequenceDiagram
    autonumber
    actor Developer as Developer / Visitor
    participant App as Next.js Dashboard
    participant Map as MapComponent (Leaflet)
    participant Mock as Built-in Mock Simulator
    participant OSRM as OSRM Public Routing API

    Developer->>App: Opens http://localhost:3000
    App->>Map: Initialize Map Engine (Dynamic SSR: false)
    Map->>Map: Render Dark Mode OpenStreetMap Tiles
    Map->>Mock: Start Autonomous Local Movement Loop
    loop Every 2 Seconds
        Mock->>Map: Emit Next Coordinate [lat, lng]
        Map->>OSRM: snapToRoad(coord) -> nearest street
        OSRM-->>Map: Returns [SnappedCoord, StreetName]
        Map->>OSRM: fetchRoute(SnappedCoord, Target)
        OSRM-->>Map: Returns GeoJSON Path + Distance + ETA
        Map->>Map: Animate Pulse Marker & Update Glowing Blue Path
        Map->>Map: Update Glassmorphism Route Intel Card
    end
```

---

### 🎬 Scenario B: Developer Drop-in Embedding (Using OpenTrack in Another App)
**Goal:** A software engineer wants to embed live courier tracking into an existing E-commerce or Delivery store (replacing Google Maps).

```mermaid
sequenceDiagram
    autonumber
    actor User as Customer / Store Owner
    participant StoreApp as Customer Store App
    participant OpenTrack as <OpenTrackMap /> Component
    participant Backend as Store Backend (Node/Django/Firebase)

    User->>StoreApp: Opens Order Tracking Page (#1249)
    StoreApp->>OpenTrack: <OpenTrackMap driverId="driver_12" target=[lat, lng] />
    OpenTrack->>Backend: Subscribe to Driver Coordinates
    Backend-->>OpenTrack: Stream Driver GPS Updates
    OpenTrack->>OpenTrack: Snap Coordinates to Real Streets
    OpenTrack->>OpenTrack: Render Glow Polyline to Target
    OpenTrack-->>User: Displays Live ETA & Street Name
```

---

### 🎬 Scenario C: Real Mobile Driver PWA (0$ Cost Mobile Tracking)
**Goal:** The delivery driver uses their mobile smartphone to transmit live coordinates without requiring an app store developer license.

```mermaid
sequenceDiagram
    autonumber
    actor Driver as Courier / Driver
    participant Mobile as Mobile Browser (/driver PWA)
    participant GPS as Device GPS (navigator.geolocation)
    participant Relay as Real-time Relay (WebSocket / Firebase)
    participant Dashboard as OpenTrack OS Dashboard

    Driver->>Mobile: Opens tracking link & taps "Go Online"
    Mobile->>GPS: watchPosition(highAccuracy: true)
    GPS-->>Mobile: [Lat, Lng, Heading, Speed]
    Mobile->>Relay: Transmit Packet { driverId, lat, lng, time }
    Relay-->>Dashboard: Realtime State Broadcast
    Dashboard->>Dashboard: Smooth Marker Interpolation & Re-route
```

---

### 🎬 Scenario D: Zero-Cost Places Search (Nominatim / Photon)
**Goal:** The user searches for a destination (e.g. "Tahrir Square" or "عباس العقاد") without paying Google Places API fees.

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Operator
    participant SearchBar as UI Search Component
    participant Nominatim as OpenStreetMap Nominatim API
    participant Map as Map Engine

    User->>SearchBar: Types "جامعة القاهرة" (Cairo University)
    SearchBar->>Nominatim: GET /search?q=جامعة القاهرة&format=json&countrycodes=eg
    Nominatim-->>SearchBar: Array of Results [Name, Lat, Lng, DisplayName]
    SearchBar-->>User: Display Clean Autocomplete Suggestions
    User->>SearchBar: Selects Destination
    SearchBar->>Map: Set Destination to Selected Coordinates
    Map->>Map: Trigger Path Calculation & Redraw Route
```

---

## 3. Implementation Roadmap (Phases to GitHub Release)

```mermaid
gantt
    title OpenTrack OS - Evolution to Open Source Benchmark
    dateFormat  YYYY-MM-DD
    section Phase 1: Core Decoupling
    Decouple Firebase into Optional Adapter   :done, p1_1, 2026-11-01, 3d
    Implement Standalone Local Mock Mode     :active, p1_2, after p1_1, 2d
    section Phase 2: Search & Multiple Drivers
    Integrate Nominatim Places Autocomplete   :p2_1, after p1_2, 3d
    Support Multi-Driver Fleet Rendering      :p2_2, after p2_1, 3d
    section Phase 3: Mobile PWA & Replay
    Driver Mobile Tracking Web Page (/driver) :p3_1, after p2_2, 3d
    Trip History & Route Playback Engine      :p3_2, after p3_1, 3d
    section Phase 4: GitHub Launchpad
    Package as Copy-Paste Component (Shadcn style): p4_1, after p3_2, 2d
    Bilingual README & Live Interactive Demo  :p4_2, after p4_1, 2d
```

---

## 4. Component Interface Contract (`<OpenTrackMap />`)

```typescript
export interface OpenTrackMapProps {
  // Origin & Target Coordinates [lat, lng]
  initialPosition?: [number, number];
  destination?: [number, number];

  // Routing Configuration
  routingEnabled?: boolean;
  routingProfile?: 'driving' | 'walking' | 'cycling';
  customOsrmUrl?: string; // Optional: self-hosted instance

  // Data Source Mode
  mode?: 'mock' | 'firebase' | 'websocket' | 'custom';
  telemetryStream$?: Observable<{ lat: number; lng: number }>;

  // Styling Customization
  theme?: 'dark-neon' | 'cyberpunk' | 'light-minimal';
  routeColor?: string;
  glowColor?: string;

  // Callbacks
  onRouteCalculated?: (info: { distance: number; duration: number; street: string }) => void;
  onDestinationReached?: () => void;
}
```
