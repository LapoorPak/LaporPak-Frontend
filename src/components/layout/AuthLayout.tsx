import { Outlet, Link, useLocation } from "react-router";

export default function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname.includes("register");
  const isVerifyEmail = location.pathname.includes("verify-email");
  const isAdminLogin = location.pathname.includes("/admin/login");
  const isAgencyLogin = location.pathname.includes("/agency/login");
  const isCitizenLogin = !isRegister && !isVerifyEmail && !isAdminLogin && !isAgencyLogin;
  const hasPhotoPanel = isCitizenLogin || isRegister || isAdminLogin || isAgencyLogin;
  const photoAlt = isRegister
    ? "LaporPak Pendaftaran"
    : isAdminLogin
      ? "LaporPak Administrator"
      : isAgencyLogin
        ? "LaporPak Portal Dinas"
        : "LaporPak Otentikasi";
  const photoObjectPosition = isCitizenLogin ? "object-[60%_center]" : "object-center";

  const imgSrc = isVerifyEmail
    ? "/illustrations/verify_email_illustration.png"
    : isRegister 
      ? "/images/register.png"
      : isAdminLogin
        ? "/images/admin.jpeg"
        : isAgencyLogin
          ? "/images/dinas.jpeg"
          : "/images/login.png";

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans">
      <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col items-center justify-center px-8 md:px-12 lg:px-20 py-12 relative z-10 min-h-[100dvh]">
        
        <Link to="/" className="absolute top-8 left-8 sm:left-12 flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logo_lightbg.png" alt="LaporPak" className="h-11 w-auto object-contain" />
        </Link>

        <div className="w-full max-w-[380px] mt-16 md:mt-0">
          <Outlet />
        </div>
        
        <p className="mt-8 md:absolute md:bottom-8 text-center text-gray-400 text-xs font-semibold tracking-wide w-full px-8">
          © {new Date().getFullYear()} LaporPak. #BersamaMembangunKota 🇮🇩
        </p>
      </div>

      <div className={`hidden md:flex flex-1 bg-white relative items-center justify-center overflow-hidden ${hasPhotoPanel ? "" : "p-12"}`}>
        {hasPhotoPanel ? (
          <>
            <img
              src={imgSrc}
              alt={photoAlt}
              className={`absolute inset-0 h-full w-full scale-110 object-cover ${photoObjectPosition}`}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[28%] bg-gradient-to-b from-white/80 via-white/25 to-transparent" />
          </>
        ) : (
          <div className="relative z-10 w-full max-w-[600px] flex justify-center items-center">
            <img
              src={imgSrc}
              alt={isVerifyEmail ? "LaporPak Verifikasi Email" : isRegister ? "LaporPak Pendaftaran" : isAdminLogin ? "LaporPak Administrator" : isAgencyLogin ? "LaporPak Portal Dinas" : "LaporPak Otentikasi"}
              className="w-full h-auto object-contain mix-blend-multiply scale-110"
            />
          </div>
        )}
      </div>
    </div>
  );
}
