export interface RouteResponse {
  geometry: any;
  distance: number;
  duration: number;
  destinationName?: string;
}

export interface SnapResult {
  coord: [number, number];
  streetName: string;
}

/**
 * RoutingService using OSRM Public API
 * Provides street-level pathfinding for OpenTrack OS
 */
export const RoutingService = {
  /**
   * Fetch route between two points
   * @param start [lat, lng]
   * @param end [lat, lng]
   */
  async fetchRoute(start: [number, number], end: [number, number]): Promise<RouteResponse> {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Routing Service Unavailable");
      
      const data = await response.json();
      if (data.code !== "Ok") throw new Error(data.message || "Route not found");
      
      const route = data.routes[0];
      const destinationName = data.waypoints?.[1]?.name || "Destination";

      return {
        geometry: route.geometry,
        distance: route.distance / 1000, // km
        duration: route.duration / 60,   // mins
        destinationName,
      };
    } catch (err) {
      console.error("[RoutingService] Fetch failed:", err);
      throw err;
    }
  },

  /**
   * Snaps a coordinate to the nearest road (Map Matching lite)
   * and extracts current street name
   * @param coord [lat, lng]
   */
  async snapToRoad(coord: [number, number]): Promise<SnapResult> {
    try {
      const url = `https://router.project-osrm.org/nearest/v1/driving/${coord[1]},${coord[0]}`;
      const response = await fetch(url);
      if (!response.ok) return { coord, streetName: "Unknown Street" };
      
      const data = await response.json();
      if (data.code !== "Ok" || !data.waypoints?.[0]) return { coord, streetName: "Unknown Street" };
      
      const waypoint = data.waypoints[0];
      const snapped = waypoint.location;
      const streetName = waypoint.name && waypoint.name.trim().length > 0 ? waypoint.name : "Urban Road";
      
      return {
        coord: [snapped[1], snapped[0]],
        streetName
      };
    } catch (err) {
      console.warn("[RoutingService] Snap to road failed, using raw coordinates:", err);
      return { coord, streetName: "GPS Coordinate" };
    }
  }
};
