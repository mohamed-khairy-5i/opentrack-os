<div align="center">
  <a href="https://github.com/mohamed-khairy-5i/opentrack-os">
    <img src="public/icon.svg" width="108" height="108" alt="OpenTrack OS Logo" />
  </a>
  <h1 align="center">OpenTrack OS</h1>
  <p align="center"><strong>The Zero-Cost, Drop-in Open Source Alternative to Google Maps & Google Fleet Engine for React and Next.js.</strong></p>
</div>

<div align="center">

[![🇸🇦 النسخة العربية](https://img.shields.io/badge/🇸🇦%20النسخة%20العربية-README.ar.md-blue)](README.ar.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.1.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Map-Leaflet-199900?logo=leaflet)](https://leafletjs.com/)
[![OSRM](https://img.shields.io/badge/Routing-OSRM-orange)](http://project-osrm.org/)
[![Zero Cost](https://img.shields.io/badge/Cost-$0%20(Forever)-success)](#why-opentrack-os)

<br />

[![⚡ Live Demo](https://img.shields.io/badge/⚡%20Live%20Interactive%20Demo-opentrack--os.pages.dev-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://opentrack-os.pages.dev)
[![📱 Driver PWA](https://img.shields.io/badge/📱%20Driver%20PWA-opentrack--os.pages.dev%2Fdriver-0284c7?style=for-the-badge&logo=pwa&logoColor=white)](https://opentrack-os.pages.dev/driver)

</div>

---

## 🌟 Why OpenTrack OS?

Google Maps Platform charges up to **$5 to $10 per 1,000 navigation calls** and **$7 per 1,000 map loads**. For delivery startups and indie developers, a fleet of just 5 couriers can rack up hundreds of dollars in monthly cloud bills.

**OpenTrack OS** eliminates corporate vendor lock-in. It gives you a drop-in, production-grade tracking and routing dashboard built with cutting-edge open-source tools—**100% free forever, requiring no credit card, no billing accounts, and zero API keys.**

---

## ✨ Key Features

### 🧭 1. Street-Level Navigation & Pathfinding (OSRM)
* **Real Street Geometry:** Calculates real road paths across highways, bridges, and turns instead of crude straight-line vectors.
* **Dual-Layer Neon Glow:** Cyberpunk-inspired aesthetic featuring a sharp primary route line overlaid with a soft ambient glow halo.
* **Map Matching (Snap to Road):** Automatically snaps raw GPS coordinates to the nearest paved road and resolves exact Arabic/English street names (e.g. *ميدان التحرير*).

### 🔍 2. Zero-Cost Places Search (Nominatim)
* **Smart Autocomplete:** Search any street, neighborhood, or landmark in Egypt or internationally with live suggestions.
* **Instant Destination Routing:** Selecting a search result dynamically recalculates the vehicle route, distance (km), and estimated travel time (ETA).

### 🏎️ 3. Multi-Driver Fleet Engine
* **Concurrent Tracking:** View multiple active couriers (Motorbikes, Delivery Vans, Electric Scooters) simultaneously on the same map.
* **Interactive Fleet Drawer:** Inspect live speeds (`km/h`), delivery statuses (`DELIVERING`, `EN_ROUTE`), and road locations.
* **One-Click Focus:** Click any driver to smoothly pan the map, display their individual route line, and isolate their telemetry.

### 📱 4. Zero-Cost Mobile Driver Web App (`/driver`)
* **Smartphone GPS Beacon:** Drivers open `http://localhost:3000/driver` from mobile Safari or Chrome.
* **Pulsing "GO ONLINE" Button:** Uses HTML5 Geolocation (`navigator.geolocation.watchPosition`) to transmit real-time latitude, longitude, heading, and speed.
* **Zero App Store Fees:** No need to buy a $25 Google Play or $99 Apple Developer license.

### ⚡ 5. Autonomous Standalone Engine
* **Instant Experience:** The dashboard runs out-of-the-box with simulated courier movement along real Cairo streets without touching a database or environment file.
* **PWA Live Link:** Real-time cross-tab GPS streaming directly from the `/driver` web app via standard browser `BroadcastChannel` with zero cloud setup.

### 🎛️ 6. Non-Blocking Glassmorphism UI
* **Route Navigation Card:** Real-time distance, ETA, target location, and engine toggle switch (`ENGINE ON / OFF`).
* **Collapsible Terminal Drawer:** Non-obtrusive system logs positioned in the bottom-right corner with minimize/expand controls.

---

## 🚀 Quick Start (60 Seconds)

### 1. Clone & Install
```bash
git clone https://github.com/mohamed-khairy-5i/opentrack-os.git
cd opentrack-os
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the live dashboard!

### 3. Open the Mobile Driver App
Open [http://localhost:3000/driver](http://localhost:3000/driver) on your phone or in another browser tab and tap **"GO ONLINE"** to stream live GPS data directly into the map!

---

## 📦 Drop-in Component Usage (Shadcn Style)

You can copy and embed OpenTrack OS into any existing Next.js or React application in seconds:

```tsx
import dynamic from "next/dynamic";

// 1. Dynamic Import (Disables SSR for Leaflet window object)
const OpenTrackMap = dynamic(
  () => import("@/components/map/OpenTrackMap").then((mod) => mod.OpenTrackMap),
  { ssr: false }
);

// 2. Drop into your Delivery / Tracking page
export default function OrderTrackingPage() {
  return (
    <div className="relative w-full h-screen">
      {/* Supports language="ar" (Arabic / RTL) or language="en" (English) */}
      <OpenTrackMap language="ar" />
    </div>
  );
}
```

---

## 🛠️ Tech Stack & Architecture

| Layer | Open-Source Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) + React 18 | Modern React architecture with dynamic client-side loading |
| **Mapping Engine** | Leaflet + OpenStreetMap Carto | Lightweight, rock-solid raster map tiles (no WebGL crashes) |
| **Routing & Directions** | OSRM (Open Source Routing Machine) | Street-level route geometry, distance, and duration calculation |
| **Geocoding & Search** | OpenStreetMap Nominatim API | Zero-cost places and street search with autocomplete |
| **Animations & UI** | Framer Motion + Tailwind CSS | High-contrast Dark Mode with Glassmorphism blur effects |
| **Telemetry Transport** | Autonomous Simulation / BroadcastChannel | Zero-cost real-time coordinate streaming and live telemetry |

---

## 📁 Repository Structure

```
opentrack-os/
├── docs/                          # Architectural Specs & Styling Guides
│   ├── ARCHITECTURE.md            # Technical System Architecture & Mermaid Flows
│   └── ROUTE_STYLING.md           # Customization Guide for Neon Path Colors
├── public/                        # Static Assets & Brand Marks
│   ├── icon.svg                   # Vector Browser Tab Favicon
│   └── logo.svg                   # Official Vector Project Banner Logo
├── src/
│   ├── app/
│   │   ├── page.tsx               # Main Operator Dashboard UI
│   │   ├── driver/page.tsx        # Mobile Driver PWA Interface
│   │   ├── layout.tsx             # Root Layout & Metadata
│   │   └── globals.css            # Dark Theme CSS & Glow Variables
│   ├── components/
│   │   ├── map/
│   │   │   └── OpenTrackMap.tsx   # Core Leaflet Engine & Fleet Controller
│   │   ├── dashboard/             # Modular Non-Blocking UI Overlays
│   │   │   ├── SearchBar.tsx      # Nominatim Autocomplete Overlay
│   │   │   ├── FleetDrawer.tsx    # Multi-Courier Active Fleet List
│   │   │   ├── RouteInfoCard.tsx  # Navigation Metrics & Control Toggles
│   │   │   ├── SystemLogsDrawer.tsx # Collapsible Telemetry Terminal
│   │   │   └── TripPlaybackBar.tsx # Route Scrubber & Playback Controls
│   │   └── icons/
│   │       └── OpenTrackLogo.tsx  # Dynamic Precision Vector Brand Logo
│   ├── lib/
│   │   ├── i18n.ts                # Dual Language Dictionary (Arabic / English)
│   │   ├── routing.ts             # OSRM Pathfinding & Map Matching
│   │   └── search.ts              # Nominatim Places Geocoding Engine
│   └── types/
│       └── fleet.ts               # Driver, Telemetry, and Vehicle Type Definitions
├── .env.example                   # Optional Environment Template
├── LICENSE                        # MIT License
├── README.md                      # English Documentation
├── README.ar.md                   # Arabic Documentation
├── package.json
└── tsconfig.json
```

---

## ⚙️ Configuration (Optional)

OpenTrack OS is 100% functional out-of-the-box with **zero configuration**.

If you wish to use a custom or self-hosted OSRM routing instance, copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
And specify your router endpoint:
```env
NEXT_PUBLIC_OSRM_URL=https://router.project-osrm.org
```

---

## 📖 Additional Documentation

* 📐 [Full Architecture & Scenarios (`docs/ARCHITECTURE.md`)](docs/ARCHITECTURE.md) - Architectural diagrams and sequence flows.
* 🎨 [Route Styling Guide (`docs/ROUTE_STYLING.md`)](docs/ROUTE_STYLING.md) - How to change neon colors (Cyberpunk, Emerald, Amber) and line weights.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details. Free for personal, educational, and commercial use.
