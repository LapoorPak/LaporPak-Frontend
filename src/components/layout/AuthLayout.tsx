import { Outlet, Link, useLocation } from "react-router";
import { Megaphone } from "lucide-react";

export default function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname.includes("register");
  const isAdminLogin = location.pathname.includes("/admin/login");
  const isAgencyLogin = location.pathname.includes("/agency/login");

  const imgSrc = isRegister 
    ? "/illustrations/register_illustration.png" 
    : isAdminLogin
      ? "/illustrations/admin_login_illustration.png"
      : isAgencyLogin
        ? "/illustrations/agency_login_illustration.png"
        : "/illustrations/login_illustration.png";

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans">
      <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col items-center justify-center px-8 md:px-12 lg:px-20 py-12 relative z-10 min-h-[100dvh]">
        
        <Link to="/" className="absolute top-8 left-8 sm:left-12 flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Megaphone size={34} className="text-[#db2744]" strokeWidth={1.5} fill="#db2744" />
          <div className="flex flex-col">
             <span className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight leading-none">
               Lapor<span className="text-[#db2744]">Pak</span>
             </span>
             <span className="text-[10px] text-gray-500 font-bold tracking-widest mt-1 uppercase hidden sm:block">Platform Publik</span>
          </div>
        </Link>

        <div className="w-full max-w-[380px] mt-16 md:mt-0">
          <Outlet />
        </div>
        
        <p className="mt-8 md:absolute md:bottom-8 text-center text-gray-400 text-xs font-semibold tracking-wide w-full px-8">
          © {new Date().getFullYear()} LaporPak. #BersamaMembangunKota 🇮🇩
        </p>
      </div>

      <div className="hidden md:flex flex-1 bg-white relative items-center justify-center p-12 overflow-hidden">
         <div className="relative z-10 w-full max-w-[600px] flex justify-center items-center">
            <img 
               src={imgSrc} 
               alt={isRegister ? "LaporPak Pendaftaran" : isAdminLogin ? "LaporPak Administrator" : isAgencyLogin ? "LaporPak Portal Dinas" : "LaporPak Otentikasi"}
               className="w-full h-auto object-contain mix-blend-multiply scale-110"
            />
         </div>
      </div>
    </div>
  );
}
