import { Outlet, Link, useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import { useGetSessionDetail } from "@/hooks/auth";
import { useGetNotifications, useGetUnreadNotificationCount, useMarkAllNotificationsRead, useMarkNotificationRead } from "@/hooks/notifications";
import { QUERY_KEYS } from "@/api/queryKeys";
import { setAuthRedirectSuppressed } from "@/config/api-client";
import type { NotificationItem, NotificationType } from "@/api/notifications/notifications-queries";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getDashboardPathForRole, getLoginPathForRole, getPortalFromRole } from "@/lib/auth-portal";
import { clearOAuthAttemptPortal } from "@/lib/oauth-attempt";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { buildReportFocusSearch } from "@/lib/report-focus-navigation";
import { DashboardViewModeProvider, useDashboardViewMode, type DashboardViewMode } from "@/context/dashboard-view-mode";
import { LogOut, User, Bell, X, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, Info, type LucideIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardViewModeToggle } from "@/pages/dashboard/components/shared";

const iconMap: Record<NotificationType, LucideIcon> = {
  success: CheckCircle2,
  warning: Clock,
  danger: AlertTriangle,
  info: Info,
};

const colorMap: Record<
  NotificationType,
  {
    bg: string;
    text: string;
    border: string;
    dot: string;
    tagBg: string;
  }
> = {
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

const formatRoleLabel = (role?: string | null) => {
  if (!role) {
    return "Warga";
  }

  return role
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getDashboardIdentityLabel = ({
  role,
  branchName,
  agencyName,
}: {
  role?: string | null;
  branchName?: string | null;
  agencyName?: string | null;
}) => {
  if (role === "warga") {
    return "Warga";
  }

  return branchName || agencyName || formatRoleLabel(role);
};

function DashboardShell() {
  const { data: session } = authClient.useSession();
  const userPortal = getPortalFromRole(session?.user?.role);
  const dashboardPath = getDashboardPathForRole(session?.user?.role);
  const { viewMode, setViewMode, mobileControls } = useDashboardViewMode();
  const { data: sessionDetailResponse } = useGetSessionDetail({
    enabled: !!session?.user && userPortal !== "citizen",
    staleTime: 5 * 60 * 1000,
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  const notificationParams = activeTab === "unread" ? { page: 1, limit: 10, unread: true } : { page: 1, limit: 10 };
  const {
    data: notificationsResponse,
    isLoading: isNotificationsLoading,
    isFetching: isNotificationsFetching,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useGetNotifications(notificationParams, {
    enabled: !!session?.user && showNotifications,
  });
  const { data: unreadCountResponse, refetch: refetchUnreadCount } = useGetUnreadNotificationCount({
    enabled: !!session?.user,
    refetchInterval: session?.user ? 60_000 : false,
  });

  const notifications = notificationsResponse?.data ?? [];
  const unreadCount = unreadCountResponse?.data.unreadCount ?? notificationsResponse?.stats.unreadCount ?? 0;
  const notificationsErrorMessage = notificationsError
    ? getApiErrorMessage(notificationsError, "Gagal memuat notifikasi.")
    : null;
  const userFullName = session?.user?.name || "Pengguna";
  const userDisplayName = session?.user?.name?.split(" ")[0] || "Pengguna";
  const userBranchName =
    sessionDetailResponse?.data.petugas?.cabangDinas?.name || null;
  const userAgencyName =
    sessionDetailResponse?.data.petugas?.dinas?.name ||
    sessionDetailResponse?.data.petugas?.cabangDinas?.dinas?.name ||
    null;
  const userIdentityLabel = getDashboardIdentityLabel({
    role: session?.user?.role,
    branchName: userBranchName,
    agencyName: userAgencyName,
  });

  useEffect(() => {
    if (session?.user) {
      clearOAuthAttemptPortal();
    }
  }, [session?.user]);

  const invalidateNotificationQueries = () => {
    void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
    void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS_UNREAD_COUNT] });
  };

  const markNotificationRead = useMarkNotificationRead({
    onSuccess: () => {
      invalidateNotificationQueries();
    },
    onError: (error) => {
      toast.error("Gagal menandai notifikasi", {
        description: getApiErrorMessage(error, "Notifikasi tidak bisa diperbarui."),
      });
    },
  });

  const markAllNotificationsRead = useMarkAllNotificationsRead({
    onSuccess: (response) => {
      invalidateNotificationQueries();

      if (response.count > 0) {
        toast.success("Semua notifikasi diperbarui", {
          description: `${response.count} notifikasi ditandai sudah dibaca.`,
        });
      }
    },
    onError: (error) => {
      toast.error("Gagal menandai semua notifikasi", {
        description: getApiErrorMessage(error, "Silakan coba lagi beberapa saat lagi."),
      });
    },
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const isNotificationTrigger = bellRef.current?.contains(target);
      const isUserTrigger = userButtonRef.current?.contains(target);

      if (!isNotificationTrigger && panelRef.current && !panelRef.current.contains(target)) {
        setShowNotifications(false);
      }

      if (!isUserTrigger && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    };

    if (showNotifications || showUserMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications, showUserMenu]);

  const handleToggleNotifications = () => {
    if (!showNotifications) {
      void refetchUnreadCount();
      setShowUserMenu(false);
    }

    setShowNotifications((previous) => !previous);
  };

  const handleToggleUserMenu = () => {
    if (!showUserMenu) {
      setShowNotifications(false);
    }

    setShowUserMenu((previous) => !previous);
  };

  const handleChangeViewMode = (nextMode: DashboardViewMode) => {
    setViewMode(nextMode);
    setShowNotifications(false);
    setShowUserMenu(false);
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read) {
      markNotificationRead.mutate(notification.id);
    }

    if (!notification.laporanId) {
      setShowNotifications(false);
      toast.info("Notifikasi ditandai dibaca", {
        description: "Belum ada laporan yang bisa dibuka dari notifikasi ini.",
      });
      return;
    }

    if (userPortal !== "admin") {
      setViewMode("map");
    }

    setShowNotifications(false);
    setShowUserMenu(false);
    navigate({
      pathname: dashboardPath,
      search: buildReportFocusSearch(notification.laporanId),
    });
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0 || markAllNotificationsRead.isPending) {
      return;
    }

    markAllNotificationsRead.mutate();
  };

  const handleViewAllNotifications = () => {
    if (activeTab !== "all") {
      setActiveTab("all");
      return;
    }

    void refetchNotifications();
    void refetchUnreadCount();
  };

  const handleLogout = async () => {
    if (isSigningOut) {
      return;
    }

    const loginPath = getLoginPathForRole(session?.user?.role);
    setIsSigningOut(true);
    setShowUserMenu(false);
    setShowNotifications(false);
    clearOAuthAttemptPortal();
    setAuthRedirectSuppressed(true);

    try {
      await queryClient.cancelQueries();
      const { error } = await authClient.signOut();

      if (error) {
        toast.error("Gagal keluar", {
          description: error.message || "Sesi Anda belum bisa diakhiri. Coba lagi sebentar.",
        });
        return;
      }

      queryClient.clear();
      navigate(loginPath, { replace: true });
    } finally {
      window.setTimeout(() => {
        setAuthRedirectSuppressed(false);
      }, 0);
      setIsSigningOut(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-gray-50 overflow-hidden relative font-sans">
      <header className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-5xl rounded-[26px] sm:rounded-full bg-white shadow-lg px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <div className="flex w-full items-center justify-between gap-2 sm:min-w-0 sm:flex-1">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
            <Link to={dashboardPath} className="flex items-center gap-2 sm:gap-2.5 group hover:opacity-80 transition-opacity shrink-0 min-w-0">
               <img src="/logo_lightbg.png" alt="LaporPak" className="h-7 sm:h-9 w-auto max-w-[82px] sm:max-w-none object-contain" />
            </Link>

            {userPortal !== "admin" && (
              <DashboardViewModeToggle
                value={viewMode}
                onChange={handleChangeViewMode}
              />
            )}
          </div>

          <div className="flex items-center gap-2 sm:ml-auto sm:justify-end sm:gap-3 md:gap-5 min-w-0">
          <div className="flex items-center gap-2 relative" ref={panelRef}>
             <button 
                ref={bellRef}
                onClick={handleToggleNotifications}
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
                     className="fixed top-[154px] left-4 right-4 max-h-[calc(100dvh-170px)] sm:absolute sm:top-full sm:-right-2 sm:left-auto sm:mt-3 sm:w-[400px] w-auto bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] sm:shadow-2xl border border-gray-100 z-50 text-left sm:origin-top-right flex flex-col overflow-hidden sm:max-h-[500px]"
                   >
                     <div className="px-5 pt-4 pb-3 bg-white border-b border-gray-100">
                       <div className="flex justify-between items-center mb-3">
                         <div>
                           <h4 className="font-heading font-black text-base text-gray-900 tracking-tight leading-none">Notifikasi</h4>
                           {isNotificationsFetching && !isNotificationsLoading && (
                             <p className="text-[10px] font-bold text-gray-400 mt-1">Memperbarui...</p>
                           )}
                         </div>
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
                        {isNotificationsLoading ? (
                          <div className="w-full animate-pulse">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="px-4 py-3.5 flex gap-3.5 border-b border-gray-100 last:border-b-0">
                                <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0"></div>
                                <div className="flex-1 min-w-0 space-y-2.5 py-1">
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
                                    <div className="h-3 bg-gray-100 rounded-full w-10 shrink-0"></div>
                                  </div>
                                  <div className="h-2 bg-gray-100 rounded-full w-full mt-2"></div>
                                  <div className="h-2 bg-gray-100 rounded-full w-3/4"></div>
                                  <div className="h-1.5 bg-gray-100 rounded-full w-1/4 mt-2"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : notificationsErrorMessage ? (
                         <div className="py-12 text-center px-6">
                           <AlertTriangle size={28} className="text-red-200 mx-auto mb-2" />
                           <p className="text-xs font-bold text-gray-500">{notificationsErrorMessage}</p>
                         </div>
                       ) : notifications.length === 0 ? (
                         <div className="py-12 text-center">
                           <Bell size={28} className="text-gray-200 mx-auto mb-2" />
                           <p className="text-xs font-bold text-gray-400">
                             {activeTab === "unread" ? "Tidak ada notifikasi yang belum dibaca" : "Tidak ada notifikasi"}
                           </p>
                         </div>
                       ) : (
                         <div>
                           {notifications.map((notif, idx) => {
                             const Icon = iconMap[notif.type];
                             const colors = colorMap[notif.type];
                             const isUpdatingCurrent =
                               markNotificationRead.isPending && markNotificationRead.variables === notif.id;
                             const isActionable = !!notif.laporanId || !notif.read;
                             return (
                               <motion.button
                                 key={notif.id}
                                 type="button"
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 transition={{ delay: idx * 0.03, duration: 0.2 }}
                                 onClick={() => handleNotificationClick(notif)}
                                 className={`group relative w-full px-4 py-3.5 text-left flex gap-3.5 transition-colors border-b border-gray-100 last:border-b-0 ${
                                   !notif.read
                                     ? "bg-rose-50 border-l-4 border-l-[#db2744] hover:bg-rose-100/80"
                                     : "hover:bg-gray-50/80"
                                 } ${isActionable ? "cursor-pointer" : "cursor-default"} ${isUpdatingCurrent ? "opacity-70" : ""}`}
                               >
                                 <div className={`w-10 h-10 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center shrink-0 ${
                                   !notif.read ? "ring-2 ring-white shadow-sm" : ""
                                 }`}>
                                   <Icon size={18} strokeWidth={2.5} />
                                 </div>

                                 <div className="flex-1 min-w-0">
                                   <div className="flex items-start justify-between gap-2 mb-0.5">
                                     <div className="min-w-0">
                                       <p className={`text-[13px] leading-tight ${
                                       !notif.read ? "font-extrabold text-gray-900" : "font-semibold text-gray-600"
                                       }`}>
                                         {notif.title}
                                       </p>
                                     </div>
                                     <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${colors.tagBg}`}>
                                       {notif.tag}
                                     </span>
                                   </div>
                                   <p className={`text-[12px] leading-relaxed line-clamp-2 ${
                                     !notif.read ? "text-gray-700" : "text-gray-500"
                                   }`}>
                                     {notif.message}
                                   </p>
                                   <span className={`text-[10px] font-medium mt-1 block ${
                                     !notif.read ? "text-rose-700" : "text-gray-400"
                                   }`}>
                                     {notif.time}
                                   </span>
                                 </div>
                               </motion.button>
                             );
                           })}
                         </div>
                       )}
                     </div>

                     <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
                       <button
                         onClick={handleMarkAllAsRead}
                         disabled={unreadCount === 0 || markAllNotificationsRead.isPending}
                         className={`text-[11px] font-bold transition-colors ${
                           unreadCount === 0 || markAllNotificationsRead.isPending
                             ? "text-gray-300 cursor-not-allowed"
                             : "text-gray-400 hover:text-gray-700"
                         }`}
                       >
                         {markAllNotificationsRead.isPending ? "Memproses..." : "Tandai semua dibaca"}
                       </button>
                       <button
                         onClick={handleViewAllNotifications}
                         className="text-[11px] font-bold text-[#db2744] hover:text-rose-700 transition-colors flex items-center gap-1"
                       >
                         Lihat semua
                         <ArrowUpRight size={11} />
                       </button>
                     </div>
                   </motion.div>
               )}
             </AnimatePresence>
          </div>
          
          <div className="h-8 w-[1px] bg-gray-200 hidden sm:block mx-1" />
          
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group min-w-0">
               <div className="w-8 h-8 rounded-full bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors overflow-hidden border border-red-100 shrink-0">
                 {session?.user?.image ? (
                   <img src={session.user.image} alt={session.user.name} referrerPolicy="no-referrer" crossOrigin="anonymous" className="w-full h-full object-cover" />
                 ) : (
                   <User size={15} className="text-[#db2744]" strokeWidth={2.5} />
                 )}
               </div>
               <div className="flex flex-col min-w-0 max-w-[110px] sm:max-w-[150px]">
                 <span className="text-xs font-bold text-gray-900 tracking-wide leading-none mb-0.5 truncate">
                   {userDisplayName}
                 </span>
                 <span
                   className="text-[8px] sm:text-[9px] font-black text-[#db2744] leading-tight whitespace-normal break-normal text-left"
                   title={userIdentityLabel}
                 >
                   {userIdentityLabel}
                 </span>
               </div>
            </div>
            
            <button 
               onClick={handleLogout}
               disabled={isSigningOut}
               className="p-1.5 sm:p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-[#db2744] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
               title="Keluar"
            >
              {isSigningOut ? (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-[#db2744] animate-spin" />
              ) : (
                <LogOut size={15} strokeWidth={2.5} />
               )}
             </button>
           </div>

          <div className="sm:hidden relative" ref={userMenuRef}>
            <button
              ref={userButtonRef}
              onClick={handleToggleUserMenu}
              aria-label="Buka menu akun"
              aria-haspopup="menu"
              aria-expanded={showUserMenu}
              className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors overflow-hidden border border-red-100 shrink-0"
            >
              {session?.user?.image ? (
                <img src={session.user.image} alt={userFullName} referrerPolicy="no-referrer" crossOrigin="anonymous" className="w-full h-full object-cover" />
              ) : (
                <User size={15} className="text-[#db2744]" strokeWidth={2.5} />
              )}
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 6 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="fixed top-[75px] right-4 w-[220px] max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-100 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.14)] overflow-hidden origin-top-right z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-white via-red-50/30 to-white">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center overflow-hidden border border-red-100 shrink-0">
                        {session?.user?.image ? (
                          <img src={session.user.image} alt={userFullName} referrerPolicy="no-referrer" crossOrigin="anonymous" className="w-full h-full object-cover" />
                        ) : (
                          <User size={18} className="text-[#db2744]" strokeWidth={2.5} />
                        )}
                      </div>
                      <div className="min-w-0 max-w-[150px]">
                        <p className="text-sm font-bold text-gray-900 break-normal">{userFullName}</p>
                        <p className="text-[10px] font-black text-[#db2744] leading-tight whitespace-normal break-normal mt-1">
                          {userIdentityLabel}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      disabled={isSigningOut}
                      className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-[#db2744] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span>{isSigningOut ? "Keluar..." : "Keluar"}</span>
                      {isSigningOut ? (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-[#db2744] animate-spin shrink-0" />
                      ) : (
                        <LogOut size={15} strokeWidth={2.5} className="shrink-0" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        </div>

        {mobileControls && (
          <div className="w-full border-t border-gray-100 pt-2 sm:hidden">
            {mobileControls}
          </div>
        )}
      </header>

      <main className="flex-1 w-full h-full relative">
        <Outlet />
      </main>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <DashboardViewModeProvider>
      <DashboardShell />
    </DashboardViewModeProvider>
  );
}
