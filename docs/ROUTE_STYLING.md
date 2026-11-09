# OpenTrack OS - Route Styling & Customization Guide

This guide explains how to customize and style the street path navigation line in **OpenTrack OS**.

---

## 1. Architecture Overview

The routing visualization is powered by two complementary layers:
1. **Glow Layer (Ambient Glow):** A thicker, low-opacity line that creates a soft neon halo around the path.
2. **Main Navigation Line (Primary Route):** A sharp, high-contrast line representing the exact street trajectory.

Location: `src/components/map/OpenTrackMap.tsx`

---

## 2. Customizing Path Colors & Geometry

In `OpenTrackMap.tsx`, look for the route rendering block inside `useEffect`:

```typescript
// 1. Primary Sharp Line
const mainPath = L.geoJSON(routeInfo.geometry, {
  style: {
    color: "#3b82f6",     // Line color (Default: Neon Blue)
    weight: 5,             // Thickness in pixels
    opacity: 0.75,         // Transparency (0.0 to 1.0)
    lineCap: 'round',      // 'round', 'square', or 'butt'
    lineJoin: 'round'      // 'round', 'miter', or 'bevel'
  }
});

// 2. Neon Ambient Glow
const glowPath = L.geoJSON(routeInfo.geometry, {
  style: {
    color: "#60a5fa",     // Glow halo color (Default: Light Cyan Blue)
    weight: 12,            // Thickness (should be ~2.5x main line)
    opacity: 0.25,         // Low opacity for diffuse glow
    lineCap: 'round'
  }
});
```

### Color Presets:
- **Cyberpunk Cyan (Default):**
  - Main: `#3b82f6` (Blue 500)
  - Glow: `#60a5fa` (Blue 400)
- **Emerald Delivery:**
  - Main: `#10b981` (Emerald 500)
  - Glow: `#34d399` (Emerald 400)
- **High-Priority Amber/Gold:**
  - Main: `#f59e0b` (Amber 500)
  - Glow: `#fbbf24` (Amber 400)
- **Purple Laser:**
  - Main: `#8b5cf6` (Violet 500)
  - Glow: `#a78bfa` (Violet 400)

---

## 3. Creating a Dashed / Animated Route

To make the route dashed (e.g. for upcoming legs or traffic preview), add the `dashArray` property:

```typescript
const dashedPath = L.geoJSON(routeInfo.geometry, {
  style: {
    color: "#38bdf8",
    weight: 4,
    dashArray: "10, 10", // 10px dash, 10px gap
    opacity: 0.8
  }
});
```

---

## 4. Connecting a Self-Hosted OSRM or GraphHopper Instance

In `src/services/RoutingService.ts`:

Replace the public endpoint with your private server:

```typescript
// Default Public OSRM API:
const OSRM_HOST = process.env.NEXT_PUBLIC_OSRM_URL || "https://router.project-osrm.org";

const url = `${OSRM_HOST}/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
```

---

## 5. Toggling the Routing Module

The system is strictly modular:
- Click the **`ENGINE ON / OFF`** button on the **Route Navigation** glassmorphism card to suspend or resume path calculations on the fly.
- When disabled, OpenTrack OS automatically switches back to ultra-low-bandwidth raw GPS tracking.
