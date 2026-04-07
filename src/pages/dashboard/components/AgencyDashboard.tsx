import { useState, useEffect } from "react";
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, CheckCircle2, Clock, AlertCircle, MapPin, 
  Search, Settings, ListFilter,
  X, User, Navigation, ArrowRight
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGetReportLocations } from "@/hooks/reports/useGetReportLocations";

const SUMMARY_STATS = [
  { label: "Total Target", value: 124, icon: FileText, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" },
  { label: "Laporan Baru", value: 12, icon: AlertCircle, color: "text-[#C01D33]", bg: "bg-red-100", border: "border-red-200" },
  { label: "Diproses", value: 45, icon: Clock, color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200" },
  { label: "Tuntas", value: 67, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Menunggu", color: "bg-amber-100 text-amber-700 border-amber-200" },
  verified: { label: "Terverifikasi", color: "bg-blue-100 text-blue-700 border-blue-200" },
  in_progress: { label: "Diproses", color: "bg-orange-100 text-orange-700 border-orange-200" },
  resolved: { label: "Selesai", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rejected: { label: "Ditolak", color: "bg-red-100 text-[#C01D33] border-red-200" },
};

export default function AgencyDashboard() {
  const { data: _session } = authClient.useSession();
  const [activeTab, setActiveTab] = useState("Semua");
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: reportsData } = useGetReportLocations();
  const reports = reportsData?.data || [];

  const [viewport, setViewport] = useState({
    center: [106.8229, -6.1944] as [number, number],
    zoom: 12,
    pitch: 45,
    bearing: 0
  });

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch GPS on mount silently
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.longitude, pos.coords.latitude]);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const selectedReport = reports.find(r => r.id === selectedMarkerId);

  useEffect(() => {
    if (selectedReport) {
      setViewport(prev => ({ 
        ...prev, 
        center: [selectedReport.lng, selectedReport.lat],
        zoom: 15
      }));
      setDraftStatus(selectedReport.status);
    }
  }, [selectedMarkerId, selectedReport]);

  const handleSaveStatus = () => {
    if (draftStatus && selectedMarkerId) {
      // TODO: Call API to update status
      console.warn("Update status not implemented yet (needs API integration)");
      setSelectedMarkerId(null);
    }
  };

  const handleLocate = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.longitude, pos.coords.latitude]);
        setViewport(prev => ({ ...prev, center: [pos.coords.longitude, pos.coords.latitude], zoom: 15 }));
      }
    );
  };

  const getBadgeStyle = (status: string) => {
    switch(status) {
      case "pending": return "bg-red-100 text-[#C01D33] border border-red-200";
      case "verified":
      case "in_progress": return "bg-orange-100 text-orange-700 border border-orange-200";
      case "resolved": return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "rejected": return "bg-gray-100 text-gray-700 border border-gray-200";
      default: return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const getMarkerColor = (status: string) => {
    switch(status) {
      case "pending": return "bg-[#C01D33] shadow-red-500/50 text-white";
      case "verified":
      case "in_progress": return "bg-orange-500 shadow-orange-500/50 text-white";
      case "resolved": return "bg-emerald-500 shadow-emerald-500/50 text-white";
      default: return "bg-gray-500 shadow-gray-500/50 text-white";
    }
  };

  const filteredReports = reports.filter(r => {
    // Tab filter
    if (activeTab === "Baru" && r.status !== "pending") return false;
    if (activeTab === "Diproses" && r.status !== "verified" && r.status !== "in_progress") return false;
    if (activeTab === "Tuntas" && r.status !== "resolved") return false;
    
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const locName = r.cabangDinas?.name || r.dinas?.name || "Pusat";
      const matchesSearch = 
        r.id.toString().includes(q) || 
        r.title.toLowerCase().includes(q) || 
        locName.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    
    return true;
  });

  return (
    <div className="relative w-full h-screen bg-[#F0F2F5] overflow-hidden font-sans">
      
      {/* Map background */}
      <div className="absolute inset-0 z-0">
        <Map
          viewport={viewport}
          onViewportChange={setViewport}
          theme="light"
          className="w-full h-full"
        >
          <MapControls position="top-right" showZoom showLocate />
          
          {reports.map((report) => (
            <MapMarker key={report.id} longitude={report.lng} latitude={report.lat}>
              {selectedMarkerId !== report.id && (
                <MarkerPopup closeButton={false} anchor="top">
                  <div className="p-1 min-w-[120px] pointer-events-none">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${getBadgeStyle(report.status)}`}>
                      {STATUS_MAP[report.status]?.label || report.status}
                    </span>
                    <h4 className="font-extrabold text-[#111827] text-[11px] mt-1 leading-tight truncate">{report.title}</h4>
                  </div>
                </MarkerPopup>
              )}
              <MarkerContent>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedMarkerId(report.id); }}
                  className="relative group transition-transform hover:scale-110 focus:outline-none"
                >
                  {(report.status === "pending" || selectedMarkerId === report.id) && (
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                      selectedMarkerId === report.id ? "bg-indigo-500" : "bg-[#C01D33]"
                    }`}></div>
                  )}
                  <div className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-xl border-2 transition-all z-10 
                    ${selectedMarkerId === report.id ? 'bg-gray-900 border-white text-white scale-110' : getMarkerColor(report.status) + ' border-white'}`}>
                    {report.status === "pending" ? <AlertCircle size={16} strokeWidth={selectedMarkerId === report.id ? 3 : 2.5} /> :
                     (report.status === "verified" || report.status === "in_progress") ? <Clock size={16} strokeWidth={selectedMarkerId === report.id ? 3 : 2.5} /> :
                     <CheckCircle2 size={16} strokeWidth={selectedMarkerId === report.id ? 3 : 2.5} />}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 w-4 h-1 bg-black/20 blur-sm rounded-full -translate-x-1/2"></div>
                </button>
              </MarkerContent>
            </MapMarker>
          ))}
          
          {userLocation && (
            <MapMarker longitude={userLocation[0]} latitude={userLocation[1]}>
              <MarkerContent>
                <div className="flex flex-col items-center -mt-6 pointer-events-none">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center animate-ping absolute inset-0" />
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-emerald-500 relative z-10">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="5" r="3" fill="#10b981" />
                        <path d="M12 9c-3 0-5 2-5 4v1a1 1 0 001 1h8a1 1 0 001-1v-1c0-2-2-4-5-4z" fill="#10b981" />
                        <path d="M10 15v4.5a1 1 0 002 0V15M12 15v4.5a1 1 0 002 0V15" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
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
        </Map>
      </div>

      {/* Desktop: Left sidebar panel */}
      <AnimatePresence>
        {isSidebarOpen && isDesktop && (
          <motion.div 
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-20 left-5 z-20 pointer-events-none"
          >
            <motion.div
              drag
              dragMomentum={false}
              className="pointer-events-auto h-[calc(100vh-120px)] min-h-[400px] w-[380px] min-w-[320px] max-w-[600px] flex flex-col bg-white shadow-2xl border border-gray-100 rounded-2xl overflow-hidden resize"
            >
            <div className="p-5 border-b border-gray-100 cursor-move active:cursor-grabbing">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-heading font-black text-xl text-gray-900 tracking-tight">Dashboard</h3>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 z-10">
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SUMMARY_STATS.map((stat) => (
                  <div key={stat.label} className={`p-3.5 rounded-xl ${stat.bg} relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-125 transition-transform duration-500">
                      <stat.icon size={40} className={stat.color} />
                    </div>
                    <div className="relative z-10">
                      <div className="text-2xl font-black text-[#111827] mb-0.5 leading-none">{stat.value}</div>
                      <div className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-3 flex gap-2 overflow-x-auto border-b border-gray-100">
              {["Semua", "Baru", "Diproses", "Tuntas"].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-gray-50/50">
              <div className="flex items-center justify-between px-1 mb-2">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  Tickets <span className="bg-white text-gray-900 px-2 py-0.5 rounded-full text-[10px] border border-gray-200">{filteredReports.length}</span>
                </h3>
                <button className="text-gray-400 hover:text-gray-900"><ListFilter size={13} strokeWidth={3} /></button>
              </div>

              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari ID, kategori, atau lokasi..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-[11px] focus:outline-none focus:border-gray-300 transition-all font-medium text-gray-700 placeholder:text-gray-400/70"
                />
              </div>

              {filteredReports.map((report) => (
                <button 
                  key={report.id}
                  onClick={() => setSelectedMarkerId(report.id)}
                  className={`w-full text-left bg-white p-4 rounded-xl border transition-all duration-200 ${
                    selectedMarkerId === report.id 
                    ? 'border-[#C01D33]/30 shadow-md shadow-red-500/5 ring-1 ring-[#C01D33]/20' 
                    : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getBadgeStyle(report.status)}`}>
                      {STATUS_MAP[report.status]?.label || report.status}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-[#111827] text-sm leading-snug line-clamp-1 mb-1.5">{report.title}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                      <MapPin size={10} /> {report.cabangDinas?.name || report.dinas?.name || "Pusat"}
                    </div>
                    <span className="text-[10px] font-black text-gray-300">#{report.id.substring(0,8)}</span>
                  </div>
                </button>
              ))}
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile: Bottom sheet ticket list */}
      <AnimatePresence>
        {isSidebarOpen && !isDesktop && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-black/40"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
              style={{ height: "75vh" }}
            >
              <div className="flex items-center justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              <div className="px-5 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-heading font-black text-lg text-gray-900">Daftar Laporan</h3>
                    <p className="text-xs text-gray-400 font-medium">{filteredReports.length} tiket aktif</p>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-gray-900 p-1.5">
                    <X size={20} strokeWidth={2.5} />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {SUMMARY_STATS.map((stat) => (
                    <div key={stat.label} className={`p-2.5 rounded-xl ${stat.bg} text-center`}>
                      <div className="text-lg font-black text-[#111827] leading-none">{stat.value}</div>
                      <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mt-0.5 leading-tight">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 py-2.5 flex gap-2 overflow-x-auto border-b border-gray-100 shrink-0">
                {["Semua", "Baru", "Diproses", "Tuntas"].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5">
                {filteredReports.map((report) => (
                  <button 
                    key={report.id}
                    onClick={() => { setSelectedMarkerId(report.id); setIsSidebarOpen(false); }}
                    className={`w-full text-left bg-white p-4 rounded-xl border transition-all duration-200 ${
                      selectedMarkerId === report.id
                      ? 'border-[#C01D33]/30 ring-1 ring-[#C01D33]/20 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getBadgeStyle(report.status)}`}>
                        {STATUS_MAP[report.status]?.label || report.status}
                      </span>
                      <span className="text-[10px] font-medium text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-[#111827] text-sm leading-snug line-clamp-1 mb-1.5">{report.title}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                        <MapPin size={10} /> {report.cabangDinas?.name || report.dinas?.name || "Pusat"}
                      </div>
                      <span className="text-[10px] font-black text-gray-300">#{report.id.substring(0,8)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={isDesktop ? { x: "100%", opacity: 0 } : { y: "100%", opacity: 0 }}
            animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
            exit={isDesktop ? { x: "100%", opacity: 0 } : { y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className={`absolute z-30 pointer-events-none
              ${isDesktop 
                ? "top-20 right-5" 
                : "bottom-0 left-0 right-0 h-[88vh]"
              }`}
          >
            <motion.div
              drag={isDesktop}
              dragMomentum={false}
              className={`bg-white flex flex-col resize pointer-events-auto
                ${isDesktop 
                  ? "h-[calc(100vh-100px)] min-h-[400px] w-[420px] min-w-[320px] max-w-[600px] shadow-2xl rounded-2xl border border-gray-100 overflow-hidden" 
                  : "w-full h-full rounded-t-3xl shadow-2xl overflow-hidden"
                }`}
            >
            {/* Handle bar on mobile */}
            {!isDesktop && (
              <div className="flex items-center justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>
            )}

            <div className={`px-6 py-4 flex justify-between items-center bg-white border-b border-gray-100 shrink-0 ${isDesktop ? "rounded-t-2xl cursor-move active:cursor-grabbing" : ""}`}>
              <div>
                <h3 className="font-heading font-black text-lg text-gray-900 tracking-tight leading-none">
                  Tinjauan Tiket
                </h3>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
                  #TCK-{selectedReport.id.substring(0, 8)}
                </p>
              </div>
              <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setSelectedMarkerId(null)}
                className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 z-10"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col">
              
              <div className="bg-white px-6 pt-5 pb-5 space-y-5">
                <div className="w-full h-[100px] bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400">
                  <AlertCircle size={22} className="mb-1.5 opacity-50" />
                  <span className="text-[10px] uppercase font-black tracking-widest">Tidak Ada Foto</span>
                </div>

                <div>
                  <h2 className="text-base font-black text-gray-900 leading-tight mb-1.5">{selectedReport.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{selectedReport.kategori?.name || "Laporan Warga"}</p>
                  
                  <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pelapor</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                        <User size={11} className="text-[#C01D33]" /> Anonim
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Waktu</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                        <Clock size={11} className="text-[#C01D33]" /> {new Date(selectedReport.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5 col-span-2 pt-2 border-t border-gray-200/50">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Koordinat</span>
                      <div className="flex items-center justify-between text-xs font-bold text-gray-900 bg-white px-2.5 py-1.5 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={11} className="text-blue-500" /> 
                          <span className="font-mono text-[11px]">{selectedReport.lat.toFixed(4)}, {selectedReport.lng.toFixed(4)}</span>
                        </div>
                        <button className="text-[9px] uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          Nav
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-5 flex-1">
                <h4 className="text-[11px] font-black text-[#111827] uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Settings size={13} className="text-gray-400" /> Kontrol Resolusi
                </h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ubah Status</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => setDraftStatus('baru')} className={`py-2.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${draftStatus === 'baru' ? 'border-[#C01D33] bg-red-50 text-[#C01D33]' : 'border-gray-100 text-gray-400 hover:border-gray-200 bg-white'}`}>Baru</button>
                      <button onClick={() => setDraftStatus('proses')} className={`py-2.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${draftStatus === 'proses' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400 hover:border-gray-200 bg-white'}`}>Proses</button>
                      <button onClick={() => setDraftStatus('selesai')} className={`py-2.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${draftStatus === 'selesai' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-400 hover:border-gray-200 bg-white'}`}>Selesai</button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Catatan Dinas</Label>
                    <Textarea 
                      placeholder="Langkah penanganan yang sudah/akan diambil..." 
                      className="rounded-xl min-h-[80px] bg-white border-2 border-gray-100 focus:border-[#C01D33] focus:ring-0 text-gray-900 text-sm resize-none p-3 shadow-none" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <Button 
                onClick={handleSaveStatus} 
                className="w-full bg-[#111827] hover:bg-gray-800 rounded-xl h-12 text-white font-black tracking-widest text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                SIMPAN <ArrowRight size={15} strokeWidth={3} className="opacity-60" />
              </Button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Toolbar Dock */}
      <div className="absolute bottom-5 left-0 right-0 z-20 flex justify-center px-4">
        <div className="bg-white rounded-full shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)] border border-gray-100 flex items-center px-2 py-1.5 gap-1 w-full max-w-sm md:max-w-md">
          
          {/* Search — always open */}
          <div className="flex items-center flex-1 gap-1 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 min-w-0">
            <Search size={15} strokeWidth={2.5} className="text-[#db2744] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari laporan..."
              className="bg-transparent border-none outline-none text-xs font-bold text-gray-900 placeholder:text-gray-400 w-full py-1.5"
            />
          </div>

          <div className="w-px h-5 bg-gray-200 shrink-0 mx-0.5" />

          {/* Ticket list toggle */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full transition-all font-bold shrink-0 ${
              isSidebarOpen ? "bg-[#db2744] text-white shadow-md shadow-red-500/20" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ListFilter size={16} strokeWidth={2.5} />
            <span className="text-xs hidden sm:inline">Tiket</span>
          </button>

          <div className="w-px h-5 bg-gray-200 shrink-0 mx-0.5" />

          {/* GPS */}
          <button 
            onClick={handleLocate}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#db2744] text-white shadow-lg shadow-red-500/20 hover:bg-rose-600 transition-all shrink-0"
          >
            <Navigation size={16} strokeWidth={2.5} fill="white" />
          </button>
        </div>
      </div>

    </div>
  );
}
