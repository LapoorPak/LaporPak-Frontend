import { useState, useEffect, useRef, useCallback, type ChangeEvent } from "react";
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup, type MapRef } from "@/components/ui/map";
import { authClient } from "@/lib/auth-client";
import { type ReportLocation } from "@/api/reports/reports-queries";
import { useGetAgencyLocations } from "@/hooks/agencies/useGetAgencyLocations";
import { useQueryGetMyReports } from "@/api/reports/reports-queries";
import { useGetReportLocations } from "@/hooks/reports/useGetReportLocations";
import { useCreateReport } from "@/hooks/reports/useCreateReport";
import { useQuerySearchLocation, type SearchResult } from "@/hooks/search/useSearchLocation";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/api/queryKeys";
import axios from "axios";
import { toast } from "sonner";
import { API_BASE } from "@/config/api-client";
import { MapPin, X, AlertTriangle, Plus, Target, Check, Clock, User, Navigation, Building2, ListFilter, Search, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CitizenMyReportsPanel } from "./CitizenMyReportsPanel";
import { CitizenReportFormPanel } from "./CitizenReportFormPanel";
import { LocationSearchResultsDropdown } from "./LocationSearchResultsDropdown";
import { CITIZEN_REPORT_STATUS_MAP } from "../utils/reportStatus";

type InteractionMode = "idle" | "pin_drop";

function resolvePhotoUrl(url: string) {
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}

type LightboxState = { images: string[]; index: number } | null;

function PhotoLightbox({ images, index, onClose }: { images: string[]; index: number; onClose: () => void }) {
  const [current, setCurrent] = useState(index);

  const prev = useCallback(() => setCurrent((i) => (i > 0 ? i - 1 : images.length - 1)), [images.length]);
  const next = useCallback(() => setCurrent((i) => (i < images.length - 1 ? i + 1 : 0)), [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/92 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
        onClick={onClose}
      >
        <X size={18} />
      </button>

      {images.length > 1 && (
        <span className="hidden md:inline absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-xs font-bold tracking-widest">
          {current + 1} / {images.length}
        </span>
      )}

      {images.length > 1 && (
        <>
          <button
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      <motion.img
        key={current}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        src={resolvePhotoUrl(images[current])}
        alt={`Foto ${current + 1}`}
        className="max-w-[92vw] max-h-[75vh] md:max-h-[88vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <div className="md:hidden absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6 z-10">
          <button
            className="w-12 h-12 rounded-full bg-white/15 active:bg-white/30 text-white flex items-center justify-center transition-colors"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-white/60 text-sm font-bold tracking-widest min-w-[48px] text-center">
            {current + 1} / {images.length}
          </span>
          <button
            className="w-12 h-12 rounded-full bg-white/15 active:bg-white/30 text-white flex items-center justify-center transition-colors"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

function ReportPopup({ report, onPhotoClick }: { report: ReportLocation; onPhotoClick: (imgs: string[], idx: number) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const status = CITIZEN_REPORT_STATUS_MAP[report.status] || { label: report.status, color: "bg-gray-50 text-gray-700 border-gray-200" };
  const description = report.kategori?.name || "Laporan Warga";
  const agencyNote = report.agencyNote?.trim();
  const resolutionNote = report.resolutionNote?.trim();
  const photos = report.images?.length
    ? report.images
    : report.aiReview?.gambarDiterimaAi?.length
    ? report.aiReview.gambarDiterimaAi
    : null;

  return (
    <div className="w-[300px] overflow-hidden -m-[10px] -mb-[15px]">
      {photos && photos.length > 0 && (
        <div className="w-full h-[140px] bg-gray-100 relative group overflow-hidden">
          <button
            type="button"
            className="absolute inset-0 w-full h-full cursor-zoom-in z-[1]"
            onClick={(e) => { e.stopPropagation(); onPhotoClick(photos.map(resolvePhotoUrl), photoIndex); }}
          />
          <img src={resolvePhotoUrl(photos[photoIndex])} alt={report.title} className="w-full h-full object-cover transition-all" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          <ZoomIn size={16} className="absolute top-2 right-2 text-white drop-shadow opacity-70 pointer-events-none z-[2]" />

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => (i > 0 ? i - 1 : photos.length - 1)); }}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-[2px] transition-all hover:bg-black/60 active:scale-95 z-10"
              >
                <ChevronLeft size={15} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => (i < photos.length - 1 ? i + 1 : 0)); }}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-[2px] transition-all hover:bg-black/60 active:scale-95 z-10"
              >
                <ChevronRight size={15} strokeWidth={2.5} />
              </button>

              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                {photos.map((_: string, idx: number) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === photoIndex ? 'bg-white w-3' : 'bg-white/50 w-1.5'}`} />
                ))}
              </div>
            </>
          )}

          <span className={`absolute bottom-2 left-3 text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wide ${status.color} shadow-md z-[2]`}>
            {status.label}
          </span>
        </div>
      )}

      <div className="p-4">
        {(!photos || photos.length === 0) && (
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${status.color} uppercase tracking-wide`}>
              {status.label}
            </span>
          </div>
        )}

        <h4 className="font-extrabold text-sm text-gray-900 leading-tight mb-1">
          {report.title}
        </h4>
        <div className="mb-3">
          <p className={`text-[12px] text-gray-500 leading-relaxed transition-all duration-300 ${!isExpanded ? "line-clamp-2" : ""}`}>
            {description}
          </p>
          {description.length > 65 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="text-[10px] font-bold text-gray-900 hover:text-[#db2744] transition-colors mt-0.5"
            >
              {isExpanded ? "Tampilkan lebih sedikit" : "Baca selengkapnya"}
            </button>
          )}
        </div>

        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 mb-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
            <Navigation size={10} className="shrink-0" />
            {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
          </div>
        </div>

        {(agencyNote || resolutionNote) && (
          <div className="space-y-2 mb-3">
            {agencyNote && (
              <div className="rounded-lg border border-sky-100 bg-sky-50 p-2.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-sky-700 mb-1">
                  Update Dinas
                </p>
                <p className="text-[11px] leading-relaxed text-sky-950">
                  {agencyNote}
                </p>
              </div>
            )}

            {resolutionNote && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700 mb-1">
                  Hasil Penanganan
                </p>
                <p className="text-[11px] leading-relaxed text-emerald-950">
                  {resolutionNote}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-400">
            <User size={12} />
            <span className="text-[11px] font-semibold">{report.createdBy?.name || "Warga"}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock size={11} />
            <span className="text-[10px] font-medium">{new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-2.5 pt-1.5 border-t border-dashed border-gray-100">
          <Building2 size={11} className={report.dinas ? "text-[#db2744]" : "text-gray-400"} />
          <span className={`text-[10px] uppercase tracking-wide font-black ${report.dinas ? "text-[#db2744]" : "text-gray-400"}`}>
            {report.dinas ? report.dinas.name : "Menunggu Instansi"}
          </span>
        </div>
      </div>
    </div>
  );
}

function AgencyPopupCarousel({ agency, onPhotoClick }: { agency: any; onPhotoClick: (imgs: string[], idx: number) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!agency.photos || agency.photos.length === 0) {
    if (agency.photoUrl) {
      const url = resolvePhotoUrl(agency.photoUrl);
      return (
        <button type="button" className="w-full h-[120px] bg-gray-100 relative block" onClick={(e) => { e.stopPropagation(); onPhotoClick([url], 0); }}>
          <img src={url} alt={agency.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ZoomIn size={20} className="text-white opacity-0 hover:opacity-100 transition-opacity drop-shadow" />
          </div>
        </button>
      );
    }
    return null;
  }

  const photos: string[] = agency.photos;

  return (
    <div className="w-full h-[120px] bg-gray-100 relative group overflow-hidden">
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-zoom-in z-[1]"
        onClick={(e) => { e.stopPropagation(); onPhotoClick(photos.map(resolvePhotoUrl), currentIndex); }}
      />
      <img src={resolvePhotoUrl(photos[currentIndex])} alt={agency.name} className="w-full h-full object-cover transition-all" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      <ZoomIn size={16} className="absolute top-2 right-2 text-white drop-shadow opacity-70 pointer-events-none z-[2]" />
      
      {photos.length > 1 && (
        <>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1)); }}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-[2px] transition-all hover:bg-black/60 active:scale-95 z-10 focus:outline-none shadow-sm"
          >
            <ChevronLeft size={15} strokeWidth={2.5} />
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0)); }}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-[2px] transition-all hover:bg-black/60 active:scale-95 z-10 focus:outline-none shadow-sm"
          >
            <ChevronRight size={15} strokeWidth={2.5} />
          </button>
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            {photos.map((_: any, idx: number) => (
              <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-3' : 'bg-white/50 w-1.5'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}


export default function CitizenDashboard() {
  const { data: session } = authClient.useSession();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMyReportsOpen, setIsMyReportsOpen] = useState(false);
  const [mode, setMode] = useState<InteractionMode>("idle");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [markerLocation, setMarkerLocation] = useState<[number, number] | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [myReportsSearch, setMyReportsSearch] = useState("");
  const [debouncedMyReportsSearch, setDebouncedMyReportsSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState<{ name: string; coords: [number, number] } | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef | null>(null);
  
  const openLightbox = useCallback((images: string[], index: number) => setLightbox({ images, index }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  
  // API Queries
  const { data: publicReportsData } = useGetReportLocations();
  const { data: myReportsData } = useQueryGetMyReports({ search: debouncedMyReportsSearch }, { enabled: !!session?.user });
  const { data: agenciesData } = useGetAgencyLocations();
  const { data: searchResults = [], isFetching: isSearching } = useQuerySearchLocation(debouncedSearchQuery);
  const queryClient = useQueryClient();

  const publicReports = publicReportsData?.data || [];
  const myReports = myReportsData?.data || [];
  const agencies = agenciesData?.data || [];

  const refreshDashboardData = async () => {
    await Promise.allSettled([
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.MY_REPORTS], type: "active" }),
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.REPORTS_LOCATIONS], type: "active" }),
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS_UNREAD_COUNT], type: "active" }),
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS], type: "active" }),
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] }),
    ]);
  };
  
  const createReport = useCreateReport({
    onSuccess: async (res) => {
      setIsFormOpen(false);
      setMode("idle");
      setTitle("");
      setDescription("");
      setPhotoPreviews([]);
      setPhotoFiles([]);
      setMarkerLocation(null);
      await refreshDashboardData();
      
      const aiReview = res.data?.aiReview;
      if (res.data?.status === "rejected" || aiReview?.statusAi === "ditolak") {
        toast.error("Laporan Ditolak AI", {
           description: aiReview?.alasanAi || "Laporan ambigu atau tidak relevan.",
           duration: 5000,
        });
      } else {
        toast.success("Laporan Berhasil Dibuat!", {
           description: "Laporan Anda telah masuk dan sedang diproses.",
        });
      }
    },
    onError: (error: unknown) => {
      console.error("Failed to create report", error);
      const errorMessage = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : "Gagal membuat laporan terbaru.";

      toast.error("Gagal", {
         description: errorMessage,
      });
    }
  });

  const handleSubmitReport = () => {
    if (!title.trim() || !description.trim() || !markerLocation) return;
    
    createReport.mutate({
      title,
      description,
      latitude: selectedLocation[1],
      longitude: selectedLocation[0],
      address: searchedLocation?.name, 
      images: photoFiles
    });
  };
  
  const [viewport, setViewport] = useState({
    center: [106.8229, -6.1944] as [number, number],
    zoom: 12,
    pitch: 45,
    bearing: 0
  });

  const selectedLocation = markerLocation || viewport.center;
  const mapFocusPadding = isDesktop
    ? { top: 32, bottom: 32, left: 32, right: 32 }
    : { top: 112, bottom: 104, left: 20, right: 20 };

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

    setViewport((prev) => ({ ...prev, center: coords, zoom }));
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
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    if (showSearch) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMyReportsSearch(myReportsSearch);
    }, 400);

    return () => clearTimeout(timer);
  }, [myReportsSearch]);

  const handleSelectPlace = (place: SearchResult) => {
    focusMapOnCoordinates([place.lng, place.lat], 15);
    setSearchedLocation({ name: place.name, coords: [place.lng, place.lat] });
    setSearchQuery("");
    setShowSearch(false);
  };

  const togglePinMode = () => {
    if (mode === "pin_drop") {
      setMode("idle");

      setMarkerLocation(viewport.center);
    } else {
      setMode("pin_drop");
      setMarkerLocation(null);
      setIsFormOpen(false);
    }
  };

  const handleCreateReport = () => {
    if (isFormOpen) {
      setIsFormOpen(false);
      return;
    }
    
    if (!markerLocation) {
       setMarkerLocation(viewport.center);
    }
    setIsFormOpen(true);
    setMode("idle"); 
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
       const newFiles = Array.from(e.target.files);
       // Check maximum 5 files
       if (photoFiles.length + newFiles.length > 5) {
         toast.error("Maksimal 5 foto per laporan");
         return;
       }
       const urls = newFiles.map(file => URL.createObjectURL(file));
       setPhotoFiles(prev => [...prev, ...newFiles]);
       setPhotoPreviews(prev => [...prev, ...urls]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

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

          {publicReports.map((report) => (
           <MapMarker key={report.id} longitude={report.lng} latitude={report.lat}>
              <MarkerPopup closeButton>
                 <ReportPopup report={report} onPhotoClick={openLightbox} />
              </MarkerPopup>
              <MarkerContent className="[&>*]:!z-[10]">
                 <div className="w-10 h-10 -mt-5 -ml-5 bg-[#db2744]/20 rounded-full flex items-center justify-center" style={{ zIndex: 10 }}>
                   <div className="w-6 h-6 bg-[#db2744] hover:bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 transition-colors border-2 border-white">
                      <AlertTriangle size={12} className="text-white" strokeWidth={3} />
                   </div>
                 </div>
              </MarkerContent>
           </MapMarker>
          ))}

          {agencies.map((agency, idx) => (
            <MapMarker key={`agency-${agency.id || idx}`} longitude={agency.lng} latitude={agency.lat}>
               <MarkerPopup closeButton>
                 <div className="w-[200px] flex flex-col overflow-hidden -m-[10px] -mb-[15px]">
                   <AgencyPopupCarousel agency={agency} onPhotoClick={openLightbox} />
                   <div className="p-3 pb-4 flex flex-col gap-1.5 relative">
                     <div className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm w-fit truncate max-w-full ${(agency.photos?.length > 0 || agency.photoUrl) ? "text-indigo-600 bg-indigo-50 absolute -top-8 left-3 shadow-md border border-indigo-100/50" : "text-indigo-600 bg-indigo-50"}`}>
                       {agency.type?.replace(/_/g, ' ') || 'Dinas'}
                     </div>
                     <div className="text-xs font-bold text-gray-900 leading-tight">
                       {agency.name}
                     </div>
                   </div>
                 </div>
               </MarkerPopup>
               <MarkerContent>
                 <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-indigo-200 shadow-lg flex items-center justify-center -mt-4 text-indigo-600 hover:scale-110 hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all cursor-pointer" style={{ zIndex: 20 }}>
                   <Building2 size={14} strokeWidth={2.5} />
                 </div>
               </MarkerContent>
            </MapMarker>
          ))}

          {searchedLocation && (
            <MapMarker longitude={searchedLocation.coords[0]} latitude={searchedLocation.coords[1]}>
              <MarkerContent>
                <div className="flex flex-col items-center -mt-10 pointer-events-none" style={{ zIndex: 30 }}>
                  <div className="bg-white text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg mb-1 border border-gray-200 max-w-[140px] truncate">
                    {searchedLocation.name}
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <Navigation size={14} className="text-white" fill="white" strokeWidth={0} />
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
                <div className="flex flex-col items-center -mt-6 pointer-events-none" style={{ zIndex: 40 }}>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center animate-ping absolute inset-0" />
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-emerald-500 relative z-10 overflow-hidden">
                      {session?.user?.image ? (
                        <img src={session.user.image} alt="Profil Anda" referrerPolicy="no-referrer" crossOrigin="anonymous" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                          <User size={18} className="text-emerald-600" strokeWidth={2.5} />
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
            <MapMarker longitude={viewport.center[0]} latitude={viewport.center[1]}>
               <MarkerContent>
                  <div className="flex flex-col items-center -mt-8 pointer-events-none" style={{ zIndex: 100 }}>
                     <div className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg mb-1.5 animate-bounce">
                       Geser Peta ke Lokasi
                     </div>
                     <div className="w-10 h-10 flex items-center justify-center">
                       <MapPin size={38} className="text-[#db2744] drop-shadow-xl" fill="#db2744" stroke="white" strokeWidth={1.5} />
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
               onDragEnd={(e: { lng: number; lat: number }) => setMarkerLocation([e.lng, e.lat])}
            >
               <MarkerContent>
                  <div className="flex flex-col items-center -mt-8 cursor-grab active:cursor-grabbing" style={{ zIndex: 100 }}>
                     <div className="bg-[#db2744] text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg mb-1 whitespace-nowrap opacity-90 hover:opacity-100">
                       Bisa digeser
                     </div>
                     <div className="w-10 h-10 flex items-center justify-center">
                       <MapPin size={38} className="text-[#db2744] drop-shadow-xl" fill="#db2744" stroke="white" strokeWidth={2} />
                     </div>
                  </div>
               </MarkerContent>
            </MapMarker>
          )}
        </Map>

        <div className="absolute bottom-5 left-0 right-0 z-20 flex flex-col items-center gap-2 px-4 pointer-events-none">

          {/* Search Results Dropdown */}
          <LocationSearchResultsDropdown
            isOpen={showSearch}
            query={searchQuery}
            isLoading={isSearching || searchQuery !== debouncedSearchQuery}
            results={searchResults}
            onSelectPlace={handleSelectPlace}
            className="max-w-[460px] md:max-w-[600px]"
          />

          <div ref={searchRef} className="w-full max-w-[460px] md:max-w-[600px] pointer-events-auto">
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
                    setShowSearch(true);
                  }}
                  onFocus={() => setShowSearch(true)}
                  placeholder="Cari lokasi..."
                  className="bg-transparent border-none outline-none text-xs font-bold text-gray-900 placeholder:text-gray-400 w-full py-1.5"
                />
              </div>

              <div className="w-px h-5 bg-gray-200 shrink-0 mx-0.5" />

              <button
                onClick={togglePinMode}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full transition-all duration-300 font-bold shrink-0 ${
                  mode === "pin_drop"
                  ? "bg-[#db2744] text-white shadow-md shadow-red-500/20"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {mode === "pin_drop" ? <Check size={16} strokeWidth={2.5}/> : <Target size={16} />}
                <span className="text-xs hidden sm:inline">
                  {mode === "pin_drop" ? "Pilih" : "Tandai"}
                </span>
              </button>

              <div className="w-px h-5 bg-gray-200 shrink-0 mx-0.5" />

              <button
                onClick={() => setIsMyReportsOpen(open => !open)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full transition-all duration-300 font-bold shrink-0 ${
                  isMyReportsOpen ? "bg-[#db2744] text-white shadow-md shadow-red-500/20" : "text-gray-600 hover:bg-gray-100"
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
                {isFormOpen ? <X size={16} /> : <Plus size={16} strokeWidth={2.5} />}
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
        onFocusReport={(report) => {
          if (report.status !== "rejected") {
            focusMapOnCoordinates([report.lng, report.lat], 15);
          }
        }}
      />

      <AnimatePresence>
        {lightbox && (
          <PhotoLightbox images={lightbox.images} index={lightbox.index} onClose={closeLightbox} />
        )}
      </AnimatePresence>
    </div>
  );
}
