import { RouteResponse } from "@/services/RoutingService";

export type VehicleType = "bike" | "car" | "scooter";
export type DriverStatus = "delivering" | "en_route" | "idle";
export type TelemetrySourceMode = "sim" | "pwa";

export interface Driver {
  id: string;
  name: string;
  vehicleType: VehicleType;
  color: string;
  coords: { lat: number; lng: number };
  currentStreet: string;
  destination: { lat: number; lng: number; name: string };
  status: DriverStatus;
  speed: number;
  routeInfo?: RouteResponse | null;
}

export interface TelemetryPacket {
  lat: number;
  lng: number;
  speed?: number;
  accuracy?: number;
  heading?: number;
  timestamp: string;
}
