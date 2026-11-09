import { RouteResponse } from "@/lib/routing";

export type VehicleType = "bike" | "car" | "scooter";
export type DriverStatus = "delivering" | "en_route" | "idle";
export type TelemetrySourceMode = "sim" | "pwa";

export interface LocalizedText {
  ar: string;
  en: string;
}

export interface Driver {
  id: string;
  name: string;
  nameI18n?: LocalizedText;
  vehicleType: VehicleType;
  color: string;
  coords: { lat: number; lng: number };
  currentStreet: string;
  currentStreetI18n?: LocalizedText;
  destination: {
    lat: number;
    lng: number;
    name: string;
    nameI18n?: LocalizedText;
  };
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
