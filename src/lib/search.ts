export interface PlaceResult {
  placeId: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type: string;
}

/**
 * OpenStreetMap Nominatim Free Geocoding Service
 * Zero-cost alternative to Google Places Autocomplete API
 */
export const SearchService = {
  /**
   * Search for streets, landmarks, and cities
   * @param query Search query text (Arabic or English)
   * @param country Optional country code restriction (e.g. 'eg')
   */
  async searchPlaces(query: string, country: string = "eg"): Promise<PlaceResult[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      const countryParam = country ? `&countrycodes=${country}` : "";
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query.trim()
      )}&format=json&addressdetails=1&limit=5${countryParam}`;

      const response = await fetch(url, {
        headers: {
          "Accept-Language": "ar,en;q=0.9",
        },
      });

      if (!response.ok) throw new Error("Search service temporarily unreachable");

      const data = await response.json();

      return data.map((item: any) => {
        // Extract clean primary name
        const primaryName =
          item.address?.road ||
          item.address?.suburb ||
          item.address?.neighbourhood ||
          item.address?.city ||
          item.name ||
          item.display_name.split(",")[0];

        return {
          placeId: String(item.place_id),
          name: primaryName,
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type || "landmark",
        };
      });
    } catch (err) {
      console.warn("[SearchService] Places lookup failed:", err);
      return [];
    }
  },
};
