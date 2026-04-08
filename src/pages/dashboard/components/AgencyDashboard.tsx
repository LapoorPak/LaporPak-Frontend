import { useState, useEffect, useRef } from "react";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  type MapRef,
} from "@/components/ui/map";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ListFilter,
  Navigation,
} from "lucide-react";
import type {
  ReportsDashboardSummary,
  ReportsDashboardTab,
  ReportsDashboardTabKey,
  ReportLocation,
} from "@/api/reports/reports-queries";
import { useGetReportLocations } from "@/hooks/reports/useGetReportLocations";
import { useGetReportsDashboard } from "@/hooks/reports/useGetReportsDashboard";
import {
  useQuerySearchLocation,
  type SearchResult,
} from "@/hooks/search/useSearchLocation";
import { AgencyReportDetailDrawer } from "./AgencyReportDetailDrawer";
import { AgencyReportsBottomSheet } from "./AgencyReportsBottomSheet";
import { AgencyReportsSidebar } from "./AgencyReportsSidebar";
import { LocationSearchResultsDropdown } from "./LocationSearchResultsDropdown";
import {
  AGENCY_REPORT_STATUS_MAP,
  getDashboardStatusToneStyle,
} from "../utils/reportStatus";

const DEFAULT_REPORTS_DASHBOARD_TABS: ReportsDashboardTab[] = [
  { key: "semua", label: "Semua", total: 0 },
  { key: "baru", label: "Baru", total: 0 },
  { key: "diproses", label: "Diproses", total: 0 },
  { key: "tuntas", label: "Tuntas", total: 0 },
];

const DEFAULT_REPORTS_DASHBOARD_SUMMARY: ReportsDashboardSummary = {
  totalTarget: 0,
  laporanBaru: 0,
  diproses: 0,
  tuntas: 0,
  byStatusRaw: {
    pending: 0,
    verified: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
  },
};

const SUMMARY_CARD_META = [
  {
    key: "totalTarget",
    label: "Total Target",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-100",
    border: "border-blue-200",
  },
  {
    key: "laporanBaru",
    label: "Laporan Baru",
    icon: AlertCircle,
    color: "text-[#C01D33]",
    bg: "bg-red-100",
    border: "border-red-200",
  },
  {
    key: "diproses",
    label: "Diproses",
    icon: Clock,
    color: "text-orange-600",
    bg: "bg-orange-100",
    border: "border-orange-200",
  },
  {
    key: "tuntas",
    label: "Tuntas",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    border: "border-emerald-200",
  },
] as const;

const matchesAgencyDashboardTab = (
  status: ReportLocation["status"],
  tab: ReportsDashboardTabKey,
) => {
  if (status === "rejected") return false;
  if (tab === "baru") return status === "pending" || status === "verified";
  if (tab === "diproses") return status === "in_progress";
  if (tab === "tuntas") return status === "resolved";
  return true;
};

const matchesAgencyDashboardSearch = (
  report: ReportLocation,
  query: string,
) => {
  if (!query) return true;

  const normalizedQuery = query.toLowerCase();
  const agencyName = report.cabangDinas?.name || report.dinas?.name || "Pusat";
  const categoryName = report.kategori?.name || "";

  return (
    report.id.toLowerCase().includes(normalizedQuery) ||
    report.title.toLowerCase().includes(normalizedQuery) ||
    agencyName.toLowerCase().includes(normalizedQuery) ||
    categoryName.toLowerCase().includes(normalizedQuery)
  );
};

export default function AgencyDashboard() {
  const [activeTab, setActiveTab] = useState<ReportsDashboardTabKey>("semua");
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [reportSearchQuery, setReportSearchQuery] = useState("");
  const [debouncedReportSearchQuery, setDebouncedReportSearchQuery] =
    useState("");
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [debouncedLocationSearchQuery, setDebouncedLocationSearchQuery] =
    useState("");
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState<{
    name: string;
    coords: [number, number];
  } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef | null>(null);

  const { data: reportLocationsData } = useGetReportLocations();
  const {
    data: reportsDashboardData,
    isFetching: isReportsDashboardFetching,
    isLoading: isReportsDashboardLoading,
  } = useGetReportsDashboard({
    tab: activeTab,
    search: debouncedReportSearchQuery || undefined,
    limit: 100,
  });
  const { data: locationSearchResults = [], isFetching: isSearchingLocations } =
    useQuerySearchLocation(debouncedLocationSearchQuery);

  const locationReports = reportLocationsData?.data || [];
  const dashboardReports = reportsDashboardData?.data || [];
  const dashboardTabs =
    reportsDashboardData?.stats.tabs || DEFAULT_REPORTS_DASHBOARD_TABS;
  const dashboardSummary =
    reportsDashboardData?.stats.summary || DEFAULT_REPORTS_DASHBOARD_SUMMARY;
  const totalDashboardReports =
    reportsDashboardData?.meta.total ?? dashboardReports.length;
  const summaryStats = SUMMARY_CARD_META.map((item) => ({
    ...item,
    value: dashboardSummary[item.key],
  }));
  const visibleMapReports = locationReports.filter((report) => {
    return (
      matchesAgencyDashboardTab(report.status, activeTab) &&
      matchesAgencyDashboardSearch(report, debouncedReportSearchQuery)
    );
  });
  const selectedReport = locationReports.find(
    (report) => report.id === selectedMarkerId,
  );

  const [viewport, setViewport] = useState({
    center: [106.8229, -6.1944] as [number, number],
    zoom: 12,
    pitch: 45,
    bearing: 0,
  });
  const mapFocusPadding = isDesktop
    ? {
        top: 32,
        bottom: 40,
        left: isSidebarOpen ? 420 : 32,
        right: selectedReport ? 460 : 32,
      }
    : { top: 112, bottom: 104, left: 20, right: 20 };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedReportSearchQuery(reportSearchQuery.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [reportSearchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocationSearchQuery(locationSearchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [locationSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowLocationSearch(false);
      }
    };

    if (showLocationSearch) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLocationSearch]);

  // Fetch GPS on mount silently
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.longitude, pos.coords.latitude]);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const focusMapOnCoordinates = (coords: [number, number], zoom = 15) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: coords,
        zoom,
        duration: 1200,
        padding: mapFocusPadding,
      });
      return;
    }

    setViewport((prev) => ({
      ...prev,
      center: coords,
      zoom,
    }));
  };

  const handleSaveStatus = () => {
    if (draftStatus && selectedMarkerId) {
      // TODO: Call API to update status
      console.warn("Update status not implemented yet (needs API integration)");
      setSelectedMarkerId(null);
    }
  };

  const handleSelectReport = (reportId: string) => {
    setSelectedMarkerId(reportId);

    const locationReport = locationReports.find((item) => item.id === reportId);
    const dashboardReport = dashboardReports.find(
      (item) => item.id === reportId,
    );

    if (locationReport) {
      focusMapOnCoordinates([locationReport.lng, locationReport.lat], 15);
      setDraftStatus(locationReport.status);
      return;
    }

    if (dashboardReport) {
      setDraftStatus(dashboardReport.status);
    }
  };

  const handleSelectPlace = (place: SearchResult) => {
    const coords: [number, number] = [place.lng, place.lat];
    focusMapOnCoordinates(coords, 15);
    setSearchedLocation({ name: place.name, coords });
    setLocationSearchQuery("");
    setShowLocationSearch(false);
  };

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-100 text-[#C01D33] border border-red-200";
      case "verified":
      case "in_progress":
        return "bg-orange-100 text-orange-700 border border-orange-200";
      case "resolved":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "rejected":
        return "bg-gray-100 text-gray-700 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-[#C01D33] shadow-red-500/50 text-white";
      case "verified":
      case "in_progress":
        return "bg-orange-500 shadow-orange-500/50 text-white";
      case "resolved":
        return "bg-emerald-500 shadow-emerald-500/50 text-white";
      default:
        return "bg-gray-500 shadow-gray-500/50 text-white";
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#F0F2F5] overflow-hidden font-sans">
      {/* Map background */}
      <div className="absolute inset-0 z-0">
        <Map
          ref={mapRef}
          viewport={viewport}
          onViewportChange={setViewport}
          theme="light"
          className="w-full h-full"
        >
          <MapControls
            position="top-right"
            showZoom
            showLocate
            locateZoom={14}
            locatePadding={mapFocusPadding}
            onLocate={({ longitude, latitude }) => {
              setUserLocation([longitude, latitude]);
            }}
          />

          {visibleMapReports.map((report) => {
            const dashboardReport = dashboardReports.find(
              (item) => item.id === report.id,
            );
            const markerBadgeStyle = dashboardReport
              ? getDashboardStatusToneStyle(dashboardReport.statusTone)
              : getBadgeStyle(report.status);
            const markerStatusLabel =
              dashboardReport?.statusLabel ||
              AGENCY_REPORT_STATUS_MAP[report.status]?.label ||
              report.status;

            return (
              <MapMarker
                key={report.id}
                longitude={report.lng}
                latitude={report.lat}
              >
                {selectedMarkerId !== report.id && (
                  <MarkerPopup closeButton={false} anchor="top">
                    <div className="p-1 min-w-[120px] pointer-events-none">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${markerBadgeStyle}`}
                      >
                        {markerStatusLabel}
                      </span>
                      <h4 className="font-extrabold text-[#111827] text-[11px] mt-1 leading-tight truncate">
                        {report.title}
                      </h4>
                    </div>
                  </MarkerPopup>
                )}
                <MarkerContent>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectReport(report.id);
                    }}
                    className="relative group transition-transform hover:scale-110 focus:outline-none"
                  >
                    {(report.status === "pending" ||
                      selectedMarkerId === report.id) && (
                      <div
                        className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                          selectedMarkerId === report.id
                            ? "bg-indigo-500"
                            : "bg-[#C01D33]"
                        }`}
                      ></div>
                    )}
                    <div
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-xl border-2 transition-all z-10 
                    ${selectedMarkerId === report.id ? "bg-gray-900 border-white text-white scale-110" : getMarkerColor(report.status) + " border-white"}`}
                    >
                      {report.status === "pending" ? (
                        <AlertCircle
                          size={16}
                          strokeWidth={selectedMarkerId === report.id ? 3 : 2.5}
                        />
                      ) : report.status === "verified" ||
                        report.status === "in_progress" ? (
                        <Clock
                          size={16}
                          strokeWidth={selectedMarkerId === report.id ? 3 : 2.5}
                        />
                      ) : (
                        <CheckCircle2
                          size={16}
                          strokeWidth={selectedMarkerId === report.id ? 3 : 2.5}
                        />
                      )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 w-4 h-1 bg-black/20 blur-sm rounded-full -translate-x-1/2"></div>
                  </button>
                </MarkerContent>
              </MapMarker>
            );
          })}

          {userLocation && (
            <MapMarker longitude={userLocation[0]} latitude={userLocation[1]}>
              <MarkerContent>
                <div className="flex flex-col items-center -mt-6 pointer-events-none">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center animate-ping absolute inset-0" />
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-emerald-500 relative z-10">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="12" cy="5" r="3" fill="#10b981" />
                        <path
                          d="M12 9c-3 0-5 2-5 4v1a1 1 0 001 1h8a1 1 0 001-1v-1c0-2-2-4-5-4z"
                          fill="#10b981"
                        />
                        <path
                          d="M10 15v4.5a1 1 0 002 0V15M12 15v4.5a1 1 0 002 0V15"
                          stroke="#10b981"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-200 shadow-sm">
                    Lokasi Anda
                  </span>
                </div>
              </MarkerContent>
            </MapMarker>
          )}

          {searchedLocation && (
            <MapMarker
              longitude={searchedLocation.coords[0]}
              latitude={searchedLocation.coords[1]}
            >
              <MarkerContent>
                <div className="flex flex-col items-center -mt-10 pointer-events-none">
                  <div className="bg-white text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg mb-1 border border-gray-200 max-w-[140px] truncate">
                    {searchedLocation.name}
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <Navigation
                      size={14}
                      className="text-white"
                      fill="white"
                      strokeWidth={0}
                    />
                  </div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-0.5 opacity-50" />
                </div>
              </MarkerContent>
            </MapMarker>
          )}
        </Map>
      </div>

      {/* Desktop: Left sidebar panel */}
      <AgencyReportsSidebar
        isOpen={isSidebarOpen && isDesktop}
        activeTab={activeTab}
        reports={dashboardReports}
        searchQuery={reportSearchQuery}
        selectedMarkerId={selectedMarkerId}
        stats={summaryStats}
        tabs={dashboardTabs}
        totalCount={totalDashboardReports}
        isLoading={isReportsDashboardLoading || isReportsDashboardFetching}
        onTabChange={setActiveTab}
        onSearchChange={setReportSearchQuery}
        onClose={() => setIsSidebarOpen(false)}
        onSelectReport={handleSelectReport}
      />

      {/* Mobile: Bottom sheet ticket list */}
      <AgencyReportsBottomSheet
        isOpen={isSidebarOpen && !isDesktop}
        activeTab={activeTab}
        reports={dashboardReports}
        selectedMarkerId={selectedMarkerId}
        stats={summaryStats}
        tabs={dashboardTabs}
        totalCount={totalDashboardReports}
        isLoading={isReportsDashboardLoading || isReportsDashboardFetching}
        onTabChange={setActiveTab}
        onClose={() => setIsSidebarOpen(false)}
        onSelectReport={(reportId) => {
          handleSelectReport(reportId);
          setIsSidebarOpen(false);
        }}
      />

      {/* Detail Drawer */}
      <AgencyReportDetailDrawer
        isOpen={!!selectedReport}
        isDesktop={isDesktop}
        report={selectedReport || null}
        draftStatus={draftStatus}
        onClose={() => setSelectedMarkerId(null)}
        onDraftStatusChange={setDraftStatus}
        onSave={handleSaveStatus}
      />

      {/* Bottom Toolbar Dock */}
      <div
        ref={searchRef}
        className="absolute bottom-5 left-0 right-0 z-20 flex flex-col items-center gap-2 px-4 pointer-events-none"
      >
        <LocationSearchResultsDropdown
          isOpen={showLocationSearch}
          query={locationSearchQuery}
          isLoading={
            isSearchingLocations ||
            locationSearchQuery !== debouncedLocationSearchQuery
          }
          results={locationSearchResults}
          onSelectPlace={handleSelectPlace}
          className="max-w-sm md:max-w-md"
        />

        <div className="bg-white rounded-full shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)] border border-gray-100 flex items-center px-2 py-1.5 gap-1 w-full max-w-sm md:max-w-md pointer-events-auto">
          {/* Search — always open */}
          <div className="flex items-center flex-1 gap-1 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 min-w-0">
            <Search
              size={15}
              strokeWidth={2.5}
              className="text-[#db2744] shrink-0"
            />
            <input
              type="text"
              value={locationSearchQuery}
              onChange={(e) => {
                setLocationSearchQuery(e.target.value);
                setShowLocationSearch(true);
              }}
              onFocus={() => setShowLocationSearch(true)}
              placeholder="Cari lokasi..."
              className="bg-transparent border-none outline-none text-xs font-bold text-gray-900 placeholder:text-gray-400 w-full py-1.5"
            />
          </div>

          <div className="w-px h-5 bg-gray-200 shrink-0 mx-0.5" />

          {/* Ticket list toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full transition-all font-bold shrink-0 ${
              isSidebarOpen
                ? "bg-[#db2744] text-white shadow-md shadow-red-500/20"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ListFilter size={16} strokeWidth={2.5} />
            <span className="text-xs hidden sm:inline">Tiket</span>
          </button>
        </div>
      </div>
    </div>
  );
}
