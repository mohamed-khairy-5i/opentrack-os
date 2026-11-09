import React from "react";
import { Search, MapPin, X } from "lucide-react";
import { PlaceResult } from "@/services/SearchService";

interface SearchBarProps {
  query: string;
  onChangeQuery: (q: string) => void;
  results: PlaceResult[];
  isSearching: boolean;
  showDropdown: boolean;
  onSelectPlace: (place: PlaceResult) => void;
  onClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onChangeQuery,
  results,
  isSearching,
  showDropdown,
  onSelectPlace,
  onClear,
}) => {
  return (
    <div className="absolute top-6 right-6 z-20 w-80">
      <div className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            placeholder="ابحث عن شارع أو ميدان في القاهرة..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#12141a]/90 backdrop-blur-md border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 shadow-2xl transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
          {query && (
            <button
              onClick={onClear}
              className="absolute right-3 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Autocomplete Results */}
        {showDropdown && results.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-[#12141a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-30 max-h-60 overflow-y-auto divide-y divide-white/5">
            {results.map((place) => (
              <button
                key={place.placeId}
                onClick={() => onSelectPlace(place)}
                className="w-full text-left p-3 hover:bg-blue-500/10 transition-colors flex items-start gap-2.5 group"
              >
                <MapPin className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform shrink-0 mt-0.5" />
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-gray-200 truncate group-hover:text-blue-300">
                    {place.name || place.displayName.split(",")[0]}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">
                    {place.displayName}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
