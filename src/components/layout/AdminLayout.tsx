import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { authClient } from "@/lib/auth-client";
import {
  LogOut, LayoutDashboard, Building2, MapPin, Tags, Users, FileText,
  Menu, X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { clearOAuthAttemptPortal } from "@/lib/oauth-attempt";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

const SIDEBAR_ITEMS = [
  { name: "Overview", path: "/admin/dashboard", icon: LayoutDashboard, desc: "Ringkasan sistem" },
  { name: "Dinas", path: "/admin/dinas", icon: Building2, desc: "Instansi pemerintah" },
  { name: "Cabang", path: "/admin/cabang", icon: MapPin, desc: "Unit & lokasi" },
  { name: "Kategori", path: "/admin/kategori", icon: Tags, desc: "Klasifikasi laporan" },
  { name: "Users", path: "/admin/users", icon: Users, desc: "Manajemen pengguna" },
  { name: "Laporan", path: "/admin/laporan", icon: FileText, desc: "Manajemen laporan" },
];

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Overview",
  "/admin/dinas": "Dinas Management",
  "/admin/cabang": "Cabang Management",
  "/admin/kategori": "Kategori Management",
  "/admin/users": "Users Management",
  "/admin/laporan": "Laporan Management",
};

export default function AdminLayout() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const currentTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? "Admin";

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isSidebarOpen]);

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showUserMenu]);

  const handleLogout = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setShowUserMenu(false);
    clearOAuthAttemptPortal();
    try {
      const { error } = await authClient.signOut();
      if (error) {
        toast.error("Gagal keluar", { description: error.message });
        return;
      }
      navigate("/admin/login", { replace: true });
    } finally {
      setIsSigningOut(false);
    }
  };

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "A";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-foreground">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar
          Mobile: fixed + translate slide (CSS transition)
          Desktop: relative + width collapse (CSS transition)  */}
      <aside
        style={{ transitionProperty: "width, transform" }}
        className={[
          "flex flex-col bg-white border-r border-gray-200 shrink-0 z-50",
          "duration-300 ease-in-out overflow-hidden",
          "fixed inset-y-0 left-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:translate-x-0 lg:inset-y-auto lg:left-auto",
          isSidebarOpen ? "lg:w-64" : "lg:w-0 lg:border-r-0 lg:pointer-events-none",
        ].join(" ")}
      >
        {/* Inner wrapper fixed at w-64 so content doesn't squish */}
        <div className="w-64 flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-5 border-b border-gray-200 shrink-0">
            <a href="/">
              <span className="text-base font-heading font-black text-gray-900 tracking-tight">
                Lapor<span className="text-[#db2744]">Pak</span>
              </span>
              <div className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest -mt-0.5">Admin Panel</div>
            </a>
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
            <div className="px-3 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menu Utama</div>
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-150 group relative ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                  )}
                  <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? "bg-primary/15" : "bg-gray-100 group-hover:bg-gray-200"
                  }`}>
                    <Icon size={16} className={isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-700"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold truncate ${isActive ? "text-primary" : ""}`}>{item.name}</div>
                    <div className="text-[10px] text-gray-400 truncate">{item.desc}</div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* User / Logout */}
          <div className="p-3 border-t border-gray-200 shrink-0">
            <div className="flex items-center gap-3 p-2.5 rounded-sm bg-gray-50 border border-gray-200">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-primary/25 shadow-sm flex items-center justify-center shrink-0 text-xs font-bold text-primary overflow-hidden">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="" referrerPolicy="no-referrer" className="w-full h-full rounded-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{session?.user?.name || "Admin"}</p>
                <p className="text-[10px] text-gray-500 truncate">{session?.user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={isSigningOut}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                title="Keluar"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-14 shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-gray-200 bg-white z-30 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-1 rounded-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <h1 className="text-sm font-heading font-bold text-gray-900">{currentTitle}</h1>
              <p className="text-[10px] text-gray-400 hidden sm:block">LaporPak Admin System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-sm hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="w-7 h-7 rounded-full bg-white border-2 border-primary/25 shadow-sm flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-700 hidden sm:block max-w-[100px] truncate">
                  {session?.user?.name?.split(" ")[0] || "Admin"}
                </span>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-sm shadow-lg overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 truncate">{session?.user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                      <span className="mt-1.5 inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded border border-primary/20">ADMINISTRATOR</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      disabled={isSigningOut}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      <span>{isSigningOut ? "Keluar..." : "Keluar"}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
