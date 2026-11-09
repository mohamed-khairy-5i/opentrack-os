import React from "react";
import { Search, MapPin, X } from "lucide-react";
import { PlaceResult } from "@/lib/search";

interface SearchBarProps {
  query: string;
  onChangeQuery: (q: string) => void;
  results: PlaceResult[];
  isSearching: boolean;
  showDropdown: boolean;
  onSelectPlace: (place: PlaceResult) => void;
  onClear: () => void;
  placeholder?: string;
  lang?: "ar" | "en";
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onChangeQuery,
  results,
  isSearching,
  showDropdown,
  onSelectPlace,
  onClear,
  placeholder = "ابحث عن شارع أو ميدان في القاهرة...",
  lang = "ar",
}) => {
  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-80 sm:w-96 max-w-[calc(100vw-3rem)]">
      <div className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full px-10 py-2.5 bg-[#12141a]/95 backdrop-blur-xl border border-white/15 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/70 shadow-2xl transition-all"
          />
          <Search className={`w-4 h-4 text-gray-400 absolute ${lang === "ar" ? "right-3.5" : "left-3.5"} pointer-events-none`} />
          {query && (
            <button
              onClick={onClear}
              className={`absolute ${lang === "ar" ? "left-3" : "right-3"} text-gray-400 hover:text-white transition-colors`}
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
