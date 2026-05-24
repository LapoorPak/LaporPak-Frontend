import { useEffect, useState, useRef } from "react";
import type { KeyboardEvent, ChangeEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/config/api-client";
import { QUERY_KEYS } from "@/api/queryKeys";
import { authClient } from "@/lib/auth-client";
import { getDashboardPathForPortal } from "@/lib/auth-portal";

export default function VerifyEmail() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dashboardPath = getDashboardPathForPortal("citizen");

  const [email, setEmail] = useState(initialEmail);
  const [emailConfirmed, setEmailConfirmed] = useState(!!initialEmail);

  // OTP State
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");

  const { data: session } = authClient.useSession();

  // Handle Resend Countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  // If session is already verified, take them to dashboard
  useEffect(() => {
    if (session?.user?.emailVerified) {
      navigate(getDashboardPathForPortal(session.user.role as any || "citizen"), { replace: true });
    }
  }, [session, navigate]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) return;

    setError("");
    setResendLoading(true);

    try {
      await apiClient.post("/auth/email-otp/send-verification-otp", {
        email,
        type: "email-verification",
      });
      toast.success("Kode verifikasi telah dikirim ke email Anda");
      setEmailConfirmed(true);
      setSearchParams({ email });
      setCountdown(60);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Gagal mengirim kode verifikasi.";
      setError(msg);
      toast.error(msg);
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      setError("Silakan masukkan 6 digit kode OTP");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await apiClient.post("/auth/email-otp/verify-email", {
        email,
        otp: otpValue,
      });

      toast.success("Email berhasil diverifikasi, mengarahkan kamu...");
      
      // Invalidate auth session to refresh the user state globally
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUTH_SESSION_DETAIL] });

      // After invalidation, the auth provider should recognize user is verified.
      // Redirect to citizen dashboard (or check their role from previous state conceptually)
      // For safety, let the guard handle it, or navigate cleanly to dashboard
      // Just adding a small delay to ensure cookie is digested
      setTimeout(() => {
         navigate(dashboardPath, { replace: true });
      }, 500);

    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data?.error;
      
      if (status === 400 && (msg?.includes("OTP") || msg?.includes("invalid"))) {
        setError("Kode salah atau sudah tidak berlaku");
      } else if (status === 403 && msg?.includes("attempts")) {
        setError("Terlalu banyak percobaan. Minta kode baru");
      } else {
        setError(msg || "Verifikasi gagal. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;

    const newOtp = [...otp];
    // Pasting multiple digits
    if (value.length > 1) {
       const digits = value.slice(0, 6).split("");
       for (let i = 0; i < digits.length; i++) {
         if (index + i < 6) newOtp[index + i] = digits[i];
       }
       setOtp(newOtp);
       // Focus last populated input
       const lastIndex = Math.min(index + digits.length, 5);
       inputRefs.current[lastIndex]?.focus();
       return;
    }

    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Move to next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const handleChangeEmail = () => {
    setEmailConfirmed(false);
    setOtp(Array(6).fill(""));
    setCountdown(0);
    setError("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="w-full"
    >
       <div className="mb-8">
        <h1 className="text-[1.75rem] md:text-3xl font-heading font-black text-[#db2744] mb-2 tracking-tight">
          Verifikasi Email
        </h1>
        {emailConfirmed ? (
           <p className="text-gray-600 text-sm font-medium leading-relaxed">
             Kami sudah mengirim kode verifikasi ke email<br />
             <span className="font-bold text-gray-900">{email}</span>
           </p>
        ) : (
           <p className="text-gray-600 text-sm font-medium">
             Masukkan email kamu untuk menerima kode verifikasi OTP.
           </p>
        )}
      </div>

       <AnimatePresence mode="wait">
         {!emailConfirmed ? (
             <motion.form 
                key="email-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSendOtp} 
                className="space-y-4"
             >
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-gray-800 ml-1 block" htmlFor="verify-email-input">
                     Alamat Email <span className="text-[#db2744]" aria-hidden="true">*</span>
                   </label>
                   <input
                     id="verify-email-input"
                     type="email"
                     placeholder="Alamat Email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                     className="w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 transition-all"
                   />
                </div>
                {error && (
                   <p className="text-xs font-semibold leading-tight text-[#db2744] ml-1">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={resendLoading || !email}
                  className="w-full flex items-center justify-center gap-2 bg-[#db2744] text-white font-bold tracking-wide py-3.5 rounded-xl hover:bg-[#b01e33] transition-all mt-6 disabled:opacity-60"
                >
                  {resendLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    "Kirim Kode Verifikasi"
                  )}
                </button>
                <div className="text-center mt-6">
                   <Link to="/login" className="text-gray-500 hover:text-gray-800 text-sm font-semibold transition-colors">
                     Kembali ke Login
                   </Link>
                </div>
             </motion.form>
         ) : (
             <motion.form 
                key="otp-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleVerify} 
                className="space-y-6"
             >
                <div className="flex justify-between gap-2 sm:gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6} // allow paste
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-white border border-gray-200 hover:border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 transition-all"
                    />
                  ))}
                </div>

                {error && (
                   <motion.div 
                     initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                     className="bg-red-50 text-[#db2744] text-xs font-semibold px-3 py-2.5 rounded-lg border border-red-100 flex items-center gap-2"
                   >
                     <span>{error}</span>
                   </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.join("").length < 6}
                  className="w-full flex items-center justify-center gap-2 bg-[#db2744] text-white font-bold tracking-wide py-3.5 rounded-xl hover:bg-[#b01e33] transition-all mt-6 disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    "Verifikasi"
                  )}
                </button>

                <div className="flex flex-col space-y-4 text-center mt-6 text-sm font-medium">
                  <p className="text-gray-500">
                    Belum menerima kode?{" "}
                    {countdown > 0 ? (
                      <span className="text-gray-400 font-bold ml-1">Kirim ulang ({countdown}s)</span>
                    ) : (
                      <button
                        type="button"
                        disabled={resendLoading}
                        onClick={handleSendOtp}
                        className="text-[#db2744] font-bold hover:underline disabled:opacity-60"
                      >
                        {resendLoading ? "Mengirim..." : "Kirim ulang kode"}
                      </button>
                    )}
                  </p>
                  
                  <div className="flex items-center justify-center gap-4 text-gray-400">
                    <button type="button" onClick={handleChangeEmail} className="hover:text-gray-800 transition-colors">
                       Ganti email
                    </button>
                    <span className="text-gray-300">•</span>
                    <Link to="/login" className="hover:text-gray-800 transition-colors">
                       Kembali ke login
                    </Link>
                  </div>
                </div>
             </motion.form>
         )}
       </AnimatePresence>
    </motion.div>
  );
}
