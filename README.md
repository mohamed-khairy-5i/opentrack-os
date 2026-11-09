# OpenTrack OS 🗺️⚡
> **The Zero-Cost, Drop-in Open Source Alternative to Google Maps & Google Fleet Engine for React and Next.js.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.1.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Map-Leaflet-199900?logo=leaflet)](https://leafletjs.com/)
[![OSRM](https://img.shields.io/badge/Routing-OSRM-orange)](http://project-osrm.org/)
[![Zero Cost](https://img.shields.io/badge/Cost-$0%20(Forever)-success)](#why-opentrack-os)

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
├── src/
│   ├── app/
│   │   ├── page.tsx               # Main Operator Dashboard UI
│   │   ├── driver/page.tsx        # Mobile Driver PWA Interface
│   │   └── layout.tsx             # Root Layout & Fonts
│   ├── components/
│   │   └── MapComponent.tsx       # Core Leaflet Map Engine & Fleet Controller
│   └── services/
│       ├── RoutingService.ts      # OSRM Pathfinding & Map Matching
│       └── SearchService.ts       # Nominatim Places Geocoding Engine
├── ARCHITECTURE_ROADMAP.md        # Technical System Architecture & Mermaid Diagrams
├── ROUTE_STYLING.md               # Customization Guide for Neon Path Colors
├── .env.example                   # Optional Environment Template
├── LICENSE                        # MIT License
└── package.json
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

* 📐 [Full Architecture & Scenarios (`ARCHITECTURE_ROADMAP.md`)](ARCHITECTURE_ROADMAP.md) - Architectural diagrams and sequence flows.
* 🎨 [Route Styling Guide (`ROUTE_STYLING.md`)](ROUTE_STYLING.md) - How to change neon colors (Cyberpunk, Emerald, Amber) and line weights.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details. Free for personal, educational, and commercial use.
