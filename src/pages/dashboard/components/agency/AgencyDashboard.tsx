import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  type MapRef,
} from "@/components/ui/map";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ListFilter,
  Navigation,
  User,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router";
import type {
  ReportsDashboardTabKey,
  DashboardReportItem,
  ReportLocation,
  ReportsScope,
} from "@/api/reports";
import {
  useInfiniteQueryGetReportLocations,
  useMutationResolveReport,
  useMutationUpdateReportStatus,
} from "@/api/reports";
import { useGetReportLocations } from "@/hooks/reports/useGetReportLocations";
import { useDebouncedValue } from "@/hooks/common";
import {
  useQuerySearchLocation,
  useSelectSearchPlace,
} from "@/hooks/search";
import { QUERY_KEYS } from "@/api/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { createObjectUrls, revokeObjectUrls } from "@/lib/object-url";
import { readReportFocusParams } from "@/lib/report-focus-navigation";
import { useDashboardViewMode } from "@/context/dashboard-view-mode";
import {
  AgencyDashboardFilters,
  AgencyFeedReportDetail,
  AgencyMobileNavbarControls,
  AgencyReportDetailDrawer,
  AgencyReportsBottomSheet,
  AgencyReportsSidebar,
  AgencySocialFeed,
} from "@/pages/dashboard/components/agency";
import { LocationSearchResultsDropdown } from "@/pages/dashboard/components/shared";
import {
  PhotoLightbox,
  type PhotoLightboxState,
} from "@/pages/dashboard/components/shared";
import {
  AGENCY_REPORT_STATUS_MAP,
  getDashboardStatusToneStyle,
  hasValidCoordinatePair,
  hasValidLngLat,
} from "@/pages/dashboard/utils";
import {
  ALL_AGENCY_DASHBOARD_TAB_KEYS,
  DEFAULT_REPORTS_DASHBOARD_SUMMARY,
  DEFAULT_REPORTS_DASHBOARD_TABS,
  REPORT_SCOPE_OPTIONS,
  SUMMARY_CARD_META,
  isOwnedAgencyDashboardReport,
  isOwnedAgencyLocationReport,
  matchesAgencyDashboardSearch,
  matchesAgencyDashboardTabs,
  matchesDashboardItemTabs,
  toAgencyDashboardReport,
} from "@/pages/dashboard/config";

const EMPTY_LOCATION_REPORTS: ReportLocation[] = [];

export default function AgencyDashboard() {
  const [activeTabs, setActiveTabs] = useState<ReportsDashboardTabKey[]>(
    ALL_AGENCY_DASHBOARD_TAB_KEYS,
  );
  const [scope, setScope] = useState<ReportsScope>("mine");
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [feedDetailReportId, setFeedDetailReportId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState<string | null>(null);
  const [agencyNote, setAgencyNote] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolutionProofFiles, setResolutionProofFiles] = useState<File[]>([]);
  const [resolutionProofPreviews, setResolutionProofPreviews] = useState<string[]>([]);
  const resolutionProofPreviewsRef = useRef<string[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [reportSearchQuery, setReportSearchQuery] = useState("");
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState<{
    name: string;
    coords: [number, number];
  } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef | null>(null);
  const handledReportFocusRef = useRef<string | null>(null);
  const [searchParams] = useSearchParams();
  const { reportId: focusedReportId, focusTrigger } =
    readReportFocusParams(searchParams);
  const queryClient = useQueryClient();
  const { viewMode, setViewMode, setMobileControls } = useDashboardViewMode();
  const [lightbox, setLightbox] = useState<PhotoLightboxState>(null);
  const openLightbox = useCallback((images: string[], index: number) => setLightbox({ images, index }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const debouncedReportSearchQuery = useDebouncedValue(reportSearchQuery, 400).trim();
  const debouncedLocationSearchQuery = useDebouncedValue(locationSearchQuery, 400);
  const isFeedMode = viewMode === "feed";
  const isReportsDashboardOpen = isSidebarOpen && !isFeedMode;
  const reportLocationParams = useMemo(() => ({ scope }), [scope]);
  const agencyFeedParams = useMemo(
    () => ({
      scope,
      limit: 5,
      search: debouncedReportSearchQuery || undefined,
      sort: "newest" as const,
    }),
    [debouncedReportSearchQuery, scope],
  );

  useEffect(() => {
    resolutionProofPreviewsRef.current = resolutionProofPreviews;
  }, [resolutionProofPreviews]);

  useEffect(() => {
    return () => revokeObjectUrls(resolutionProofPreviewsRef.current);
  }, []);

  const {
    data: reportLocationsData,
    isFetched: isReportLocationsFetched,
    isLoading: isReportLocationsLoading,
  } =
    useGetReportLocations(reportLocationParams, {
      placeholderData: undefined,
      refetchOnMount: "always",
    });
  const agencyFeedReportsQuery = useInfiniteQueryGetReportLocations(
    agencyFeedParams,
    { enabled: isFeedMode },
  );
  const { data: locationSearchResults = [], isFetching: isSearchingLocations } =
    useQuerySearchLocation(debouncedLocationSearchQuery, {
      enabled: viewMode === "map",
    });

  const locationReports = (reportLocationsData?.data ?? EMPTY_LOCATION_REPORTS).filter(hasValidLngLat);
  const feedLocationReports = useMemo(() => {
    const seenIds = new Set<string>();
    const reports = (
      agencyFeedReportsQuery.data?.pages.flatMap((page) => page.data) ?? []
    ).filter(hasValidLngLat);

    return reports.filter((report) => {
      if (seenIds.has(report.id)) {
        return false;
      }

      seenIds.add(report.id);
      return true;
    });
  }, [agencyFeedReportsQuery.data]);
  const allKnownLocationReports = useMemo(() => {
    const knownReports = new globalThis.Map<string, ReportLocation>();

    locationReports.forEach((report) => knownReports.set(report.id, report));
    feedLocationReports.forEach((report) => knownReports.set(report.id, report));

    return Array.from(knownReports.values());
  }, [feedLocationReports, locationReports]);
  const dashboardReports = useMemo(
    () =>
      locationReports
        .filter((report) =>
          matchesAgencyDashboardSearch(report, debouncedReportSearchQuery),
        )
        .map(toAgencyDashboardReport)
        .filter((report): report is DashboardReportItem => Boolean(report)),
    [debouncedReportSearchQuery, locationReports],
  );
  const dashboardTabs = DEFAULT_REPORTS_DASHBOARD_TABS;
  const isDashboardListLoading =
    isReportLocationsLoading && dashboardReports.length === 0;
  const scopedDashboardReports = useMemo(
    () =>
      dashboardReports.filter(
        (report) => scope === "all" || isOwnedAgencyDashboardReport(report),
      ),
    [dashboardReports, scope],
  );
  const scopedDashboardSummary = useMemo(
    () => ({
      totalTarget: scopedDashboardReports.length,
      laporanBaru: scopedDashboardReports.filter(
        (report) => report.dashboardGroup === "baru",
      ).length,
      diproses: scopedDashboardReports.filter(
        (report) => report.dashboardGroup === "diproses",
      ).length,
      klarifikasi: scopedDashboardReports.filter(
        (report) => report.dashboardGroup === "klarifikasi",
      ).length,
      tuntas: scopedDashboardReports.filter(
        (report) => report.dashboardGroup === "tuntas",
      ).length,
      byStatusRaw: DEFAULT_REPORTS_DASHBOARD_SUMMARY.byStatusRaw,
    }),
    [scopedDashboardReports],
  );
  const scopedDashboardTabs = useMemo(
    () =>
      dashboardTabs.map((tab) => ({
        ...tab,
        total:
          tab.key === "semua"
            ? scopedDashboardReports.length
            : scopedDashboardReports.filter(
                (report) => report.dashboardGroup === tab.key,
              ).length,
      })),
    [dashboardTabs, scopedDashboardReports],
  );
  const summaryStats = useMemo(
    () =>
      SUMMARY_CARD_META.map((item) => ({
        ...item,
        value: scopedDashboardSummary[item.key] ?? 0,
      })),
    [scopedDashboardSummary],
  );
  const visibleMapReports = locationReports.filter((report) => {
    return (
      (scope === "all" || isOwnedAgencyLocationReport(report)) &&
      matchesAgencyDashboardTabs(report.status, activeTabs) &&
      matchesAgencyDashboardSearch(report, debouncedReportSearchQuery)
    );
  });
  const visibleDashboardReports = scopedDashboardReports.filter((report) =>
    matchesDashboardItemTabs(report, activeTabs),
  );
  const totalVisibleDashboardReports = visibleDashboardReports.length;
  const isAllFeedStatusSelected = ALL_AGENCY_DASHBOARD_TAB_KEYS.filter(
    (tab) => tab !== "semua",
  ).every((tab) => activeTabs.includes(tab));
  const feedDashboardReports = useMemo(
    () =>
      feedLocationReports
        .filter((report) =>
          matchesAgencyDashboardSearch(report, debouncedReportSearchQuery),
        )
        .map(toAgencyDashboardReport)
        .filter((report): report is DashboardReportItem => Boolean(report))
        .filter(
          (report) => scope === "all" || isOwnedAgencyDashboardReport(report),
        )
        .filter((report) => matchesDashboardItemTabs(report, activeTabs)),
    [activeTabs, debouncedReportSearchQuery, feedLocationReports, scope],
  );
  const totalVisibleFeedReports =
    isAllFeedStatusSelected && agencyFeedReportsQuery.data?.pages[0]?.meta
      ? agencyFeedReportsQuery.data.pages[0].meta.total
      : feedDashboardReports.length;
  const isFeedListLoading =
    agencyFeedReportsQuery.isLoading && feedDashboardReports.length === 0;
  const selectedReport = allKnownLocationReports.find(
    (report) => report.id === selectedMarkerId,
  );
  const feedDetailReport = allKnownLocationReports.find(
    (report) => report.id === feedDetailReportId,
  );
  const canEditSelectedReport = selectedReport?.canEdit === true;
  const isDraftResolved = draftStatus === "resolved";
  const requiredNote = isDraftResolved ? resolutionNote : agencyNote;
  const hasDraftChanges = selectedReport
    ? (
        draftStatus !== selectedReport.status ||
        (!isDraftResolved &&
          agencyNote.trim() !== (selectedReport.agencyNote ?? "").trim()) ||
        (isDraftResolved &&
          resolutionNote.trim() !==
            (selectedReport.resolutionNote ?? "").trim()) ||
        resolutionProofFiles.length > 0
      )
    : false;
  const isSaveDisabled =
    !selectedReport ||
    !draftStatus ||
    !canEditSelectedReport ||
    !hasDraftChanges ||
    requiredNote.trim().length === 0 ||
    resolutionProofFiles.length === 0;
  const handleAgencyMutationSuccess = async (status: ReportLocation["status"]) => {
    await Promise.allSettled([
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REPORTS_LOCATIONS] }),
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REPORTS_DASHBOARD] }),
    ]);

    toast.success("Update tiket berhasil dikirim", {
      description:
        status === "resolved"
          ? "Laporan ditandai selesai dan perubahan sudah tersimpan."
          : "Catatan penanganan terbaru sudah masuk ke tiket.",
    });
    revokeObjectUrls(resolutionProofPreviews);
    setResolutionProofFiles([]);
    setResolutionProofPreviews([]);
    if (!feedDetailReportId) {
      setSelectedMarkerId(null);
    }
  };

  const handleAgencyMutationError = (error: unknown) => {
    toast.error("Gagal mengirim update tiket", {
      description: getApiErrorMessage(error, "Gagal memperbarui tiket."),
    });
  };

  const updateReportStatus = useMutationUpdateReportStatus({
    onSuccess: async () => {
      await handleAgencyMutationSuccess((draftStatus as ReportLocation["status"]) || "verified");
    },
    onError: handleAgencyMutationError,
  });

  const resolveReport = useMutationResolveReport({
    onSuccess: async () => {
      await handleAgencyMutationSuccess("resolved");
    },
    onError: handleAgencyMutationError,
  });

  const [viewport, setViewport] = useState({
    center: [106.8229, -6.1944] as [number, number],
    zoom: 12,
    pitch: 45,
    bearing: 0,
  });
  const hasSelectedReport = !!selectedReport;
  const mapFocusPadding = useMemo(
    () =>
      isDesktop
        ? {
            top: 32,
            bottom: 40,
            left: isReportsDashboardOpen ? 420 : 32,
            right: hasSelectedReport ? 460 : 32,
          }
        : { top: 112, bottom: 104, left: 20, right: 20 },
    [hasSelectedReport, isDesktop, isReportsDashboardOpen],
  );

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideDesktopSearch = searchRef.current?.contains(target);
      const isInsideMobileSearch = mobileSearchRef.current?.contains(target);

      if (
        !isInsideDesktopSearch &&
        !isInsideMobileSearch
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

  useEffect(() => {
    if (selectedMarkerId && !selectedReport) {
      const frame = window.requestAnimationFrame(() => {
        setSelectedMarkerId(null);
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [selectedMarkerId, selectedReport]);

  useEffect(() => {
    if (feedDetailReportId && !feedDetailReport) {
      const frame = window.requestAnimationFrame(() => {
        setFeedDetailReportId(null);
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [feedDetailReportId, feedDetailReport]);

  const focusMapOnCoordinates = useCallback((coords: [number, number], zoom = 15) => {
    if (!hasValidCoordinatePair(coords)) return;

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
  }, [mapFocusPadding, setViewport]);

  const handleSaveStatus = () => {
    if (!draftStatus || !selectedMarkerId || !selectedReport || isSaveDisabled) {
      return;
    }

    const trimmedAgencyNote = agencyNote.trim() || null;
    const trimmedResolutionNote = resolutionNote.trim() || null;

    if (draftStatus === "resolved") {
      resolveReport.mutate({
        id: selectedMarkerId,
        payload: {
          agencyNote: null,
          catatanDinas: null,
          resolutionNote: trimmedResolutionNote,
          resolutionImages: resolutionProofFiles,
        },
      });
      return;
    }

    updateReportStatus.mutate({
      id: selectedMarkerId,
      payload: {
        status: draftStatus as ReportLocation["status"],
        agencyNote: trimmedAgencyNote,
        catatanDinas: trimmedAgencyNote,
        resolutionNote: null,
        images: resolutionProofFiles,
      },
    });
  };

  const handleSelectReport = useCallback((reportId: string) => {
    setFeedDetailReportId(null);
    setViewMode("map");
    setSelectedMarkerId(reportId);

    const locationReport = allKnownLocationReports.find(
      (item) => item.id === reportId,
    );
    const dashboardReport = dashboardReports.find(
      (item) => item.id === reportId,
    );

    if (locationReport) {
      focusMapOnCoordinates([locationReport.lng, locationReport.lat], 15);
      setDraftStatus(locationReport.status);
      setAgencyNote(locationReport.agencyNote ?? "");
      setResolutionNote(locationReport.resolutionNote ?? "");
      revokeObjectUrls(resolutionProofPreviews);
      setResolutionProofFiles([]);
      setResolutionProofPreviews([]);
      return;
    }

    if (dashboardReport) {
      setDraftStatus(dashboardReport.status);
      setAgencyNote("");
      setResolutionNote("");
      revokeObjectUrls(resolutionProofPreviews);
      setResolutionProofFiles([]);
      setResolutionProofPreviews([]);
    }
  }, [
    dashboardReports,
    focusMapOnCoordinates,
    allKnownLocationReports,
    resolutionProofPreviews,
    setViewMode,
  ]);

  const prepareReportDraft = useCallback((reportId: string) => {
    setSelectedMarkerId(reportId);

    const locationReport = allKnownLocationReports.find(
      (item) => item.id === reportId,
    );
    const dashboardReport = dashboardReports.find(
      (item) => item.id === reportId,
    );

    if (locationReport) {
      setDraftStatus(locationReport.status);
      setAgencyNote(locationReport.agencyNote ?? "");
      setResolutionNote(locationReport.resolutionNote ?? "");
      revokeObjectUrls(resolutionProofPreviews);
      setResolutionProofFiles([]);
      setResolutionProofPreviews([]);
      return;
    }

    if (dashboardReport) {
      setDraftStatus(dashboardReport.status);
      setAgencyNote("");
      setResolutionNote("");
      revokeObjectUrls(resolutionProofPreviews);
      setResolutionProofFiles([]);
      setResolutionProofPreviews([]);
    }
  }, [
    dashboardReports,
    allKnownLocationReports,
    resolutionProofPreviews,
  ]);

  const handleOpenReportDetail = useCallback((reportId: string) => {
    setViewMode("feed");
    setFeedDetailReportId(reportId);
    prepareReportDraft(reportId);
  }, [prepareReportDraft, setViewMode]);

  const handleScopeChange = useCallback((nextScope: ReportsScope) => {
    if (scope === nextScope) {
      return;
    }

    setSelectedMarkerId(null);
    setFeedDetailReportId(null);
    queryClient.removeQueries({ queryKey: [QUERY_KEYS.REPORTS_LOCATIONS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REPORTS_LOCATIONS] });
    setScope(nextScope);
  }, [queryClient, scope]);

  useEffect(() => {
    if (viewMode !== "feed" || feedDetailReportId || !selectedMarkerId) {
      return;
    }

    const selectedReportStillVisible = allKnownLocationReports.some(
      (report) => report.id === selectedMarkerId,
    );

    if (!selectedReportStillVisible) return;

    const frame = requestAnimationFrame(() => {
      setFeedDetailReportId(selectedMarkerId);
      prepareReportDraft(selectedMarkerId);
    });

    return () => cancelAnimationFrame(frame);
  }, [
    feedDetailReportId,
    allKnownLocationReports,
    prepareReportDraft,
    selectedMarkerId,
    viewMode,
  ]);

  useEffect(() => {
    if (viewMode !== "map" || !feedDetailReportId) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      handleSelectReport(feedDetailReportId);
    });

    return () => cancelAnimationFrame(frame);
  }, [feedDetailReportId, handleSelectReport, viewMode]);

  const toggleReportsDashboard = useCallback(() => {
    setViewMode("map");
    setIsSidebarOpen((open) => !open);
  }, [setViewMode]);

  useEffect(() => {
    if (!focusedReportId) return;

    const focusKey = `${focusedReportId}:${focusTrigger ?? ""}`;
    if (handledReportFocusRef.current === focusKey) return;

    handledReportFocusRef.current = focusKey;
    const report = locationReports.find((item) => item.id === focusedReportId);
    if (!report) {
      if (isReportLocationsFetched) {
        toast.error("Laporan tidak ditemukan", {
          description: "Data laporan dari notifikasi belum tersedia di peta.",
        });
      } else {
        handledReportFocusRef.current = null;
      }
      return;
    }

    const timer = window.setTimeout(() => {
      setIsSidebarOpen(false);
      handleSelectReport(report.id);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    focusTrigger,
    focusedReportId,
    handleSelectReport,
    isReportLocationsFetched,
    locationReports,
  ]);

  const handleResolutionProofUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const nextFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (nextFiles.length === 0) {
      toast.error("Bukti resolusi harus berupa gambar");
      return;
    }
    if (resolutionProofFiles.length + nextFiles.length > 5) {
      toast.error("Maksimal 5 foto bukti update");
      return;
    }
    setResolutionProofFiles((prev) => [...prev, ...nextFiles]);
    setResolutionProofPreviews((prev) => [...prev, ...createObjectUrls(nextFiles)]);
  };

  const handleRemoveResolutionProof = (index: number) => {
    setResolutionProofPreviews((prev) => {
      const removed = prev[index];
      if (removed) revokeObjectUrls([removed]);
      return prev.filter((_, i) => i !== index);
    });
    setResolutionProofFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectPlace = useSelectSearchPlace({
    focusMapOnCoordinates,
    setSearchedLocation,
    setSearchQuery: setLocationSearchQuery,
    setShowSearch: setShowLocationSearch,
    setViewMode,
  });

  const handleDraftStatusChange = useCallback((status: string) => {
    setDraftStatus(status);

    if (status === "resolved") {
      setAgencyNote("");
      return;
    }

    setResolutionNote("");
  }, []);

  const handleToggleDashboardTab = useCallback((tab: ReportsDashboardTabKey) => {
    if (tab === "semua") {
      setActiveTabs((currentTabs) => {
        const statusTabs = ALL_AGENCY_DASHBOARD_TAB_KEYS.filter(
          (item) => item !== "semua",
        );
        const isAllSelected = statusTabs.every((item) =>
          currentTabs.includes(item),
        );

        return isAllSelected ? [] : ALL_AGENCY_DASHBOARD_TAB_KEYS;
      });
      return;
    }

    setActiveTabs((currentTabs) => {
      const currentStatusTabs = currentTabs.filter((item) => item !== "semua");
      const nextStatusTabs = currentStatusTabs.includes(tab)
        ? currentStatusTabs.filter((item) => item !== tab)
        : [...currentStatusTabs, tab];

      if (nextStatusTabs.length === 0) {
        return [tab];
      }

      const isAllStatusSelected = ALL_AGENCY_DASHBOARD_TAB_KEYS
        .filter((item) => item !== "semua")
        .every((item) => nextStatusTabs.includes(item));

      return isAllStatusSelected
        ? ALL_AGENCY_DASHBOARD_TAB_KEYS
        : nextStatusTabs;
    });
  }, []);

  const mobileNavbarControls = useMemo(
    () => (
      <div className="flex flex-col gap-2">
        <AgencyMobileNavbarControls
          containerRef={mobileSearchRef}
          viewMode={viewMode}
          locationSearchQuery={locationSearchQuery}
          reportSearchQuery={reportSearchQuery}
          debouncedLocationSearchQuery={debouncedLocationSearchQuery}
          showLocationSearch={showLocationSearch}
          isSearchingLocations={isSearchingLocations}
          locationSearchResults={locationSearchResults}
          scope={scope}
          isDashboardOpen={isReportsDashboardOpen}
          onLocationSearchChange={(query) => {
            setLocationSearchQuery(query);
            setShowLocationSearch(true);
          }}
          onReportSearchChange={setReportSearchQuery}
          onLocationSearchFocus={setShowLocationSearch}
          onSelectPlace={handleSelectPlace}
          onScopeChange={handleScopeChange}
          onToggleDashboard={toggleReportsDashboard}
        />
        <div className="grid grid-cols-2 gap-1.5">
          <AgencyDashboardFilters
            activeTabs={activeTabs}
            tabs={scopedDashboardTabs}
            onTabChange={handleToggleDashboardTab}
            className="min-w-0"
          />
          <button
            type="button"
            onClick={toggleReportsDashboard}
            className={`flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-full px-3 text-[10px] font-black transition-colors ${
              isReportsDashboardOpen
                ? "bg-[#db2744] text-white shadow-sm shadow-red-500/20"
                : "border border-gray-100 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            aria-label="Buka daftar tiket"
          >
            <ListFilter size={14} strokeWidth={2.5} />
            <span className="truncate">Tiket</span>
          </button>
        </div>
      </div>
    ),
    [
      activeTabs,
      scopedDashboardTabs,
      debouncedLocationSearchQuery,
      handleToggleDashboardTab,
      handleSelectPlace,
      handleScopeChange,
      isReportsDashboardOpen,
      isSearchingLocations,
      locationSearchQuery,
      locationSearchResults,
      reportSearchQuery,
      scope,
      showLocationSearch,
      toggleReportsDashboard,
      viewMode,
    ],
  );

  useEffect(() => {
    setMobileControls(mobileNavbarControls);
  }, [mobileNavbarControls, setMobileControls]);

  useEffect(() => () => setMobileControls(null), [setMobileControls]);

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-100 text-[#C01D33] border border-red-200";
      case "verified":
      case "in_progress":
        return "bg-orange-100 text-orange-700 border border-orange-200";
      case "clarification_requested":
        return "bg-violet-100 text-violet-700 border border-violet-200";
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
      case "clarification_requested":
        return "bg-violet-500 shadow-violet-500/50 text-white";
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
                      report.status === "clarification_requested" ||
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
                      {report.status === "pending" || report.status === "clarification_requested" ? (
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
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-emerald-500 relative z-10 overflow-hidden">
                      <div className="w-full h-full rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <User size={18} className="text-emerald-600" strokeWidth={2.5} />
                      </div>
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
        isOpen={isReportsDashboardOpen && isDesktop}
        activeTabs={activeTabs}
        reports={visibleDashboardReports}
        searchQuery={reportSearchQuery}
        selectedMarkerId={selectedMarkerId}
        stats={summaryStats}
        tabs={scopedDashboardTabs}
        totalCount={totalVisibleDashboardReports}
        isLoading={isDashboardListLoading}
        onTabChange={handleToggleDashboardTab}
        onSearchChange={setReportSearchQuery}
        onClose={() => {
          setIsSidebarOpen(false);
          setViewMode("map");
        }}
        onSelectReport={handleSelectReport}
      />

      {/* Mobile: Bottom sheet ticket list */}
      <AgencyReportsBottomSheet
        isOpen={isReportsDashboardOpen && !isDesktop}
        activeTabs={activeTabs}
        reports={visibleDashboardReports}
        searchQuery={reportSearchQuery}
        selectedMarkerId={selectedMarkerId}
        stats={summaryStats}
        tabs={scopedDashboardTabs}
        totalCount={totalVisibleDashboardReports}
        isLoading={isDashboardListLoading}
        onTabChange={handleToggleDashboardTab}
        onSearchChange={setReportSearchQuery}
        onClose={() => {
          setIsSidebarOpen(false);
          setViewMode("map");
        }}
        onSelectReport={(reportId) => {
          handleSelectReport(reportId);
          setIsSidebarOpen(false);
        }}
      />

      {isFeedMode && feedDetailReport ? (
        <AgencyFeedReportDetail
          report={feedDetailReport}
          draftStatus={draftStatus}
          agencyNote={agencyNote}
          resolutionNote={resolutionNote}
          resolutionProofPreviews={resolutionProofPreviews}
          canEdit={canEditSelectedReport}
          isSaving={updateReportStatus.isPending || resolveReport.isPending}
          isSaveDisabled={isSaveDisabled}
          onBack={() => {
            setFeedDetailReportId(null);
            setSelectedMarkerId(null);
          }}
          onNavigateMap={() => handleSelectReport(feedDetailReport.id)}
          onDraftStatusChange={handleDraftStatusChange}
          onAgencyNoteChange={setAgencyNote}
          onResolutionNoteChange={setResolutionNote}
          onResolutionProofUpload={handleResolutionProofUpload}
          onRemoveResolutionProof={handleRemoveResolutionProof}
          onSave={handleSaveStatus}
          onPhotoClick={openLightbox}
        />
      ) : isFeedMode ? (
        <AgencySocialFeed
          reports={feedDashboardReports}
          totalCount={totalVisibleFeedReports}
          isLoading={isFeedListLoading}
          hasNextPage={agencyFeedReportsQuery.hasNextPage}
          isFetchingNextPage={agencyFeedReportsQuery.isFetchingNextPage}
          onLoadMore={() => {
            if (
              agencyFeedReportsQuery.hasNextPage &&
              !agencyFeedReportsQuery.isFetchingNextPage
            ) {
              void agencyFeedReportsQuery.fetchNextPage();
            }
          }}
          onSelectReport={(reportId) => {
            handleSelectReport(reportId);
            setIsSidebarOpen(false);
          }}
          onOpenReportDetail={handleOpenReportDetail}
        />
      ) : null}

      {/* Detail Drawer */}
      <AgencyReportDetailDrawer
        isOpen={viewMode === "map" && !!selectedReport}
        isDesktop={isDesktop}
        report={selectedReport || null}
        draftStatus={draftStatus}
        agencyNote={agencyNote}
        resolutionNote={resolutionNote}
        resolutionProofPreviews={resolutionProofPreviews}
        canEdit={canEditSelectedReport}
        isSaving={updateReportStatus.isPending || resolveReport.isPending}
        isSaveDisabled={isSaveDisabled}
        onClose={() => setSelectedMarkerId(null)}
        onDraftStatusChange={handleDraftStatusChange}
        onAgencyNoteChange={setAgencyNote}
        onResolutionNoteChange={setResolutionNote}
        onResolutionProofUpload={handleResolutionProofUpload}
        onRemoveResolutionProof={handleRemoveResolutionProof}
        onSave={handleSaveStatus}
        onPhotoClick={openLightbox}
      />

      {/* Bottom Toolbar Dock */}
      <div
        ref={searchRef}
        className="absolute bottom-5 left-0 right-0 z-20 hidden flex-col items-center gap-2 px-4 pointer-events-none md:flex"
      >
        {viewMode === "map" && (
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
        )}

        <div className="bg-white rounded-full shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)] border border-gray-100 flex items-center px-2 py-1.5 gap-1 w-full max-w-xl md:max-w-2xl pointer-events-auto">
          {/* Search - always open */}
          <div className="flex items-center flex-1 gap-1 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 min-w-0 transition-all focus-within:border-[#db2744] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#db2744]/10">
            <Search
              size={15}
              strokeWidth={2.5}
              className="text-[#db2744] shrink-0"
            />
            <input
              type="text"
              value={viewMode === "map" ? locationSearchQuery : reportSearchQuery}
              onChange={(e) => {
                if (viewMode === "feed") {
                  setReportSearchQuery(e.target.value);
                  return;
                }

                setLocationSearchQuery(e.target.value);
                setShowLocationSearch(true);
              }}
              onFocus={() => setShowLocationSearch(viewMode === "map")}
              placeholder={viewMode === "map" ? "Cari lokasi..." : "Cari tiket..."}
              className="bg-transparent border-none outline-none text-xs font-bold text-gray-900 placeholder:text-gray-400 w-full py-1.5"
            />
          </div>

          <div className="w-px h-5 bg-gray-200 shrink-0 mx-0.5" />

          <AgencyDashboardFilters
            activeTabs={activeTabs}
            tabs={scopedDashboardTabs}
            onTabChange={handleToggleDashboardTab}
          />

          <div className="w-px h-5 bg-gray-200 shrink-0 mx-0.5" />

          <div className="flex items-center gap-1 rounded-full bg-gray-50 border border-gray-200 p-1 shrink-0">
            {REPORT_SCOPE_OPTIONS.map((scopeOption) => (
              <button
                key={scopeOption.value}
                type="button"
                onClick={() => handleScopeChange(scopeOption.value)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-black tracking-wide transition-all ${
                  scope === scopeOption.value
                    ? "bg-[#db2744] text-white shadow-sm"
                    : "text-gray-500 hover:bg-white hover:text-gray-800"
                }`}
              >
                <span className="sm:hidden">{scopeOption.shortLabel}</span>
                <span className="hidden sm:inline">{scopeOption.label}</span>
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-200 shrink-0 mx-0.5" />

          {/* Ticket list toggle */}
          <button
            type="button"
            onClick={toggleReportsDashboard}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full transition-all font-bold shrink-0 ${
              isReportsDashboardOpen
                ? "bg-[#db2744] text-white shadow-md shadow-red-500/20"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ListFilter size={16} strokeWidth={2.5} />
            <span className="text-xs hidden sm:inline">Tiket</span>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {lightbox && (
          <PhotoLightbox images={lightbox.images} index={lightbox.index} onClose={closeLightbox} />
        )}
      </AnimatePresence>
    </div>
  );
}
