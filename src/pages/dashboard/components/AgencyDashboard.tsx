import { useState, useEffect, useRef } from "react";
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, CheckCircle2, Clock, AlertCircle, MapPin, 
  Search, Settings, ListFilter,
  X, ChevronLeft, ChevronRight, User, Navigation, ArrowRight
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SUMMARY_STATS = [
  { label: "Total Target", value: 124, icon: FileText, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" },
  { label: "Laporan Baru", value: 12, icon: AlertCircle, color: "text-[#C01D33]", bg: "bg-red-100", border: "border-red-200" },
  { label: "Diproses", value: 45, icon: Clock, color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200" },
  { label: "Tuntas", value: 67, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200" },
];

const MOCK_REPORTS = [
  { id: 1, title: "Jalan Berlubang di Sudirman", description: "Terdapat lubang jalan selebar 1 meter yang membahayakan pengendara motor.", status: "baru", time: "10m lalu", loc: "Jakarta Selatan", lat: -6.2250, lng: 106.8040, reporter: "Budi Santoso", images: ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=250&fit=crop"] },
  { id: 2, title: "Lampu Penyebrangan Rusak", description: "Lampu lalu lintas di persimpangan utama mati total.", status: "proses", time: "1j lalu", loc: "Jakarta Pusat", lat: -6.1944, lng: 106.8229, reporter: "Sarah Dina", images: ["https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=250&fit=crop", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop"] },
  { id: 3, title: "Pohon Tumbang Halangi Rute", description: "Pohon besar tumbang menutup lajur lambat dekat pintu masuk tol.", status: "baru", time: "2j lalu", loc: "Jakarta Barat", lat: -6.1750, lng: 106.7900, reporter: "Andi R.", images: ["https://images.unsplash.com/photo-1605725658213-4c5720351cdd?w=400&h=250&fit=crop"] },
  { id: 4, title: "Jembatan Penyebrangan Ambruk", description: "Atap JPO lepas tertiup angin kencang kemarin sore.", status: "selesai", time: "1h lalu", loc: "Jakarta Timur", lat: -6.2000, lng: 106.8700, reporter: "Hilda", images: ["https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&h=250&fit=crop"] },
  { id: 5, title: "Banjir Genangan 50cm", description: "Genangan air tidak kunjung surut meskipun hujan sudah berhenti 3 jam lalu.", status: "proses", time: "2h lalu", loc: "Jakarta Utara", lat: -6.1200, lng: 106.8900, reporter: "Tigor Siregar", images: [] },
];

export default function AgencyDashboard() {
  const { data: _session } = authClient.useSession();
  const [activeTab, setActiveTab] = useState("Semua");
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [currentImg, setCurrentImg] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [draftStatus, setDraftStatus] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    if (showSearch) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSearch]);

  const selectedReport = reports.find(r => r.id === selectedMarkerId);

  useEffect(() => {
    if (selectedReport) {
      setViewport(prev => ({ 
        ...prev, 
        center: [selectedReport.lng, selectedReport.lat],
        zoom: 15
      }));
      setCurrentImg(0);
      setDraftStatus(selectedReport.status);
    }
  }, [selectedMarkerId]);

  const handleSaveStatus = () => {
     if (draftStatus && selectedMarkerId) {
        setReports(prev => prev.map(r => r.id === selectedMarkerId ? { ...r, status: draftStatus } : r));
        setSelectedMarkerId(null);
     }
  };

  const getBadgeStyle = (status: string) => {
    switch(status) {
      case "baru": return "bg-red-100 text-[#C01D33] border border-red-200";
      case "proses": return "bg-orange-100 text-orange-700 border border-orange-200";
      case "selesai": return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      default: return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const getMarkerColor = (status: string) => {
    switch(status) {
      case "baru": return "bg-[#C01D33] shadow-red-500/50 text-white";
      case "proses": return "bg-orange-500 shadow-orange-500/50 text-white";
      case "selesai": return "bg-emerald-500 shadow-emerald-500/50 text-white";
      default: return "bg-gray-500 shadow-gray-500/50 text-white";
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#F0F2F5] overflow-hidden font-sans">
      
      <div className="absolute inset-0 z-0">
        <Map
          viewport={viewport}
          onViewportChange={setViewport}
          className="w-full h-full filter"
        >
          <MapControls position="top-right" showZoom showLocate />
          
          {reports.map((report) => (
             <MapMarker key={report.id} longitude={report.lng} latitude={report.lat}>
               {selectedMarkerId !== report.id && (
                 <MarkerPopup closeButton={false} anchor="top">
                    <div className="p-1 min-w-[120px] pointer-events-none">
                       <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${getBadgeStyle(report.status)}`}>
                         {report.status}
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
                    {(report.status === "baru" || selectedMarkerId === report.id) && (
                      <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                        selectedMarkerId === report.id ? "bg-indigo-500" : "bg-[#C01D33]"
                      }`}></div>
                    )}
                    
                    <div className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-xl border-2 transition-all z-10 
                      ${selectedMarkerId === report.id ? 'bg-gray-900 border-white text-white scale-110' : getMarkerColor(report.status) + ' border-white'}`}>
                       {report.status === "baru" ? <AlertCircle size={16} strokeWidth={selectedMarkerId === report.id ? 3 : 2.5} /> :
                        report.status === "proses" ? <Clock size={16} strokeWidth={selectedMarkerId === report.id ? 3 : 2.5} /> :
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

      <div className="absolute top-0 bottom-0 left-0 right-0 z-10 pointer-events-none flex flex-col md:flex-row p-4 md:p-6 pb-24 md:pb-6 gap-6 pt-24">
        
        <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full md:w-[380px] h-full flex flex-col bg-white rounded-sm shadow-2xl border border-gray-100 pointer-events-auto overflow-hidden shrink-0"
          >
             <div className="p-6 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-heading font-black text-xl text-gray-900 tracking-tight leading-none">Dashboard</h3>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-gray-400 hover:text-gray-900 transition-colors p-2 -mr-2"
                  >
                     <X size={20} strokeWidth={2.5} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                 {SUMMARY_STATS.map((stat) => (
                    <div key={stat.label} className={`p-4 rounded-sm ${stat.bg} ${stat.border} border/50 relative overflow-hidden group`}>
                       <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-125 transition-transform duration-500">
                          <stat.icon size={48} className={stat.color} />
                       </div>
                       <div className="relative z-10">
                         <div className="text-2xl font-black text-[#111827] mb-1 leading-none">{stat.value}</div>
                         <div className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="px-6 py-4 flex gap-2 overflow-x-auto hide-scrollbar border-b border-gray-100/50">
              {["Semua", "Baru", "Diproses", "Tuntas"].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                 >
                    {tab}
                 </button>
              ))}
           </div>

           <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white scroll-smooth relative">
              <div className="flex items-center justify-between px-2 mb-2">
                 <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   DAFTAR TICKETS <span className="bg-white border border-gray-200 text-gray-900 px-2.5 py-0.5 rounded-full text-[10px] shadow-sm">{MOCK_REPORTS.length}</span>
                 </h3>
                 <button className="text-gray-400 hover:text-gray-900 transition-colors"><ListFilter size={14} strokeWidth={3} /></button>
              </div>

              {MOCK_REPORTS.map((report) => (
                 <button 
                   key={report.id}
                   onClick={() => setSelectedMarkerId(report.id)}
                   className={`w-full text-left bg-white p-4 rounded-sm outline outline-1 outline-transparent transition-all duration-300 ${
                     selectedMarkerId === report.id 
                     ? 'border-transparent outline-[#C01D33] shadow-lg shadow-red-500/10 scale-[1.02] bg-red-50/20' 
                     : 'border-gray-100 border hover:border-gray-300 hover:shadow-md'
                   }`}
                 >
                    <div className="flex justify-between items-start mb-3">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${getBadgeStyle(report.status)}`}>
                          {report.status}
                       </span>
                       <span className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${selectedMarkerId === report.id ? 'bg-[#C01D33] text-white' : 'text-gray-400 bg-gray-50'}`}>{report.time}</span>
                    </div>
                    <h4 className="font-extrabold text-[#111827] text-sm leading-snug line-clamp-2 mb-2 pr-4">{report.title}</h4>
                    <div className="flex items-center justify-between text-[11px] font-medium">
                       <div className="flex items-center gap-1.5 text-gray-500">
                          <MapPin size={12} className={selectedMarkerId === report.id ? 'text-[#C01D33]' : 'text-gray-400'} /> {report.loc}
                       </div>
                       <div className="text-[10px] font-black text-gray-300 tracking-wider">
                         #TCK-{report.id.toString().padStart(3, '0')}
                       </div>
                    </div>
                 </button>
              ))}
           </div>
        </motion.div>
        )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={isDesktop ? { x: "100%", opacity: 0 } : { y: "100%", opacity: 0 }}
            animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
            exit={isDesktop ? { x: "100%", opacity: 0 } : { y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className={`absolute z-30 bg-white flex flex-col pointer-events-auto
              ${isDesktop 
                ? "top-24 right-6 bottom-6 w-[420px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-sm border border-gray-100" 
                : "bottom-0 left-0 w-full rounded-t-sm h-[85vh] shadow-[0_-20px_40px_rgba(0,0,0,0.1)]"
              }`}
          >
            <div className="px-7 py-5 flex justify-between items-center bg-white border-b border-gray-100 rounded-t-sm shrink-0">
               <div>
                  <h3 className="font-heading font-black text-xl text-gray-900 tracking-tight leading-none">
                    Tinjauan Tiket
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">
                    #TCK-{selectedReport.id.toString().padStart(3, '0')}
                  </p>
               </div>
               <button 
                 onClick={() => setSelectedMarkerId(null)}
                 className="text-gray-400 hover:text-gray-900 transition-colors p-2 -mr-2"
               >
                  <X size={20} strokeWidth={2.5} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50/30 hide-scrollbar flex flex-col relative">
               
               <div className="bg-white p-7 pb-6 space-y-6">
                 
                 {selectedReport.images.length > 0 ? (
                   <div className="relative w-full h-[200px] bg-gray-100 rounded-sm overflow-hidden group">
                     <img 
                       src={selectedReport.images[currentImg] || selectedReport.images[0]} 
                       alt="Laporan" 
                       className="w-full h-full object-cover" 
                     />
                     <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white text-[10px] font-black tracking-widest">
                       BUKTI LAPANGAN
                     </div>
                     {selectedReport.images.length > 1 && (
                       <>
                         <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20">
                           {currentImg + 1} / {selectedReport.images.length}
                         </div>
                         <button onClick={(e) => { e.stopPropagation(); setCurrentImg((p) => (p === 0 ? selectedReport.images.length - 1 : p - 1)); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors opacity-0 group-hover:opacity-100">
                           <ChevronLeft size={16} className="text-gray-900" strokeWidth={3} />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); setCurrentImg((p) => (p === selectedReport.images.length - 1 ? 0 : p + 1)); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors opacity-0 group-hover:opacity-100">
                           <ChevronRight size={16} className="text-gray-900" strokeWidth={3} />
                         </button>
                       </>
                     )}
                   </div>
                 ) : (
                   <div className="w-full h-[120px] bg-gray-50 border border-dashed border-gray-200 rounded-sm flex flex-col items-center justify-center text-gray-400">
                     <AlertCircle size={24} className="mb-2 opacity-50" />
                     <span className="text-[10px] uppercase font-black tracking-widest">TIDAK ADA FOTO</span>
                   </div>
                 )}

                 <div>
                    <h2 className="text-lg font-black text-gray-900 leading-tight mb-2">{selectedReport.title}</h2>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium mb-4">
                      {selectedReport.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-sm border border-gray-100">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pelapor</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                          <User size={12} className="text-[#C01D33]" /> {selectedReport.reporter}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Waktu</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                          <Clock size={12} className="text-[#C01D33]" /> {selectedReport.time}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 col-span-2 pt-2 border-t border-gray-200/50">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Koordinat</span>
                        <div className="flex items-center justify-between text-xs font-bold text-gray-900 bg-white px-2 py-1.5 border border-gray-200 rounded-lg shrink-0">
                           <div className="flex items-center gap-1.5">
                             <MapPin size={12} className="text-blue-500" /> 
                             <span className="font-mono">{selectedReport.lat.toFixed(5)}, {selectedReport.lng.toFixed(5)}</span>
                           </div>
                           <button className="text-[9px] uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 focus:outline-none">Navigate</button>
                        </div>
                      </div>
                    </div>
                 </div>
               </div>

               <div className="mt-2 bg-white p-7 pb-10 border-t items-start flex-1 border-gray-100">
                 <h4 className="text-xs font-black text-[#111827] uppercase tracking-widest flex items-center gap-2 mb-4">
                   <Settings size={14} className="text-gray-400" /> Kontrol Resolusi
                 </h4>
                 
                 <div className="space-y-5">
                   <div className="space-y-2">
                     <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ubah Status Tiket</Label>
                     <div className="grid grid-cols-3 gap-2">
                       <button onClick={() => setDraftStatus('baru')} className={`py-2 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${draftStatus === 'baru' ? 'border-[#C01D33] bg-red-50 text-[#C01D33]' : 'border-gray-100 text-gray-400 hover:border-gray-200 bg-white'}`}>Baru</button>
                       <button onClick={() => setDraftStatus('proses')} className={`py-2 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${draftStatus === 'proses' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400 hover:border-gray-200 bg-white'}`}>Proses</button>
                       <button onClick={() => setDraftStatus('selesai')} className={`py-2 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${draftStatus === 'selesai' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-400 hover:border-gray-200 bg-white'}`}>Selesai</button>
                     </div>
                   </div>

                   <div className="space-y-2">
                     <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Catatan Penanganan Dinas (Opsional)</Label>
                     <Textarea 
                       placeholder="Sebutkan langkah yang sudah/akan diambil untuk membalas pelapor..." 
                       className="rounded-xl min-h-[90px] bg-white border-2 border-gray-100 focus:bg-gray-50 focus:border-[#C01D33] focus:ring-0 transition-all font-medium text-gray-900 text-sm resize-none p-4 shadow-none" 
                     />
                   </div>
                 </div>
               </div>
            </div>

            <div className="p-5 bg-white border-t border-gray-100 rounded-b-sm shrink-0">
               <Button onClick={handleSaveStatus} className="w-full bg-[#111827] hover:bg-gray-800 rounded-sm h-14 text-white font-black tracking-widest text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                 SIMPAN PEMBARUAN <ArrowRight size={16} strokeWidth={3} className="opacity-50" />
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 pointer-events-none">
         <div className="flex flex-col items-center gap-2 pointer-events-auto" ref={searchRef}>
           <div className="bg-white px-2 py-2 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 flex items-center gap-1.5">
             
             <div className="relative">
               <div className="flex items-center gap-2 rounded-full transition-all duration-300 overflow-hidden w-[240px] bg-gray-50 border border-gray-200 pr-1">
                 <button className="flex items-center justify-center shrink-0 p-3 rounded-full transition-all text-[#db2744]">
                   <Search size={18} strokeWidth={2.5} />
                 </button>
                 <input
                   type="text"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Cari ID atau Rute..."
                   className="bg-transparent border-none outline-none text-xs font-bold text-gray-900 placeholder:text-gray-400 w-full py-2 pr-2"
                 />
               </div>
             </div>

             <div className="w-[1px] h-6 bg-gray-200 mx-1" />

             <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 font-bold ${
                 isSidebarOpen ? "bg-[#db2744] text-white shadow-md shadow-red-500/20" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
               }`}
             >
                <ListFilter size={18} strokeWidth={2.5}/>
                <span className="text-xs font-bold tracking-wide">
                  Daftar Tiket
                </span>
             </button>

             <div className="w-[1px] h-6 bg-gray-200 mx-1" />

             <button 
               onClick={() => {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                       setUserLocation([pos.coords.longitude, pos.coords.latitude]);
                       setViewport(prev => ({...prev, center: [pos.coords.longitude, pos.coords.latitude], zoom: 15}));
                    }
                  )
               }}
               className="flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-300 bg-[#db2744] text-white shadow-lg shadow-red-500/20 hover:bg-rose-600 font-bold"
             >
                <Navigation size={18} strokeWidth={2.5} fill="white" />
             </button>

           </div>
         </div>
      </div>

    </div>
  );
}
