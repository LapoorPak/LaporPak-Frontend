import { ListFilter, Search } from "lucide-react";
import type { ReportsScope } from "@/api/reports";
import { LocationSearchResultsDropdown } from "@/pages/dashboard/components/shared";
import type { AgencyMobileNavbarControlsProps } from "@/types/dashboard";

const REPORT_SCOPE_OPTIONS: {
  value: ReportsScope;
  shortLabel: string;
}[] = [
  { value: "mine", shortLabel: "Saya" },
  { value: "all", shortLabel: "Semua" },
];

export function AgencyMobileNavbarControls({
  containerRef,
  viewMode,
  locationSearchQuery,
  reportSearchQuery,
  debouncedLocationSearchQuery,
  showLocationSearch,
  isSearchingLocations,
  locationSearchResults,
  scope,
  isDashboardOpen,
  onLocationSearchChange,
  onReportSearchChange,
  onLocationSearchFocus,
  onSelectPlace,
  onScopeChange,
  onToggleDashboard,
}: AgencyMobileNavbarControlsProps) {
  const isMapMode = viewMode === "map";

  return (
    <div ref={containerRef} className="relative">
      {isMapMode && (
        <LocationSearchResultsDropdown
          isOpen={showLocationSearch}
          query={locationSearchQuery}
          isLoading={
            isSearchingLocations ||
            locationSearchQuery !== debouncedLocationSearchQuery
          }
          results={locationSearchResults}
          onSelectPlace={onSelectPlace}
          className="absolute left-0 right-0 top-[46px] z-60 max-h-[220px]"
        />
      )}

      <div className="flex h-10 items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-1.5 shadow-inner">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1">
          <Search
            size={14}
            strokeWidth={2.5}
            className="shrink-0 text-[#db2744]"
          />
          <input
            type="text"
            value={isMapMode ? locationSearchQuery : reportSearchQuery}
            onChange={(event) => {
              if (isMapMode) {
                onLocationSearchChange(event.target.value);
                return;
              }

              onReportSearchChange(event.target.value);
            }}
            onFocus={() => onLocationSearchFocus(isMapMode)}
            placeholder={isMapMode ? "Cari lokasi..." : "Cari tiket..."}
            className="h-7 min-w-0 flex-1 bg-transparent text-xs font-bold text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-full border border-gray-200 bg-white p-0.5">
          {REPORT_SCOPE_OPTIONS.map((scopeOption) => (
            <button
              key={scopeOption.value}
              type="button"
              onClick={() => onScopeChange(scopeOption.value)}
              className={`h-7 rounded-full px-3 text-[10px] font-black transition-all ${
                scope === scopeOption.value
                  ? "bg-[#db2744] text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {scopeOption.shortLabel}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onToggleDashboard}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
            isDashboardOpen
              ? "bg-[#db2744] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
          aria-label="Buka daftar tiket"
        >
          <ListFilter size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
