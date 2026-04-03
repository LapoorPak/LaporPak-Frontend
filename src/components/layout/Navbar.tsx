import { Link } from "react-router";
import { Megaphone, Building2, LogIn } from "lucide-react";

export function Navbar() {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 sticky top-0">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-5 flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-3">
          <Megaphone size={34} className="text-[#db2744]" strokeWidth={1.5} fill="#db2744" />
          <div className="flex flex-col">
             <span className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight leading-none">
               Lapor<span className="text-[#db2744]">Pak</span>
             </span>
             <span className="text-[10px] text-gray-500 font-bold tracking-widest mt-1 uppercase hidden sm:block">Platform Publik</span>
          </div>
        </Link>
        
        <div className="hidden lg:flex items-center gap-8">
           <Link to="/" className="text-sm font-bold text-gray-600 hover:text-[#db2744] transition-colors">Beranda</Link>
           <Link to="/#fitur" className="text-sm font-bold text-gray-600 hover:text-[#db2744] transition-colors">Cara Kerja</Link>
           <Link to="/#faq" className="text-sm font-bold text-gray-600 hover:text-[#db2744] transition-colors">Bantuan</Link>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <Link to="/agency/login" className="flex items-center gap-2 text-sm font-bold text-gray-600 py-2.5 px-5 rounded-full hover:bg-[#db2744] hover:text-white transition-all duration-300 group">
            <Building2 size={16} className="text-gray-500 group-hover:text-white transition-colors" />
            <span className="hidden sm:inline">Portal Dinas</span>
          </Link>
          
          <Link to="/login" className="flex items-center gap-2 text-sm font-bold text-white bg-[#db2744] hover:bg-[#b01e33] px-7 py-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md">
            <LogIn size={16} />
            <span>Masuk</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
