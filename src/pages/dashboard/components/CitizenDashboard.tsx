import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { MOCK_AGENCIES } from "@/data/agencies";
import { MapPin, ImagePlus, X, AlertTriangle, Plus, Target, Check, Trash2, ChevronLeft, ChevronRight, Clock, User, Search, Navigation, Building2 } from "lucide-react";

type InteractionMode = "idle" | "pin_drop";

interface MockReport {
  id: number;
  title: string;
  description: string;
  status: "menunggu" | "proses" | "selesai";
  reporter: string;
  time: string;
  images: string[];
  lat: number;
  lng: number;
  address: string;
  agency?: string;
}

const STATUS_MAP = {
  menunggu: { label: "Menunggu", color: "bg-amber-50 text-amber-700 border-amber-200" },
  proses: { label: "Diproses", color: "bg-sky-50 text-sky-700 border-sky-200" },
  selesai: { label: "Selesai", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const MOCK_REPORTS: MockReport[] = [
  {
    id: 1,
    title: "Jalan Berlubang Parah",
    description: "Lubang sedalam 10cm di bahu jalan, membahayakan pengendara motor terutama saat malam hari.",
    status: "proses",
    reporter: "Ahmad R.",
    time: "2 jam lalu",
    images: [
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1605725658213-4c5720351cdd?w=400&h=250&fit=crop",
    ],
    lat: -6.1950,
    lng: 106.8229,
    address: "Jl. Jend. Sudirman, Jakarta Pusat",
    agency: "Dinas Bina Marga DKI Jakarta",
  },
  {
    id: 2,
    title: "Sampah Menumpuk di Trotoar",
    description: "Tumpukan sampah sudah 3 hari tidak diangkut. Menimbulkan bau tidak sedap dan menghalangi jalur pejalan kaki.",
    status: "menunggu",
    reporter: "Siti M.",
    time: "5 jam lalu",
    images: [
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&h=250&fit=crop",
    ],
    lat: -6.2010,
    lng: 106.8160,
    address: "Trotoar Pasar Senen, Jakarta Pusat",
  },
  {
    id: 3,
    title: "Lampu Jalan Mati",
    description: "Lampu penerangan jalan sudah mati selama 1 minggu. Rawan kriminalitas.",
    status: "selesai",
    reporter: "Budi K.",
    time: "1 hari lalu",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
      "https://images.unsplash.com/photo-1517594422361-5eeb8ae275a9?w=400&h=250&fit=crop",
    ],
    lat: -6.1880,
    lng: 106.8320,
    address: "Kawasan Menteng Indah, Jakarta Pusat",
    agency: "Dinas Lingkungan Hidup DKI",
  },
];

function ReportPopup({ report }: { report: MockReport }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const status = STATUS_MAP[report.status];
  const hasMultiple = report.images.length > 1;

  return (
    <div className="w-[300px] overflow-hidden -m-[10px] -mb-[15px]">
      
      {report.images.length > 0 && (
        <div className="relative w-full h-[160px] bg-gray-100">
          <img
            src={report.images[currentImg]}
            alt={report.title}
            className="w-full h-full object-cover"
          />

          {hasMultiple && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              {currentImg + 1} / {report.images.length}
            </div>
          )}

          {hasMultiple && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImg((p) => (p === 0 ? report.images.length - 1 : p - 1)); }}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors"
              >
                <ChevronLeft size={14} className="text-gray-700" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImg((p) => (p === report.images.length - 1 ? 0 : p + 1)); }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors"
              >
                <ChevronRight size={14} className="text-gray-700" />
              </button>
            </>
          )}

          {hasMultiple && (
            <div className="absolute bottom-2 right-2 flex gap-1">
              {report.images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentImg(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImg ? "bg-white scale-125" : "bg-white/50"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${status.color} uppercase tracking-wide`}>
            {status.label}
          </span>
        </div>

        <h4 className="font-extrabold text-sm text-gray-900 leading-tight mb-1">
          {report.title}
        </h4>
        <div className="mb-3">
          <p className={`text-[12px] text-gray-500 leading-relaxed transition-all duration-300 ${!isExpanded ? "line-clamp-2" : ""}`}>
            {report.description}
          </p>
          {report.description.length > 65 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="text-[10px] font-bold text-gray-900 hover:text-[#db2744] transition-colors mt-0.5"
            >
              {isExpanded ? "Tampilkan lebih sedikit" : "Baca selengkapnya"}
            </button>
          )}
        </div>

        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 mb-3">
          <div className="flex items-start gap-1.5 text-[11px] font-bold text-gray-700 mb-1">
             <MapPin size={12} className="text-[#db2744] shrink-0 mt-0.5" strokeWidth={2.5} />
             <span className="leading-tight">{report.address}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 ml-[18px]">
            <Navigation size={10} className="shrink-0" />
            {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-400">
            <User size={12} />
            <span className="text-[11px] font-semibold">{report.reporter}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock size={11} />
            <span className="text-[10px] font-medium">{report.time}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-2.5 pt-1.5 border-t border-dashed border-gray-100">
          <Building2 size={11} className={report.agency ? "text-[#db2744]" : "text-gray-400"} />
          <span className={`text-[10px] uppercase tracking-wide font-black ${report.agency ? "text-[#db2744]" : "text-gray-400"}`}>
            {report.agency ? report.agency : "Menunggu Instansi"}
          </span>
        </div>
      </div>
    </div>
  );
}

interface SearchResult {
  name: string;
  sub: string;
  lng: number;
  lat: number;
}

export default function CitizenDashboard() {
  const { data: session } = authClient.useSession();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [mode, setMode] = useState<InteractionMode>("idle");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [markerLocation, setMarkerLocation] = useState<[number, number] | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState<{ name: string; coords: [number, number] } | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [viewport, setViewport] = useState({
    center: [106.8229, -6.1944] as [number, number],
    zoom: 12,
    pitch: 45,
    bearing: 0
  });

  const selectedLocation = markerLocation || viewport.center;

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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=id&limit=6&addressdetails=1`,
          { headers: { "Accept-Language": "id" } }
        );
        const data = await res.json();
        const mapped: SearchResult[] = data.map((item: any) => ({
          name: item.display_name.split(",")[0],
          sub: item.display_name.split(",").slice(1, 3).join(",").trim(),
          lng: parseFloat(item.lon),
          lat: parseFloat(item.lat),
        }));
        setSearchResults(mapped);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const handleSelectPlace = (place: SearchResult) => {
    setViewport((prev) => ({ ...prev, center: [place.lng, place.lat], zoom: 15 }));
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
       const newFiles = Array.from(e.target.files);
       const urls = newFiles.map(file => URL.createObjectURL(file));
       setPhotoPreviews(prev => [...prev, ...urls]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative w-full h-full bg-gray-100 flex overflow-hidden">

      <div className="flex-1 relative h-full rounded-r-3xl md:rounded-none overflow-hidden">
        <Map
          viewport={viewport}
          onViewportChange={setViewport}
          theme="light"
          className="w-full h-full"
        >
          
          <MapControls position="top-right" showZoom showLocate />

          {mode === "pin_drop" && (
            <MapMarker longitude={viewport.center[0]} latitude={viewport.center[1]}>
               <MarkerContent>
                  <div className="flex flex-col items-center -mt-8 pointer-events-none">
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

          {markerLocation && mode === "idle" && (
            <MapMarker 
               longitude={markerLocation[0]} 
               latitude={markerLocation[1]}
               draggable={true}
               onDragEnd={(e: any) => setMarkerLocation([e.lng, e.lat])}
            >
               <MarkerContent>
                  <div className="flex flex-col items-center -mt-8 cursor-grab active:cursor-grabbing">
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

          {MOCK_REPORTS.map((report) => (
           <MapMarker key={report.id} longitude={report.lng} latitude={report.lat}>
              <MarkerPopup closeButton>
                 <ReportPopup report={report} />
              </MarkerPopup>
              <MarkerContent>
                 <div className="w-10 h-10 -mt-5 -ml-5 bg-[#db2744]/20 rounded-full flex items-center justify-center">
                   <div className="w-6 h-6 bg-[#db2744] hover:bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 transition-colors border-2 border-white">
                      <AlertTriangle size={12} className="text-white" strokeWidth={3} />
                   </div>
                 </div>
              </MarkerContent>
           </MapMarker>
          ))}

          {/* Agency Location Markers */}
          {MOCK_AGENCIES.map((agency, idx) => (
            <MapMarker key={`agency-${idx}`} longitude={agency.lng} latitude={agency.lat}>
               <MarkerPopup closeButton>
                 <div className="w-[200px] flex flex-col overflow-hidden -m-[10px] -mb-[15px]">
                   {agency.images && agency.images.length > 0 && (
                     <div className="w-full h-[100px] bg-gray-100 flex overflow-x-auto snap-x hide-scrollbar">
                       {agency.images.map((img, i) => (
                         <img key={i} src={img} alt={`Foto ${agency.name}`} className="w-full h-full object-cover shrink-0 snap-center" />
                       ))}
                     </div>
                   )}
                   <div className="p-3 pb-4 flex flex-col gap-1.5">
                     <div className="text-[9px] font-black uppercase text-indigo-600 tracking-wider bg-indigo-50 px-2 py-0.5 rounded-sm w-fit truncate max-w-full">
                       {agency.type.replace(/_/g, ' ')}
                     </div>
                     <div className="text-xs font-bold text-gray-900 leading-tight">
                       {agency.name}
                     </div>
                   </div>
                 </div>
               </MarkerPopup>
               <MarkerContent>
                 <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-indigo-200 shadow-lg flex items-center justify-center -mt-4 text-indigo-600 hover:scale-110 hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all cursor-pointer">
                   <Building2 size={14} strokeWidth={2.5} />
                 </div>
               </MarkerContent>
            </MapMarker>
          ))}

          {searchedLocation && (
            <MapMarker longitude={searchedLocation.coords[0]} latitude={searchedLocation.coords[1]}>
              <MarkerContent>
                <div className="flex flex-col items-center -mt-10 pointer-events-none">
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

          {userLocation && (
            <MapMarker longitude={userLocation[0]} latitude={userLocation[1]}>
              <MarkerContent>
                <div className="flex flex-col items-center -mt-6 pointer-events-none">
                  
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center animate-ping absolute inset-0" />
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-emerald-500 relative z-10 overflow-hidden text-emerald-500">
                      {session?.user?.image ? (
                        <img src={session.user.image} alt="Profil Anda" referrerPolicy="no-referrer" crossOrigin="anonymous" className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} strokeWidth={2.5} />
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
        </Map>

        <div className="absolute bottom-5 left-0 right-0 z-20 flex flex-col items-center gap-2 px-4 pointer-events-none">

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showSearch && searchQuery.trim().length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-h-[240px] overflow-y-auto pointer-events-auto"
              >
                {isSearching ? (
                  <div className="px-4 py-6 text-center">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-[#db2744] rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-400">Mencari...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs font-bold text-gray-400">Lokasi tidak ditemukan</p>
                  </div>
                ) : (
                  searchResults.map((place: SearchResult, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPlace(place)}
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

          <div ref={searchRef} className="w-full max-w-sm pointer-events-auto">
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

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={isDesktop ? { x: "100%", opacity: 0 } : { y: "100%", opacity: 0 }}
            animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
            exit={isDesktop ? { x: "100%", opacity: 0 } : { y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`absolute z-30 bg-white flex flex-col overflow-hidden
              ${isDesktop 
                ? "top-24 right-6 bottom-6 w-[400px] shadow-2xl rounded-xl border border-gray-100" 
                : "bottom-0 left-0 w-full rounded-t-3xl h-[85vh] shadow-[0_-20px_40px_rgba(0,0,0,0.1)]"
              }`}
          >
            
            <div className="px-7 py-6 flex justify-between items-center bg-white pb-2 relative z-10">
               <div>
                  <h3 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                    Laporan Baru
                  </h3>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wide">Isi detail lengkap</p>
               </div>
               <button 
                 onClick={() => setIsFormOpen(false)}
                 className="text-gray-400 hover:text-gray-900 transition-colors p-2 -mr-2"
               >
                  <X size={20} strokeWidth={2.5} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto px-7 space-y-7 bg-white pb-6 pt-2 hide-scrollbar">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-black text-gray-300 tracking-widest leading-none">JUDUL LAPORAN</Label>
                <Input id="title" placeholder="Contoh: Lampu lalu lintas mati" className="rounded-sm h-14 bg-white border border-gray-200 focus:bg-gray-50 focus:border-[#db2744] focus:ring-0 transition-all font-bold text-gray-900 text-sm shadow-none" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-black text-gray-300 tracking-widest leading-none">DETAIL KRONOLOGI</Label>
                <Textarea id="description" placeholder="Ceritakan urutan dan kondisi yang terjadi..." className="rounded-sm min-h-[120px] bg-white border border-gray-200 focus:bg-gray-50 focus:border-[#db2744] focus:ring-0 transition-all font-bold text-gray-900 text-sm resize-none p-5 shadow-none leading-relaxed" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-300 tracking-widest leading-none">UNGGAH BUKTI FOTO</Label>
                
                {photoPreviews.length > 0 && (
                   <div className="grid grid-cols-2 gap-3 mb-3">
                     {photoPreviews.map((url, idx) => (
                       <div key={idx} className="relative w-full h-[100px] rounded-sm overflow-hidden group">
                         <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => removePhoto(idx)} className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-colors">
                               <Trash2 size={14} />
                            </button>
                         </div>
                       </div>
                     ))}
                   </div>
                )}
                
                <div className="w-full h-[100px] rounded-sm border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 flex flex-col items-center justify-center text-gray-400 transition-all relative cursor-pointer group">
                   <ImagePlus size={24} className="mb-2 text-gray-300 group-hover:text-gray-400 transition-colors" />
                   <span className="text-[11px] font-bold font-sans uppercase tracking-widest">Pilih Foto</span>
                   <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-300 tracking-widest leading-none">LOKASI TERPILIH</Label>
                <div className="flex items-center justify-between p-1.5 border border-transparent">
                  <div className="flex items-center gap-3">
                    <div className="text-[#db2744]">
                      <MapPin size={22} strokeWidth={2.5} />
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium">
                      Otomatis tersinkronisasi.<br/>
                      <span className="text-gray-900 font-mono font-bold mt-0.5 block text-xs">{selectedLocation[1].toFixed(5)}, {selectedLocation[0].toFixed(5)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIsFormOpen(false);
                      setMode("idle");
                    }} 
                    className="text-[10px] font-bold uppercase text-[#db2744] hover:text-rose-600 transition-colors"
                  >
                    Ubah
                  </button>
                </div>
                {userLocation && (selectedLocation[0] !== userLocation[0] || selectedLocation[1] !== userLocation[1]) && (
                  <button
                    onClick={() => {
                      setMarkerLocation(userLocation);
                      setViewport(v => ({ ...v, center: userLocation }));
                    }}
                    className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-100 bg-red-50 hover:bg-red-100/80 text-[#db2744] text-[11px] font-black tracking-widest uppercase transition-colors shadow-sm"
                  >
                    <Navigation size={15} strokeWidth={2.5} />
                    Gunakan Lokasi GPS Saya
                  </button>
                )}
              </div>

            </div>

             <div className="px-7 py-5 bg-white border-t border-gray-100">
                <Button className="w-full bg-[#db2744] hover:bg-[#b01e33] rounded-sm h-12 text-white font-black tracking-widest text-sm active:scale-[0.98] transition-all">
                  KIRIM LAPORAN
                </Button>
             </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
