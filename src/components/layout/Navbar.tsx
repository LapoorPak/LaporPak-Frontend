import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Building2, LogIn, LayoutDashboard, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks";
import { getDashboardPathForRole } from "@/lib/auth-portal";

export function Navbar() {
  const { data: session } = useAuth();
  const dashboardPath = getDashboardPathForRole(session?.user?.role);
  const isLoggedIn = Boolean(session);
  const dashboardLabel = isLoggedIn ? "Dashboard" : "Masuk";
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getLinkClass = (path: string, isMobile = false) => {
    const baseClass = isMobile
      ? "text-base font-bold block py-1"
      : "text-sm font-bold block lg:inline";
    return pathname === path
      ? `${baseClass} text-[#db2744] transition-colors`
      : `${baseClass} text-gray-600 hover:text-[#db2744] transition-colors`;
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 sticky top-0 relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="flex items-center gap-2.5 sm:gap-3 relative z-50 min-w-0"
        >
          <img
            src="/logo_lightbg.png"
            alt="LaporPak"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          <Link to="/" className={getLinkClass("/")}>
            Beranda
          </Link>
          <Link to="/cara-kerja" className={getLinkClass("/cara-kerja")}>
            Cara Kerja
          </Link>
          <Link to="/bantuan" className={getLinkClass("/bantuan")}>
            Bantuan
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-5 relative z-50 shrink-0">
          {!isLoggedIn && (
            <Link
              to="/agency/login"
              className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-600 py-2.5 px-5 rounded-full hover:bg-[#db2744] hover:text-white transition-all duration-300 group"
            >
              <Building2
                size={16}
                className="text-gray-500 group-hover:text-white transition-colors"
              />
              <span>Portal Dinas</span>
            </Link>
          )}

          <Link
            to={isLoggedIn ? dashboardPath : "/login"}
            aria-label={dashboardLabel}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-white bg-[#db2744] hover:bg-[#b01e33] px-3.5 sm:px-7 py-2 sm:py-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap"
          >
            {isLoggedIn ? (
              <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
            <span className="leading-none">{dashboardLabel}</span>
          </Link>

          <button
            className="lg:hidden p-1.5 sm:p-2 -mr-1 sm:-mr-2 text-gray-600 hover:text-[#db2744] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 sm:w-[26px] sm:h-[26px]" />
            ) : (
              <Menu className="w-6 h-6 sm:w-[26px] sm:h-[26px]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-2xl overflow-hidden origin-top"
          >
            <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 sm:py-8">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={getLinkClass("/", true)}
              >
                Beranda
              </Link>
              <Link
                to="/cara-kerja"
                onClick={() => setIsMobileMenuOpen(false)}
                className={getLinkClass("/cara-kerja", true)}
              >
                Cara Kerja
              </Link>
              <Link
                to="/bantuan"
                onClick={() => setIsMobileMenuOpen(false)}
                className={getLinkClass("/bantuan", true)}
              >
                Bantuan
              </Link>

              {/* Portal Dinas mobile — hanya tampil kalau belum login */}
              {!isLoggedIn && (
                <>
                  <div className="h-px bg-gray-100 my-2 sm:hidden w-full"></div>
                  <Link
                    to="/agency/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="sm:hidden flex items-center gap-2.5 text-base font-bold text-gray-600 hover:text-[#db2744] transition-colors w-fit py-1"
                  >
                    <Building2 size={18} className="text-gray-400" />
                    Login Portal Dinas
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
