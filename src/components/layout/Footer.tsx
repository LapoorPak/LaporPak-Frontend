import { Megaphone } from "lucide-react";
import { InstagramIcon, TwitterIcon, LinkedInIcon } from "@/assets/icon";

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <Megaphone size={28} className="text-[#db2744]" strokeWidth={1.5} fill="#db2744" />
          <div className="flex flex-col">
             <span className="font-heading font-extrabold text-xl text-gray-900 tracking-tight leading-none">
               Lapor<span className="text-[#db2744]">Pak</span>
             </span>
             <span className="text-[9px] text-gray-400 font-bold tracking-widest mt-1 uppercase hidden sm:block">Platform Publik</span>
          </div>
        </div>

        <div className="text-[13px] text-gray-400 font-medium tracking-wide">
          © {new Date().getFullYear()} LaporPak. All Rights Reserved.
        </div>

        <div className="flex items-center gap-3">
          <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-red-50 text-[#db2744] flex items-center justify-center hover:bg-[#db2744] hover:text-white transition-all transform hover:scale-105">
            <InstagramIcon />
          </a>
          <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full bg-red-50 text-[#db2744] flex items-center justify-center hover:bg-[#db2744] hover:text-white transition-all transform hover:scale-105">
            <TwitterIcon />
          </a>
          <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-red-50 text-[#db2744] flex items-center justify-center hover:bg-[#db2744] hover:text-white transition-all transform hover:scale-105">
            <LinkedInIcon />
          </a>
        </div>

      </div>
    </footer>
  );
}
