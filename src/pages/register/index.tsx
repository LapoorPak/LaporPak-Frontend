import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { GoogleIcon, EyeIcon, EyeOffIcon } from "@/assets/icon";
import { toast } from "sonner";
import { getDashboardPathForPortal } from "@/lib/auth-portal";
import { clearOAuthAttemptPortal, getOAuthAttemptPortal, setOAuthAttemptPortal } from "@/lib/oauth-attempt";
import { consumePortalError, getAuthErrorMessage } from "@/lib/portal-error";

export default function Register() {
  const dashboardPath = getDashboardPathForPortal("citizen");
  const dashboardUrl = `${window.location.origin}${dashboardPath}`;
  const registerUrl = `${window.location.origin}/register`;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const errorProcessedRef = useRef(false);

  useEffect(() => {
    const portalError = consumePortalError();
    if (portalError?.message) {
      clearOAuthAttemptPortal();
      setError(portalError.message);
      toast.error(portalError.message);
      return;
    }

    const errorParam = searchParams.get("portal_error") || searchParams.get("error");
    const messageParam =
      searchParams.get("portal_message") ||
      searchParams.get("message") ||
      searchParams.get("error_description");

    if (errorParam) {
      if (!errorProcessedRef.current) {
        clearOAuthAttemptPortal();
        const nextError = getAuthErrorMessage({
          code: errorParam,
          message: messageParam,
          portal: "citizen",
          screen: "register",
        });
        setError(nextError);
        toast.error(nextError, { id: "auth-error" });
        errorProcessedRef.current = true;
      }
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("portal_error");
      newParams.delete("portal_message");
      newParams.delete("error");
      newParams.delete("message");
      newParams.delete("error_description");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (isSessionPending || !session?.user) {
      if (!isSessionPending && !session?.user && getOAuthAttemptPortal() === "citizen") {
        const nextError =
          "Login berhasil diproses, tetapi sesi akun belum terbaca. Coba ulangi login atau refresh halaman.";
        clearOAuthAttemptPortal();
        setError(nextError);
        toast.error(nextError);
      }
      return;
    }

    clearOAuthAttemptPortal();
  }, [isSessionPending, session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    setLoading(true);

    const { error } = await authClient.signUp.email({
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      password: form.password,
    });

    if (error) {
      setError(error.message || "Registrasi gagal");
      setLoading(false);
      return;
    }

    navigate(`/verify-email?email=${encodeURIComponent(form.email)}`, { replace: true });
  };

  const handleGoogleRegister = async () => {
    if (googleLoading || loading) {
      return;
    }

    setError("");
    setGoogleLoading(true);
    setOAuthAttemptPortal("citizen");

    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: dashboardUrl,
      errorCallbackURL: registerUrl,
      newUserCallbackURL: dashboardUrl,
      requestSignUp: true,
      additionalData: {
        portal: "citizen",
      },
    });

    if (error) {
      clearOAuthAttemptPortal();
      setError(error.message || "Daftar dengan Google gagal");
      setGoogleLoading(false);
    }
  };

  const inputCls =
    "w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#db2744] focus:ring-1 focus:ring-[#db2744] transition-all";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="w-full"
    >
      <div className="mb-6">
        <h1 className="text-[1.75rem] md:text-3xl font-heading font-black text-[#db2744] mb-2 tracking-tight">
          Daftar Akun Gratis
        </h1>
        <p className="text-gray-600 text-sm font-medium">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-[#db2744] font-bold hover:underline transition-all">
            Masuk
          </Link>
        </p>
      </div>

      <button
        type="button"
        onClick={handleGoogleRegister}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-bold text-sm px-4 py-3 rounded-xl transition-all mb-5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {googleLoading ? (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        {googleLoading ? "Mengarahkan ke Google..." : "Daftar dengan Google"}
      </button>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-[11px] font-bold text-gray-400">atau daftar dengan email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
             <label className="text-xs font-bold text-gray-800 ml-1 block" htmlFor="register-firstName">Nama Depan</label>
             <input
               id="register-firstName"
               name="firstName"
               placeholder="Budi"
               value={form.firstName}
               onChange={handleChange}
               required
               className={inputCls}
             />
          </div>
          <div className="space-y-1.5">
             <label className="text-xs font-bold text-gray-800 ml-1 block" htmlFor="register-lastName">Nama Belakang</label>
             <input
               id="register-lastName"
               name="lastName"
               placeholder="Santoso"
               value={form.lastName}
               onChange={handleChange}
               required
               className={inputCls}
             />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
           <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800 ml-1 block" htmlFor="register-email">Email</label>
              <input
                id="register-email"
                name="email"
                type="email"
                placeholder="Alamat Email"
                value={form.email}
                onChange={handleChange}
                required
                className={inputCls}
              />
           </div>
           <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800 ml-1 block" htmlFor="register-username">Username</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">@</span>
                <input
                  id="register-username"
                  name="username"
                  placeholder="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className={`pl-8 ${inputCls}`}
                />
              </div>
           </div>
        </div>

        <div className="space-y-1.5">
           <label className="text-xs font-bold text-gray-800 ml-1 block" htmlFor="register-password">Password</label>
           <div className="relative">
             <input
               id="register-password"
               name="password"
               type={showPassword ? "text" : "password"}
               placeholder="Minimal 8 karakter"
               value={form.password}
               onChange={handleChange}
               required
               minLength={8}
               className={`pr-12 ${inputCls}`}
             />
             <div 
               className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
               onClick={() => setShowPassword(!showPassword)}
             >
               {showPassword ? <EyeOffIcon /> : <EyeIcon />}
             </div>
           </div>
        </div>

        <div className="space-y-1.5 relative">
           <label className="text-xs font-bold text-gray-800 ml-1 block" htmlFor="register-confirmPassword">Konfirmasi Password</label>
           <div className="relative">
             <input
               id="register-confirmPassword"
               name="confirmPassword"
               type={showConfirmPassword ? "text" : "password"}
               placeholder="Ulangi Password"
               value={form.confirmPassword}
               onChange={handleChange}
               required
               className={`pr-12 ${inputCls}`}
             />
             <div 
               className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
             >
               {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
             </div>
           </div>
           {error && (
             <motion.p
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
               className="absolute left-1 top-[calc(100%+4px)] text-xs font-semibold leading-tight text-[#db2744]"
             >
               {error}
             </motion.p>
           )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#db2744] text-white font-bold tracking-wide py-3.5 rounded-xl hover:bg-[#b01e33] transition-all mt-10 disabled:opacity-60"
        >
          {loading ? (
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            "Buat Akun Sekarang"
          )}
        </button>
      </form>
    </motion.div>
  );
}
