import { Outlet, Link, useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import { LogOut, User, Bell, Megaphone, X, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, Info } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NOTIFICATIONS = [
  {
    id: 1,
    type: "success" as const,
    title: "Laporan Diselesaikan",
    message: "Jalan berlubang di Jl. Sudirman telah diperbaiki oleh Dinas PU.",
    time: "12 menit lalu",
    read: false,
    tag: "Selesai",
  },
  {
    id: 2,
    type: "warning" as const,
    title: "Menunggu Verifikasi",
    message: "Laporan banjir Anda di kawasan Kelapa Gading sedang ditinjau petugas.",
    time: "1 jam lalu",
    read: false,
    tag: "Proses",
  },
  {
    id: 3,
    type: "info" as const,
    title: "Pembaruan Sistem",
    message: "Fitur pelacakan real-time kini tersedia untuk semua laporan aktif.",
    time: "3 jam lalu",
    read: true,
    tag: "Info",
  },
  {
    id: 4,
    type: "success" as const,
    title: "Laporan Diverifikasi",
    message: "Laporan sampah menumpuk di Pasar Minggu berhasil dikonfirmasi.",
    time: "5 jam lalu",
    read: true,
    tag: "Selesai",
  },
  {
    id: 5,
    type: "info" as const,
    title: "Tips Pelaporan",
    message: "Sertakan foto dan koordinat GPS untuk mempercepat proses verifikasi laporan Anda.",
    time: "1 hari lalu",
    read: true,
    tag: "Info",
  },
];

const iconMap = {
  success: CheckCircle2,
  warning: Clock,
  danger: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    dot: "bg-emerald-500",
    tagBg: "bg-emerald-50 text-emerald-700",
  },
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
    dot: "bg-amber-500",
    tagBg: "bg-amber-50 text-amber-700",
  },
  danger: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-100",
    dot: "bg-red-500",
    tagBg: "bg-red-50 text-red-700",
  },
  info: {
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-100",
    dot: "bg-sky-500",
    tagBg: "bg-sky-50 text-sky-700",
  },
};

export default function DashboardLayout() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;
  const filteredNotifications = activeTab === "unread" ? NOTIFICATIONS.filter((n) => !n.read) : NOTIFICATIONS;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (bellRef.current?.contains(target)) return;
      if (panelRef.current && !panelRef.current.contains(target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications]);

  const handleLogout = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    await authClient.signOut();
    navigate("/login");
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-gray-50 overflow-hidden relative font-sans">
      <header className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-5xl rounded-full bg-white shadow-lg px-4 py-2.5 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5 group hover:opacity-80 transition-opacity shrink-0">
           <Megaphone size={24} className="text-[#db2744] shrink-0" strokeWidth={1.5} fill="#db2744" />
           <span className="text-lg font-black font-heading tracking-tight text-gray-900 leading-none">
             Lapor<span className="text-[#db2744]">Pak</span>
           </span>
        </Link>
        
        <div className="flex items-center gap-3 md:gap-5">
          <div className="flex items-center gap-2 relative" ref={panelRef}>
             <button 
                ref={bellRef}
                onClick={() => setShowNotifications(!showNotifications)}
                className={`transition-all w-8 h-8 flex items-center justify-center rounded-full relative border ${
                  showNotifications 
                    ? "bg-red-50 border-red-200 text-[#db2744]" 
                    : "bg-white border-gray-200 text-gray-500 hover:text-[#db2744] hover:bg-red-50 hover:border-red-100"
                }`}
             >
                <Bell size={15} strokeWidth={2.5} />
                {unreadCount > 0 && (
                  <span className={`absolute bg-[#db2744] text-white -top-1 -right-1 min-w-[15px] min-h-[15px] rounded-full text-[8px] font-black flex items-center justify-center leading-none ring-2 ring-white shadow-sm`}>
                    {unreadCount}
                  </span>
                )}
             </button>

             <AnimatePresence>
               {showNotifications && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95, y: 6 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 6 }}
                     transition={{ duration: 0.15, ease: "easeOut" }}
                     className="fixed top-[75px] left-4 right-4 sm:absolute sm:top-full sm:-right-2 sm:left-auto sm:mt-3 sm:w-[400px] w-auto bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] sm:shadow-2xl border border-gray-100 z-50 text-left sm:origin-top-right flex flex-col overflow-hidden max-h-[85vh] sm:max-h-[500px]"
                   >
                     <div className="px-5 pt-4 pb-3 bg-white border-b border-gray-100">
                       <div className="flex justify-between items-center mb-3">
                         <h4 className="font-heading font-black text-base text-gray-900 tracking-tight leading-none">Notifikasi</h4>
                         <button 
                           onClick={() => setShowNotifications(false)} 
                           className="text-gray-400 hover:text-gray-900 transition-colors"
                         >
                           <X size={16} strokeWidth={2} />
                         </button>
                       </div>
                       
                       <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                         <button
                           onClick={() => setActiveTab("all")}
                           className={`flex-1 text-[11px] font-bold py-1.5 rounded-md transition-all duration-200 ${
                             activeTab === "all"
                               ? "bg-white text-gray-900 shadow-sm"
                               : "text-gray-500 hover:text-gray-700"
                           }`}
                         >
                           Semua
                         </button>
                         <button
                           onClick={() => setActiveTab("unread")}
                           className={`flex-1 text-[11px] font-bold py-1.5 rounded-md transition-all duration-200 ${
                             activeTab === "unread"
                               ? "bg-white text-gray-900 shadow-sm"
                               : "text-gray-500 hover:text-gray-700"
                           }`}
                         >
                           Belum Dibaca ({unreadCount})
                         </button>
                       </div>
                     </div>
                     
                     <div className="max-h-[380px] overflow-y-auto">
                       {filteredNotifications.length === 0 ? (
                         <div className="py-12 text-center">
                           <Bell size={28} className="text-gray-200 mx-auto mb-2" />
                           <p className="text-xs font-bold text-gray-400">Tidak ada notifikasi</p>
                         </div>
                       ) : (
                         <div>
                           {filteredNotifications.map((notif, idx) => {
                             const Icon = iconMap[notif.type];
                             const colors = colorMap[notif.type];
                             return (
                               <motion.div
                                 key={notif.id}
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 transition={{ delay: idx * 0.03, duration: 0.2 }}
                                 className={`group px-4 py-3.5 flex gap-3.5 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                                   !notif.read
                                     ? "bg-red-50/30 hover:bg-red-50/60"
                                     : "hover:bg-gray-50/80"
                                 }`}
                               >
                                 <div className={`w-10 h-10 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center shrink-0`}>
                                   <Icon size={18} strokeWidth={2.5} />
                                 </div>

                                 <div className="flex-1 min-w-0">
                                   <div className="flex items-start justify-between gap-2 mb-0.5">
                                     <p className={`text-[13px] leading-tight ${
                                       !notif.read ? "font-extrabold text-gray-900" : "font-semibold text-gray-600"
                                     }`}>
                                       {notif.title}
                                     </p>
                                     <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${colors.tagBg}`}>
                                       {notif.tag}
                                     </span>
                                   </div>
                                   <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">
                                     {notif.message}
                                   </p>
                                   <span className="text-[10px] text-gray-400 font-medium mt-1 block">{notif.time}</span>
                                 </div>
                               </motion.div>
                             );
                           })}
                         </div>
                       )}
                     </div>

                     <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
                       <button className="text-[11px] font-bold text-gray-400 hover:text-gray-700 transition-colors">
                         Tandai semua dibaca
                       </button>
                       <button className="text-[11px] font-bold text-[#db2744] hover:text-rose-700 transition-colors flex items-center gap-1">
                         Lihat semua
                         <ArrowUpRight size={11} />
                       </button>
                     </div>
                   </motion.div>
               )}
             </AnimatePresence>
          </div>
          
          <div className="h-8 w-[1px] bg-gray-200 hidden sm:block mx-1" />
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 cursor-pointer group">
               <div className="w-8 h-8 rounded-full bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors overflow-hidden border border-red-100 shrink-0">
                 {session?.user?.image ? (
                   <img src={session.user.image} alt={session.user.name} referrerPolicy="no-referrer" crossOrigin="anonymous" className="w-full h-full object-cover" />
                 ) : (
                   <User size={15} className="text-[#db2744]" strokeWidth={2.5} />
                 )}
               </div>
               <div className="flex flex-col max-w-[100px] sm:max-w-none">
                 <span className="text-xs font-bold text-gray-900 tracking-wide leading-none mb-0.5 truncate">
                   {session?.user?.name?.split(" ")[0] || "Pengguna"}
                 </span>
                 <span className="text-[9px] font-black text-[#db2744] uppercase tracking-widest leading-none">
                   {session?.user?.role || "Warga"}
                 </span>
               </div>
            </div>
            
            <button 
               onClick={handleLogout}
               disabled={isSigningOut}
               className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-[#db2744] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
               title="Keluar"
            >
              {isSigningOut ? (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-[#db2744] animate-spin" />
              ) : (
                <LogOut size={15} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full h-full relative">
        <Outlet />
      </main>
    </div>
  );
}
