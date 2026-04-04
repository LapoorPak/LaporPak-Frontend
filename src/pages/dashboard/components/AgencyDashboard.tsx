import { useState, useEffect } from "react";
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, Clock, AlertCircle, MapPin } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const SUMMARY_STATS = [
  { label: "Total Laporan", value: 124, icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Laporan Baru", value: 12, icon: AlertCircle, color: "text-[#db2744]", bg: "bg-red-50" },
  { label: "Sedang Diproses", value: 45, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
  { label: "Selesai", value: 67, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
];

const MOCK_REPORTS = [
  { id: 1, title: "Jalan Berlubang di Sudirman", status: "baru", time: "10 menit yang lalu" },
  { id: 2, title: "Lampu Lalin Mati Bundaran HI", status: "proses", time: "1 jam yang lalu" },
  { id: 3, title: "Trotoar Ambles dekat Stasiun", status: "baru", time: "2 jam yang lalu" },
  { id: 4, title: "JPO Cawang Rusak", status: "selesai", time: "1 hari yang lalu" },
  { id: 5, title: "Rambu Penunjuk Arah Tertutup Pohon", status: "proses", time: "2 hari yang lalu" },
];

export default function AgencyDashboard() {
  const { data: session } = authClient.useSession();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getStatusColor = (status: string) => {
    if (status === "baru") return "bg-[#db2744] text-white";
    if (status === "proses") return "bg-amber-500 text-white";
    if (status === "selesai") return "bg-emerald-500 text-white";
    return "bg-gray-500 text-white";
  };

  return (
    <div className="relative w-full h-full bg-gray-100 flex flex-col lg:flex-row overflow-hidden">
      {/* Map Area */}
      <div className="flex-1 relative order-2 lg:order-1">
        <Map
          viewport={{ center: [106.8229, -6.1944], zoom: 12, pitch: 45 }}
          className="w-full h-full"
        >
          <MapControls position="bottom-right" showZoom showLocate />
          
          {/* Mock Markers corresponding to Right Sidebar list */}
          <MapMarker longitude={106.8229} latitude={-6.1944}>
            <MarkerPopup closeButton>
               <div className="p-1 min-w-[200px]">
                  <span className="bg-[#db2744] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">Baru</span>
                  <h4 className="font-bold text-sm mt-1.5 leading-tight">Jalan Berlubang di Sudirman</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">Ada lubang sedalam 10cm di bahu jalan depan halte TransJakarta.</p>
                  <span className="text-[10px] text-gray-400 mt-2 block font-medium">10 menit lalu</span>
               </div>
            </MarkerPopup>
            <MarkerContent>
               <div className="w-10 h-10 -mt-5 -ml-5 bg-[#db2744]/20 rounded-full flex items-center justify-center animate-pulse">
                 <div className="w-6 h-6 bg-[#db2744] hover:bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 transition-colors border-2 border-white">
                    <AlertCircle size={12} className="text-white" strokeWidth={3} />
                 </div>
               </div>
            </MarkerContent>
          </MapMarker>

          <MapMarker longitude={106.8400} latitude={-6.2000}>
            <MarkerPopup closeButton>
               <div className="p-1 min-w-[200px]">
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">Proses</span>
                  <h4 className="font-bold text-sm mt-1.5 leading-tight">Lampu Lalin Mati Bundaran HI</h4>
                  <span className="text-[10px] text-gray-400 mt-2 block font-medium">1 jam lalu</span>
               </div>
            </MarkerPopup>
            <MarkerContent>
               <div className="w-6 h-6 -mt-3 -ml-3 bg-amber-500 hover:bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50 transition-colors border-2 border-white">
                  <Clock size={12} className="text-white" strokeWidth={3} />
               </div>
            </MarkerContent>
          </MapMarker>

          <MapMarker longitude={106.8100} latitude={-6.1800}>
            <MarkerPopup closeButton>
               <div className="p-1 min-w-[200px]">
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">Selesai</span>
                  <h4 className="font-bold text-sm mt-1.5 leading-tight">JPO Cawang Rusak</h4>
                  <span className="text-[10px] text-gray-400 mt-2 block font-medium">1 hari lalu</span>
               </div>
            </MarkerPopup>
            <MarkerContent>
               <div className="w-6 h-6 -mt-3 -ml-3 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50 transition-colors border-2 border-white">
                  <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
               </div>
            </MarkerContent>
          </MapMarker>
        </Map>

        {/* Floating Summary Cards (Top Center/Right) */}
        <div className="absolute top-28 left-6 right-6 lg:left-6 lg:right-auto z-10 flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar pointer-events-none">
          {SUMMARY_STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={stat.label} 
                className="bg-white/85 backdrop-blur-3xl shrink-0 snap-center rounded-[1.5rem] p-5 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] border border-white flex items-center gap-4 min-w-[200px] pointer-events-auto transition-transform hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} shadow-inner`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold text-gray-400 tracking-widest uppercase mb-0.5">{stat.label}</div>
                  <div className="text-3xl font-black font-heading text-gray-900 leading-none">{stat.value}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Sidebar: Latest Reports */}
      <div className="w-full lg:w-96 bg-white border-l border-gray-100 shadow-2xl z-20 order-1 lg:order-2 flex flex-col lg:h-full h-[60vh] max-h-[60vh] lg:max-h-none shrink-0 pointer-events-auto">
         <div className="p-6 border-b border-gray-100 bg-gray-50/50 block lg:hidden">
            <h2 className="text-xl font-heading font-black text-gray-900 tracking-tight leading-none mb-1">
              Lapor<span className="text-[#db2744]">Pak</span>
            </h2>
            <span className="text-xs font-bold text-[#db2744] uppercase tracking-wider block">Portal Dinas • {session?.user?.name || "Agency"}</span>
         </div>
         
         <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div>
              <h3 className="font-heading font-bold text-lg text-gray-900 flex items-center gap-2">
                <span className="w-2 h-6 rounded-full bg-[#db2744]" /> Laporan Terbaru
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">Diurutkan dari yang paling baru</p>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
            {MOCK_REPORTS.map((report) => (
               <div key={report.id} className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                     <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                     </span>
                     <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                        <Clock size={12} /> {report.time}
                     </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-[#db2744] transition-colors line-clamp-2">
                    {report.title}
                  </h4>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <MapPin size={14} className="text-gray-400" /> Cawang, Jakarta Timur
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
