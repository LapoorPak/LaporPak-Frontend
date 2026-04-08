import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { type SearchResult } from "@/hooks/search/useSearchLocation";
import { cn } from "@/lib/utils";

type LocationSearchResultsDropdownProps = {
  isOpen: boolean;
  query: string;
  isLoading: boolean;
  results: SearchResult[];
  onSelectPlace: (place: SearchResult) => void;
  className?: string;
  emptyMessage?: string;
};

export function LocationSearchResultsDropdown({
  isOpen,
  query,
  isLoading,
  results,
  onSelectPlace,
  className,
  emptyMessage = "Lokasi tidak ditemukan",
}: LocationSearchResultsDropdownProps) {
  const shouldShow = isOpen && query.trim().length >= 2;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "w-full bg-white rounded-sm shadow-xl border border-gray-200 overflow-hidden max-h-[240px] overflow-y-auto pointer-events-auto",
            className
          )}
        >
          {isLoading ? (
            <div className="w-full animate-pulse">
              {[1, 2, 3].map((item) => (
                <div key={item} className="w-full px-4 py-3 flex items-center gap-3 border-b border-gray-50 last:border-b-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
                  <div className="min-w-0 flex-1 space-y-2.5 py-1">
                    <div className="h-2.5 bg-gray-200 rounded-full w-3/4" />
                    <div className="h-2 bg-gray-100 rounded-full w-2/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs font-bold text-gray-400">{emptyMessage}</p>
            </div>
          ) : (
            results.map((place, index) => (
              <button
                key={`${place.name}-${place.lat}-${place.lng}-${index}`}
                onClick={() => onSelectPlace(place)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
              >
                <div className="w-8 h-8 rounded-full bg-red-50 text-[#db2744] flex items-center justify-center shrink-0">
                  <MapPin size={14} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 truncate">{place.name}</p>
                  <p className="text-[11px] text-gray-400 font-medium truncate">{place.sub}</p>
                </div>
              </button>
            ))
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
