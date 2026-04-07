import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Megaphone, Building2, LogIn, LayoutDashboard, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks";

export function Navbar() {
  const { data: session } = useAuth();
  const dashboardPath = "/dashboard";
  const isLoggedIn = Boolean(session);
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const getLinkClass = (path: string, isMobile = false) => {
    const baseClass = isMobile 
      ? "text-lg font-bold block"
      : "text-sm font-bold block lg:inline";
    return pathname === path
      ? `${baseClass} text-[#db2744] transition-colors`
      : `${baseClass} text-gray-600 hover:text-[#db2744] transition-colors`;
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 sticky top-0 relative">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-4 sm:py-5 flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-3 relative z-50">
          <Megaphone size={34} className="text-[#db2744]" strokeWidth={1.5} fill="#db2744" />
          <div className="flex flex-col">
             <span className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight leading-none">
               Lapor<span className="text-[#db2744]">Pak</span>
             </span>
             <span className="text-[10px] text-gray-500 font-bold tracking-widest mt-1 uppercase hidden sm:block">Platform Publik</span>
          </div>
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
           <Link to="/" className={getLinkClass("/")}>Beranda</Link>
           <Link to="/cara-kerja" className={getLinkClass("/cara-kerja")}>Cara Kerja</Link>
           <Link to="/bantuan" className={getLinkClass("/bantuan")}>Bantuan</Link>
        </div>

        <div className="flex items-center gap-3 md:gap-5 relative z-50">
          <Link to="/agency/login" className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-600 py-2.5 px-5 rounded-full hover:bg-[#db2744] hover:text-white transition-all duration-300 group">
            <Building2 size={16} className="text-gray-500 group-hover:text-white transition-colors" />
            <span>Portal Dinas</span>
          </Link>
          
          <Link to={isLoggedIn ? dashboardPath : "/login"} className="flex items-center gap-2 text-sm font-bold text-white bg-[#db2744] hover:bg-[#b01e33] px-5 sm:px-7 py-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md">
            {isLoggedIn ? <LayoutDashboard size={16} /> : <LogIn size={16} />}
            <span>{isLoggedIn ? "Dashboard" : "Masuk"}</span>
          </Link>

          <button 
            className="lg:hidden p-2 -mr-2 text-gray-600 hover:text-[#db2744] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
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
            <div className="flex flex-col gap-6 px-6 py-8">
              <Link to="/" className={getLinkClass("/", true)}>Beranda</Link>
              <Link to="/cara-kerja" className={getLinkClass("/cara-kerja", true)}>Cara Kerja</Link>
              <Link to="/bantuan" className={getLinkClass("/bantuan", true)}>Bantuan</Link>
              
              
              <div className="h-px bg-gray-100 my-2 sm:hidden w-full"></div>
              <Link to="/agency/login" className="sm:hidden flex items-center gap-3 text-lg font-bold text-gray-600 hover:text-[#db2744] transition-colors w-fit">
                <Building2 size={22} className="text-gray-400" />
                Login Portal Dinas
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
