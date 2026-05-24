import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Map,
  MapControls,
  MapMarker,
  MapPopup,
  MarkerContent,
  MarkerPopup,
  type MapRef,
} from "@/components/ui/map";
import { authClient } from "@/lib/auth-client";
import {
  useInfiniteQueryGetReportLocations,
  type ReportLocation,
} from "@/api/reports";
import { useGetAgencyLocations } from "@/hooks/agencies/useGetAgencyLocations";
import { useQueryGetMyReports } from "@/api/reports";
import { useGetReportLocations } from "@/hooks/reports/useGetReportLocations";
import {
  useCitizenDashboardActions,
  type CitizenInteractionMode,
} from "@/hooks/reports/useCitizenDashboardActions";
import { useDebouncedValue } from "@/hooks/common";
import {
  useQuerySearchLocation,
  useSelectSearchPlace,
} from "@/hooks/search";
import type { SearchResult } from "@/types/search";
import { toast } from "sonner";
import { createObjectUrls, revokeObjectUrls } from "@/lib/object-url";
import { readReportFocusParams } from "@/lib/report-focus-navigation";
import { useDashboardViewMode } from "@/context/dashboard-view-mode";
import {
  MapPin,
  X,
  AlertTriangle,
  Plus,
  Target,
  Check,
  User,
  Navigation,
  Building2,
  ListFilter,
  Search,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "react-router";
import type { CitizenReportFilterStatus } from "@/types/dashboard";
import { AgencyPopupCarousel } from "@/pages/dashboard/components/agency";
import {
  CitizenDashboardFilters,
  CitizenFeedReportDetail,
  CitizenMyReportsPanel,
  CitizenReportFormPanel,
  CitizenSocialFeed,
  ReportPopup,
} from "@/pages/dashboard/components/citizen";
import { LocationSearchResultsDropdown } from "@/pages/dashboard/components/shared";
import {
  PhotoLightbox,
  type PhotoLightboxState,
} from "@/pages/dashboard/components/shared";
import { CITIZEN_REPORT_STATUS_MAP } from "@/pages/dashboard/utils";

const EMPTY_SEARCH_RESULTS: SearchResult[] = [];
const CITIZEN_REPORT_FILTER_STATUSES: CitizenReportFilterStatus[] = [
  "pending",
  "verified",
  "in_progress",
  "clarification_requested",
  "resolved",
];

export default function CitizenDashboard() {
  const { data: session } = authClient.useSession();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMyReportsOpen, setIsMyReportsOpen] = useState(false);
  const [mode, setMode] = useState<CitizenInteractionMode>("idle");
  const { viewMode, setViewMode, setMobileControls } = useDashboardViewMode();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [markerLocation, setMarkerLocation] = useState<[number, number] | null>(
    null,
  );
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const photoPreviewsRef = useRef<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [myReportsSearch, setMyReportsSearch] = useState("");
  const [reportStatusFilter, setReportStatusFilter] =
    useState<CitizenReportFilterStatus[]>(CITIZEN_REPORT_FILTER_STATUSES);
  const [showAgencyMarkers, setShowAgencyMarkers] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState<{
    name: string;
    coords: [number, number];
  } | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [lightbox, setLightbox] = useState<PhotoLightboxState>(null);
  const [selectedMapReportId, setSelectedMapReportId] = useState<string | null>(
    null,
  );
  const [activeClarificationReportId, setActiveClarificationReportId] =
    useState<string | null>(null);
  const [selectedMobileReport, setSelectedMobileReport] =
    useState<ReportLocation | null>(null);
  const [feedDetailReport, setFeedDetailReport] =
    useState<ReportLocation | null>(null);
  const [reportSheetHeight, setReportSheetHeight] = useState(68);
  const reportSheetResizeRef = useRef<{
    startY: number;
    startHeight: number;
  } | null>(null);
  const reportSheetResizeMovedRef = useRef(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef | null>(null);

  const openLightbox = useCallback(
    (images: string[], index: number) => setLightbox({ images, index }),
    [],
  );
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const handleClarificationDraftActiveChange = useCallback(
    (reportId: string, active: boolean) => {
      setActiveClarificationReportId((current) => {
        if (active) return reportId;
        return current === reportId ? null : current;
      });
    },
    [],
  );
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 400);
  const debouncedMyReportsSearch = useDebouncedValue(myReportsSearch, 400);

  useEffect(() => {
    photoPreviewsRef.current = photoPreviews;
  }, [photoPreviews]);

  useEffect(() => {
    return () => revokeObjectUrls(photoPreviewsRef.current);
  }, []);

  // API Queries
  const { data: publicReportsData, isFetched: isPublicReportsFetched } =
    useGetReportLocations();
  const { data: myReportsData, isFetched: isMyReportsFetched } =
    useQueryGetMyReports(
    { search: debouncedMyReportsSearch },
    { enabled: !!session?.user },
  );
  const { data: agenciesData } = useGetAgencyLocations();
  const feedSearchQuery =
    viewMode === "feed" ? debouncedSearchQuery.trim() : "";
  const feedReportsQuery = useInfiniteQueryGetReportLocations(
    {
      scope: "all",
      limit: 5,
      search: feedSearchQuery || undefined,
      sort: "top",
      status:
        reportStatusFilter.length === 1 ? reportStatusFilter[0] : undefined,
    },
    { enabled: !!session?.user && viewMode === "feed" },
  );
  const { data: searchResultsData, isFetching: isSearching } =
    useQuerySearchLocation(debouncedSearchQuery, {
      enabled: viewMode === "map",
    });
  const searchResults = searchResultsData ?? EMPTY_SEARCH_RESULTS;

  const publicReports = publicReportsData?.data || [];
  const myReports = myReportsData?.data || [];
  const agencies = agenciesData?.data || [];
  const visibleReportIds = new Set<string>();
  const visibleReports = [...myReports, ...publicReports].filter((report) => {
    if (report.status === "rejected" || visibleReportIds.has(report.id)) {
      return false;
    }
    if (!reportStatusFilter.includes(report.status)) {
      return false;
    }
    visibleReportIds.add(report.id);
    return true;
  });
  const feedReportIds = new Set<string>();
  const visibleFeedReports = (
    feedReportsQuery.data?.pages.flatMap((page) => page.data) ?? []
  ).filter((report) => {
    if (report.status === "rejected" || feedReportIds.has(report.id)) {
      return false;
    }
    if (!reportStatusFilter.includes(report.status)) {
      return false;
    }
    feedReportIds.add(report.id);
    return true;
  });
  const totalVisibleFeedReports =
    reportStatusFilter.length === CITIZEN_REPORT_FILTER_STATUSES.length &&
    feedReportsQuery.data?.pages[0]?.meta
      ? feedReportsQuery.data.pages[0].meta.total
      : visibleFeedReports.length;
  const selectedMapReport = selectedMapReportId
    ? visibleReports.find((report) => report.id === selectedMapReportId)
    : null;
  const [searchParams] = useSearchParams();
  const { reportId: focusedReportId, focusTrigger } =
    readReportFocusParams(searchParams);
  const handledReportFocusRef = useRef<string | null>(null);

  const [viewport, setViewport] = useState({
    center: [106.8229, -6.1944] as [number, number],
    zoom: 12,
    pitch: 45,
    bearing: 0,
  });

  const selectedLocation = markerLocation || viewport.center;
  const {
    createReport,
    submitClarification,
    voteReport,
    rateReport,
    handleSubmitReport,
    handleSubmitClarification,
    handleVoteReport,
    handleRateReport,
  } = useCitizenDashboardActions({
    title,
    description,
    photoFiles,
    markerLocation,
    selectedLocation,
    searchedLocation,
    selectedMobileReport,
    setIsFormOpen,
    setMode,
    setTitle,
    setDescription,
    setPhotoPreviews,
    setPhotoFiles,
    setMarkerLocation,
    setSelectedMobileReport,
    onClarificationDraftActiveChange: handleClarificationDraftActiveChange,
  });
  const mapFocusPadding = useMemo(
    () =>
      isDesktop
        ? { top: 32, bottom: 32, left: 32, right: 32 }
        : { top: 112, bottom: 104, left: 20, right: 20 },
    [isDesktop],
  );

  const focusMapOnCoordinates = useCallback(
    (coords: [number, number], zoom = 15) => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: coords,
          zoom,
          duration: 1200,
          padding: mapFocusPadding,
        });
        return;
      }

      setViewport((prev) => ({ ...prev, center: coords, zoom }));
    },
    [mapFocusPadding],
  );

  const openReportCard = useCallback(
    (report: ReportLocation) => {
      if (report.status === "rejected") return;

      setFeedDetailReport(null);
      setViewMode("map");
      setMode("idle");
      setIsFormOpen(false);
      setShowSearch(false);
      focusMapOnCoordinates([report.lng, report.lat], 15);

      if (isDesktop) {
        setSelectedMobileReport(null);
        setSelectedMapReportId(report.id);
        return;
      }

      setSelectedMapReportId(null);
      setIsMyReportsOpen(false);
      setReportSheetHeight(68);
      setSelectedMobileReport(report);
    },
    [focusMapOnCoordinates, isDesktop, setViewMode],
  );

  const openReportDetail = useCallback((report: ReportLocation) => {
    if (report.status === "rejected") return;

    setViewMode("feed");
    setMode("idle");
    setIsFormOpen(false);
    setIsMyReportsOpen(false);
    setSelectedMapReportId(null);
    setSelectedMobileReport(null);
    setFeedDetailReport(report);
  }, [setViewMode]);

  const startReportSheetResize = (event: ReactPointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    reportSheetResizeMovedRef.current = false;
    reportSheetResizeRef.current = {
      startY: event.clientY,
      startHeight: reportSheetHeight,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const resizeState = reportSheetResizeRef.current;
      if (!resizeState) return;

      const deltaY = resizeState.startY - moveEvent.clientY;
      if (Math.abs(deltaY) > 2) {
        reportSheetResizeMovedRef.current = true;
      }

      const nextHeight =
        resizeState.startHeight + (deltaY / window.innerHeight) * 100;
      setReportSheetHeight(Math.min(82, Math.max(44, nextHeight)));
    };

    const handlePointerUp = () => {
      reportSheetResizeRef.current = null;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.longitude, pos.coords.latitude]);
      },
      () => {}, // silently fail
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideDesktopSearch = searchRef.current?.contains(target);
      const isInsideMobileSearch = mobileSearchRef.current?.contains(target);

      if (!isInsideDesktopSearch && !isInsideMobileSearch) {
        setShowSearch(false);
      }
    };
    if (showSearch) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSearch]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setShowSearch(false);

      if (viewMode === "feed") {
        setMode("idle");
        setSelectedMapReportId(null);
        setSelectedMobileReport(null);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [viewMode]);

  useEffect(() => {
    if (!activeClarificationReportId) return;

    const activeReport = visibleReports.find(
      (report) => report.id === activeClarificationReportId,
    );
    if (!activeReport || activeReport.status !== "clarification_requested") {
      const frame = window.requestAnimationFrame(() => {
        setActiveClarificationReportId(null);
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [activeClarificationReportId, visibleReports]);

  useEffect(() => {
    if (!focusedReportId) return;

    const focusKey = `${focusedReportId}:${focusTrigger ?? ""}`;
    if (handledReportFocusRef.current === focusKey) return;

    handledReportFocusRef.current = focusKey;
    const report = visibleReports.find((item) => item.id === focusedReportId);
    if (!report) {
      if (isPublicReportsFetched && (!session?.user || isMyReportsFetched)) {
        toast.error("Laporan tidak ditemukan", {
          description: "Data laporan dari notifikasi belum tersedia di peta.",
        });
      } else {
        handledReportFocusRef.current = null;
      }
      return;
    }

    const timer = window.setTimeout(() => {
      setIsMyReportsOpen(false);
      openReportCard(report);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    focusedReportId,
    focusTrigger,
    isMyReportsFetched,
    isPublicReportsFetched,
    openReportCard,
    session?.user,
    visibleReports,
  ]);

  const handleSelectPlace = useSelectSearchPlace({
    focusMapOnCoordinates,
    setSearchedLocation,
    setSearchQuery,
    setShowSearch,
    setViewMode,
  });

  const handleToggleReportStatusFilter = useCallback(
    (status: CitizenReportFilterStatus | "all") => {
      setReportStatusFilter((currentStatuses) => {
        if (status === "all") {
          const isAllSelected = CITIZEN_REPORT_FILTER_STATUSES.every((item) =>
            currentStatuses.includes(item),
          );

          return isAllSelected ? [] : CITIZEN_REPORT_FILTER_STATUSES;
        }

        const nextStatuses = currentStatuses.includes(status)
          ? currentStatuses.filter((item) => item !== status)
          : [...currentStatuses, status];
        const isAllStatusSelected = CITIZEN_REPORT_FILTER_STATUSES.every(
          (item) => nextStatuses.includes(item),
        );

        return isAllStatusSelected
          ? CITIZEN_REPORT_FILTER_STATUSES
          : nextStatuses;
      });
    },
    [],
  );

  const togglePinMode = useCallback(() => {
    setViewMode("map");
    if (mode === "pin_drop") {
      setMode("idle");

      setMarkerLocation(viewport.center);
    } else {
      setMode("pin_drop");
      setMarkerLocation(null);
      setIsFormOpen(false);
    }
  }, [mode, setViewMode, viewport.center]);

  const handleCreateReport = useCallback(() => {
    setViewMode("map");
    if (isFormOpen) {
      setIsFormOpen(false);
      return;
    }

    if (!markerLocation) {
      setMarkerLocation(viewport.center);
    }
    setIsFormOpen(true);
    setMode("idle");
  }, [isFormOpen, markerLocation, setViewMode, viewport.center]);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      // Check maximum 5 files
      if (photoFiles.length + newFiles.length > 5) {
        toast.error("Maksimal 5 foto per laporan");
        return;
      }
      const urls = createObjectUrls(newFiles);
      setPhotoFiles((prev) => [...prev, ...newFiles]);
      setPhotoPreviews((prev) => [...prev, ...urls]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews((prev) => {
      const removed = prev[index];
      if (removed) revokeObjectUrls([removed]);
      return prev.filter((_, i) => i !== index);
    });
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const mobileNavbarControls = useMemo(
    () => (
      <div ref={mobileSearchRef} className="relative flex flex-col gap-2">
        {viewMode === "map" && (
          <LocationSearchResultsDropdown
            isOpen={showSearch}
            query={searchQuery}
            isLoading={isSearching || searchQuery !== debouncedSearchQuery}
            results={searchResults}
            onSelectPlace={handleSelectPlace}
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
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setShowSearch(viewMode === "map");
              }}
              onFocus={() => setShowSearch(viewMode === "map")}
              placeholder={
                viewMode === "map" ? "Cari lokasi..." : "Cari isu..."
              }
              className="min-w-0 flex-1 bg-transparent py-1.5 text-xs font-bold text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>

          <button
            type="button"
            onClick={togglePinMode}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
              mode === "pin_drop"
                ? "bg-[#db2744] text-white shadow-sm shadow-red-500/20"
                : "text-gray-500 hover:bg-white hover:text-gray-900"
            }`}
            aria-label={mode === "pin_drop" ? "Pilih lokasi" : "Tandai lokasi"}
          >
            {mode === "pin_drop" ? (
              <Check size={15} strokeWidth={2.5} />
            ) : (
              <Target size={15} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMyReportsOpen((open) => !open)}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
              isMyReportsOpen
                ? "bg-[#db2744] text-white shadow-sm shadow-red-500/20"
                : "text-gray-500 hover:bg-white hover:text-gray-900"
            }`}
            aria-label="Buka Laporanku"
          >
            <ListFilter size={15} strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={handleCreateReport}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
              isFormOpen
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-[#db2744] text-white shadow-sm shadow-red-500/20 hover:bg-rose-600"
            }`}
            aria-label={isFormOpen ? "Tutup form laporan" : "Buat laporan"}
          >
            {isFormOpen ? (
              <X size={15} strokeWidth={2.5} />
            ) : (
              <Plus size={16} strokeWidth={2.5} />
            )}
          </button>
        </div>

        <CitizenDashboardFilters
          value={reportStatusFilter}
          onChange={handleToggleReportStatusFilter}
          showAgencies={showAgencyMarkers}
          onToggleAgencies={() => setShowAgencyMarkers((current) => !current)}
          showAgencyToggle={viewMode === "map"}
          className="w-full"
        />
      </div>
    ),
    [
      debouncedSearchQuery,
      handleCreateReport,
      handleSelectPlace,
      handleToggleReportStatusFilter,
      isFormOpen,
      isMyReportsOpen,
      isSearching,
      mode,
      reportStatusFilter,
      searchQuery,
      searchResults,
      showAgencyMarkers,
      showSearch,
      togglePinMode,
      viewMode,
    ],
  );

  useEffect(() => {
    setMobileControls(mobileNavbarControls);
  }, [mobileNavbarControls, setMobileControls]);

  useEffect(() => () => setMobileControls(null), [setMobileControls]);

  return (
    <div className="relative w-full h-full bg-gray-100 flex overflow-hidden">
      <div className="flex-1 relative h-full rounded-r-3xl md:rounded-none overflow-hidden">
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

          {visibleReports.map((report) => {
            const isClarificationReport =
              report.status === "clarification_requested";
            const isActiveClarificationReport =
              report.id === activeClarificationReportId;
            const markerOuterClass = isActiveClarificationReport
              ? "bg-violet-500/25 ring-4 ring-violet-300/55"
              : isClarificationReport
                ? "bg-violet-500/20"
                : "bg-[#db2744]/20";
            const markerInnerClass = isActiveClarificationReport
              ? "scale-125 border-white bg-violet-600 shadow-violet-500/70 hover:bg-violet-700"
              : isClarificationReport
                ? "border-white bg-violet-500 shadow-violet-500/50 hover:bg-violet-600"
                : "border-white bg-[#db2744] shadow-red-500/50 hover:bg-rose-500";

            return (
              <MapMarker
                key={report.id}
                longitude={report.lng}
                latitude={report.lat}
                onClick={
                  !isDesktop
                    ? () => {
                        setReportSheetHeight(68);
                        setSelectedMobileReport(report);
                      }
                    : undefined
                }
              >
                {isDesktop && (
                  <MarkerPopup
                    closeButton
                    className="overflow-hidden rounded-sm border border-gray-100 bg-white p-0 shadow-[0_18px_44px_rgba(15,23,42,0.18)]"
                  >
                    <ReportPopup
                      key={report.id}
                      report={report}
                      onPhotoClick={openLightbox}
                      onVote={handleVoteReport}
                      onSubmitClarification={handleSubmitClarification}
                      onClarificationDraftActiveChange={
                        handleClarificationDraftActiveChange
                      }
                      clarificationSubmittingId={
                        submitClarification.isPending
                          ? submitClarification.variables?.id
                          : null
                      }
                      isVoting={
                        voteReport.isPending &&
                        voteReport.variables?.id === report.id
                      }
                    />
                  </MarkerPopup>
                )}
                <MarkerContent
                  className={
                    isActiveClarificationReport
                      ? "[&>*]:!z-[60]"
                      : "[&>*]:!z-[10]"
                  }
                >
                  <div
                    className={`relative flex h-10 w-10 -ml-5 -mt-5 items-center justify-center rounded-full transition-all ${markerOuterClass}`}
                    style={{ zIndex: isActiveClarificationReport ? 60 : 10 }}
                  >
                    {isActiveClarificationReport && (
                      <span className="absolute inset-0 rounded-full bg-violet-400/35 animate-ping" />
                    )}
                    <div
                      className={`relative flex h-6 w-6 items-center justify-center rounded-full border-2 shadow-lg transition-all ${markerInnerClass}`}
                    >
                      <AlertTriangle
                        size={12}
                        className="text-white"
                        strokeWidth={3}
                      />
                    </div>
                  </div>
                </MarkerContent>
              </MapMarker>
            );
          })}

          {isDesktop && selectedMapReport && (
            <MapPopup
              longitude={selectedMapReport.lng}
              latitude={selectedMapReport.lat}
              closeButton
              onClose={() => setSelectedMapReportId(null)}
              className="overflow-hidden rounded-sm border border-gray-100 bg-white p-0 shadow-[0_18px_44px_rgba(15,23,42,0.18)]"
            >
              <ReportPopup
                key={selectedMapReport.id}
                report={selectedMapReport}
                onPhotoClick={openLightbox}
                onVote={handleVoteReport}
                onSubmitClarification={handleSubmitClarification}
                onClarificationDraftActiveChange={
                  handleClarificationDraftActiveChange
                }
                clarificationSubmittingId={
                  submitClarification.isPending
                    ? submitClarification.variables?.id
                    : null
                }
                isVoting={
                  voteReport.isPending &&
                  voteReport.variables?.id === selectedMapReport.id
                }
              />
            </MapPopup>
          )}

          {showAgencyMarkers && agencies.map((agency, idx) => (
            <MapMarker
              key={`agency-${agency.id || idx}`}
              longitude={agency.lng}
              latitude={agency.lat}
            >
              <MarkerPopup
                closeButton
                className="overflow-hidden rounded-sm border border-gray-100 bg-white p-0 shadow-[0_18px_44px_rgba(15,23,42,0.18)]"
              >
                <div className="w-[200px] flex flex-col overflow-hidden">
                  <AgencyPopupCarousel
                    agency={agency}
                    onPhotoClick={openLightbox}
                  />
                  <div className="p-3 pb-4 flex flex-col gap-1.5 relative">
                    <div
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm w-fit truncate max-w-full ${agency.photos?.length > 0 || agency.photoUrl ? "text-indigo-600 bg-indigo-50 absolute -top-8 left-3 shadow-md border border-indigo-100/50" : "text-indigo-600 bg-indigo-50"}`}
                    >
                      {agency.type?.replace(/_/g, " ") || "Dinas"}
                    </div>
                    <div className="text-xs font-bold text-gray-900 leading-tight">
                      {agency.name}
                    </div>
                  </div>
                </div>
              </MarkerPopup>
              <MarkerContent>
                <div
                  className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-indigo-200 shadow-lg flex items-center justify-center -mt-4 text-indigo-600 hover:scale-110 hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all cursor-pointer"
                  style={{ zIndex: 20 }}
                >
                  <Building2 size={14} strokeWidth={2.5} />
                </div>
              </MarkerContent>
            </MapMarker>
          ))}

          {searchedLocation && (
            <MapMarker
              longitude={searchedLocation.coords[0]}
              latitude={searchedLocation.coords[1]}
            >
              <MarkerContent>
                <div
                  className="flex flex-col items-center -mt-10 pointer-events-none"
                  style={{ zIndex: 30 }}
                >
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

          {/* Layer 4: Lokasi user */}
          {userLocation && (
            <MapMarker longitude={userLocation[0]} latitude={userLocation[1]}>
              <MarkerContent>
                <div
                  className="flex flex-col items-center -mt-6 pointer-events-none"
                  style={{ zIndex: 40 }}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center animate-ping absolute inset-0" />
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-emerald-500 relative z-10 overflow-hidden">
                      {session?.user?.image ? (
                        <img
                          src={session.user.image}
                          alt="Profil Anda"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                          <User
                            size={18}
                            className="text-emerald-600"
                            strokeWidth={2.5}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-200 shadow-sm">
                    Lokasi Anda
                  </span>
                </div>
              </MarkerContent>
            </MapMarker>
          )}

          {/* Layer 5 (teratas): Pin drop mode */}
          {mode === "pin_drop" && (
            <MapMarker
              longitude={viewport.center[0]}
              latitude={viewport.center[1]}
            >
              <MarkerContent>
                <div
                  className="flex flex-col items-center -mt-8 pointer-events-none"
                  style={{ zIndex: 100 }}
                >
                  <div className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg mb-1.5 animate-bounce">
                    Geser Peta ke Lokasi
                  </div>
                  <div className="w-10 h-10 flex items-center justify-center">
                    <MapPin
                      size={38}
                      className="text-[#db2744] drop-shadow-xl"
                      fill="#db2744"
                      stroke="white"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </MarkerContent>
            </MapMarker>
          )}

          {/* Layer 5 (teratas): Marker lokasi laporan yang dipilih */}
          {markerLocation && mode === "idle" && (
            <MapMarker
              longitude={markerLocation[0]}
              latitude={markerLocation[1]}
              draggable={true}
              onDragEnd={(e: { lng: number; lat: number }) =>
                setMarkerLocation([e.lng, e.lat])
              }
            >
              <MarkerContent>
                <div
                  className="flex flex-col items-center -mt-8 cursor-grab active:cursor-grabbing"
                  style={{ zIndex: 100 }}
                >
                  <div className="bg-[#db2744] text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg mb-1 whitespace-nowrap opacity-90 hover:opacity-100">
                    Bisa digeser
                  </div>
                  <div className="w-10 h-10 flex items-center justify-center">
                    <MapPin
                      size={38}
                      className="text-[#db2744] drop-shadow-xl"
                      fill="#db2744"
                      stroke="white"
                      strokeWidth={2}
                    />
                  </div>
                </div>
              </MarkerContent>
            </MapMarker>
          )}
        </Map>

        {viewMode === "feed" && feedDetailReport ? (
          <CitizenFeedReportDetail
            report={feedDetailReport}
            onBack={() => setFeedDetailReport(null)}
            onNavigateMap={() => openReportCard(feedDetailReport)}
            onPhotoClick={openLightbox}
            onVote={handleVoteReport}
            isVoting={
              voteReport.isPending &&
              voteReport.variables?.id === feedDetailReport.id
            }
            onSubmitClarification={handleSubmitClarification}
            onClarificationDraftActiveChange={
              handleClarificationDraftActiveChange
            }
            clarificationSubmittingId={
              submitClarification.isPending
                ? submitClarification.variables?.id
                : null
            }
          />
        ) : viewMode === "feed" ? (
          <CitizenSocialFeed
            reports={visibleFeedReports}
            totalCount={totalVisibleFeedReports}
            onPhotoClick={openLightbox}
            onVote={handleVoteReport}
            onOpenReportDetail={openReportDetail}
            onOpenMyReports={(report) => {
              setIsMyReportsOpen(true);
              setSelectedMobileReport(null);
              setMyReportsSearch(report.title);
            }}
            onLoadMore={() => {
              if (
                feedReportsQuery.hasNextPage &&
                !feedReportsQuery.isFetchingNextPage
              ) {
                void feedReportsQuery.fetchNextPage();
              }
            }}
            hasNextPage={feedReportsQuery.hasNextPage}
            isLoading={feedReportsQuery.isLoading}
            isFetchingNextPage={feedReportsQuery.isFetchingNextPage}
            votingReportId={
              voteReport.isPending ? voteReport.variables?.id : null
            }
          />
        ) : null}

        <div className="absolute bottom-5 left-0 right-0 z-20 hidden flex-col items-center gap-2 px-4 pointer-events-none sm:flex">
          {/* Search Results Dropdown */}
          {viewMode === "map" && (
            <LocationSearchResultsDropdown
              isOpen={showSearch}
              query={searchQuery}
              isLoading={isSearching || searchQuery !== debouncedSearchQuery}
              results={searchResults}
              onSelectPlace={handleSelectPlace}
              className="max-w-[460px] md:max-w-[600px]"
            />
          )}

          <div
            ref={searchRef}
            className="w-full max-w-[520px] md:max-w-[700px] pointer-events-auto"
          >
            <div className="bg-white rounded-full shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)] border border-gray-100 flex items-center px-2 py-1.5 gap-1">
              <div className="flex items-center flex-1 gap-1 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 min-w-0">
                <Search
                  size={15}
                  strokeWidth={2.5}
                  className="text-[#db2744] shrink-0"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearch(viewMode === "map");
                  }}
                  onFocus={() => setShowSearch(viewMode === "map")}
                  placeholder={
                    viewMode === "map" ? "Cari lokasi..." : "Cari isu..."
                  }
                  className="bg-transparent border-none outline-none text-xs font-bold text-gray-900 placeholder:text-gray-400 w-full py-1.5"
                />
              </div>

              <div className="w-px h-5 bg-gray-200 shrink-0 mx-0.5" />

              <CitizenDashboardFilters
                value={reportStatusFilter}
                onChange={handleToggleReportStatusFilter}
                showAgencies={showAgencyMarkers}
                onToggleAgencies={() =>
                  setShowAgencyMarkers((current) => !current)
                }
                showAgencyToggle={viewMode === "map"}
              />

              <div className="w-px h-5 bg-gray-200 shrink-0 mx-0.5" />

              <button
                onClick={togglePinMode}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full transition-all duration-300 font-bold shrink-0 ${
                  mode === "pin_drop"
                    ? "bg-[#db2744] text-white shadow-md shadow-red-500/20"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {mode === "pin_drop" ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : (
                  <Target size={16} />
                )}
                <span className="text-xs hidden sm:inline">
                  {mode === "pin_drop" ? "Pilih" : "Tandai"}
                </span>
              </button>

              <div className="w-px h-5 bg-gray-200 shrink-0 mx-0.5" />

              <button
                onClick={() => setIsMyReportsOpen((open) => !open)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full transition-all duration-300 font-bold shrink-0 ${
                  isMyReportsOpen
                    ? "bg-[#db2744] text-white shadow-md shadow-red-500/20"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ListFilter size={16} />
                <span className="text-xs hidden sm:inline">Laporanku</span>
              </button>

              <div className="w-px h-5 bg-gray-200 shrink-0 mx-0.5" />

              <button
                onClick={handleCreateReport}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full transition-all duration-300 font-bold shrink-0 ${
                  isFormOpen
                    ? "bg-gray-900 text-white shadow-md"
                    : "bg-[#db2744] text-white shadow-md shadow-red-500/20 hover:bg-rose-600"
                }`}
              >
                {isFormOpen ? (
                  <X size={16} />
                ) : (
                  <Plus size={16} strokeWidth={2.5} />
                )}
                <span className="text-xs hidden sm:inline">
                  {isFormOpen ? "Tutup" : "Buat Laporan"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <CitizenReportFormPanel
        isOpen={isFormOpen}
        isDesktop={isDesktop}
        title={title}
        description={description}
        photoPreviews={photoPreviews}
        selectedLocation={selectedLocation}
        userLocation={userLocation}
        isSubmitting={createReport.isPending}
        onClose={() => setIsFormOpen(false)}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onPhotoUpload={handlePhotoUpload}
        onRemovePhoto={removePhoto}
        onPhotoClick={openLightbox}
        onEditLocation={() => {
          setIsFormOpen(false);
          setMode("idle");
        }}
        onUseGpsLocation={() => {
          if (!userLocation) return;
          setMarkerLocation(userLocation);
          focusMapOnCoordinates(userLocation, 15);
        }}
        onSubmit={handleSubmitReport}
      />

      {/* My Reports Drawer/Panel */}
      <CitizenMyReportsPanel
        isOpen={isMyReportsOpen}
        isDesktop={isDesktop}
        myReports={myReports}
        myReportsSearch={myReportsSearch}
        statusMap={CITIZEN_REPORT_STATUS_MAP}
        onSearchChange={setMyReportsSearch}
        onClose={() => setIsMyReportsOpen(false)}
        onPhotoClick={openLightbox}
        onSubmitClarification={handleSubmitClarification}
        onClarificationDraftActiveChange={handleClarificationDraftActiveChange}
        clarificationSubmittingId={
          submitClarification.isPending
            ? submitClarification.variables?.id
            : null
        }
        onSubmitRating={handleRateReport}
        ratingSubmittingId={
          rateReport.isPending ? rateReport.variables?.id : null
        }
        onFocusReport={openReportCard}
      />

      {/* Mobile report bottom sheet */}
      <AnimatePresence>
        {selectedMobileReport && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-gray-950/45 backdrop-blur-[2px]"
              onClick={() => setSelectedMobileReport(null)}
            />
            <motion.div
              initial={isDesktop ? { scale: 0.96, opacity: 0 } : { y: "100%", opacity: 0 }}
              animate={{
                ...(isDesktop ? { scale: 1 } : { y: 0 }),
                opacity: 1,
                height: `${reportSheetHeight}vh`,
              }}
              exit={isDesktop ? { scale: 0.96, opacity: 0 } : { y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 38 }}
              className={`absolute z-50 flex flex-col overflow-hidden bg-white ${
                isDesktop
                  ? "left-[max(1rem,calc(50%-260px))] top-[7vh] max-h-[86vh] w-[520px] max-w-[calc(100vw-2rem)] rounded-sm shadow-[0_24px_72px_rgba(15,23,42,0.28)]"
                  : "inset-x-0 bottom-0 rounded-t-2xl shadow-[0_-20px_48px_rgba(15,23,42,0.24)]"
              }`}
            >
              {!isDesktop && (
                <button
                  type="button"
                  onClick={() => {
                    if (reportSheetResizeMovedRef.current) return;
                    setReportSheetHeight((height) => (height > 78 ? 68 : 82));
                  }}
                  onPointerDown={startReportSheetResize}
                  className="flex w-full touch-none justify-center bg-white pt-3 pb-2 cursor-grab active:cursor-grabbing"
                  aria-label={
                    reportSheetHeight > 78
                      ? "Perkecil detail laporan"
                      : "Perbesar detail laporan"
                  }
                >
                  <span className="h-1.5 w-12 rounded-full bg-gray-200" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedMobileReport(null)}
                className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-sm ring-1 ring-gray-200/70 backdrop-blur transition-colors hover:bg-white hover:text-gray-900"
                aria-label="Tutup detail laporan"
              >
                <X size={16} strokeWidth={2.5} />
              </button>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <ReportPopup
                  key={selectedMobileReport.id}
                  report={selectedMobileReport}
                  onPhotoClick={openLightbox}
                  onVote={handleVoteReport}
                  onSubmitClarification={handleSubmitClarification}
                  onClarificationDraftActiveChange={
                    handleClarificationDraftActiveChange
                  }
                  clarificationSubmittingId={
                    submitClarification.isPending
                      ? submitClarification.variables?.id
                      : null
                  }
                  isVoting={
                    voteReport.isPending &&
                    voteReport.variables?.id === selectedMobileReport.id
                  }
                  fullWidth
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox && (
          <PhotoLightbox
            images={lightbox.images}
            index={lightbox.index}
            onClose={closeLightbox}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
