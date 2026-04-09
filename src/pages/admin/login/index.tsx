import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { EyeIcon, EyeOffIcon, GoogleIcon } from "@/assets/icon";
import { authClient } from "@/lib/auth-client";
import { getDashboardPathForPortal } from "@/lib/auth-portal";
import {
  clearOAuthAttemptPortal,
  getOAuthAttemptPortal,
  setOAuthAttemptPortal,
} from "@/lib/oauth-attempt";
import { consumePortalError, getAuthErrorMessage } from "@/lib/portal-error";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const adminDashboardPath = getDashboardPathForPortal("admin");
  const adminDashboardUrl = `${window.location.origin}${adminDashboardPath}`;
  const adminLoginUrl = `${window.location.origin}/admin/login`;
  const errorProcessedRef = useRef(false);

  useEffect(() => {
    const portalError = consumePortalError();
    if (portalError?.message) {
      clearOAuthAttemptPortal();
      setError(portalError.message);
      toast.error(portalError.message);
      return;
    }

    const errorParam =
      searchParams.get("portal_error") || searchParams.get("error");
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
          portal: "admin",
          screen: "login",
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
      if (
        !isSessionPending &&
        !session?.user &&
        getOAuthAttemptPortal() === "admin"
      ) {
        const nextError =
          "Login berhasil diproses, tetapi sesi admin belum terbaca. Coba ulangi login atau refresh halaman.";
        clearOAuthAttemptPortal();
        setError(nextError);
        toast.error(nextError);
      }
      return;
    }

    clearOAuthAttemptPortal();
    navigate(adminDashboardPath, { replace: true });
  }, [adminDashboardPath, isSessionPending, navigate, session]);

  const handleGoogleLogin = async () => {
    if (googleLoading || loading) {
      return;
    }

    setError("");
    setGoogleLoading(true);
    setOAuthAttemptPortal("admin");

    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: adminDashboardUrl,
      errorCallbackURL: adminLoginUrl,
      additionalData: {
        portal: "admin",
      },
    });

    if (error) {
      clearOAuthAttemptPortal();
      setError(error.message || "Login admin dengan Google gagal");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await authClient.signIn.email({
      email: identifier,
      password,
      callbackURL: adminDashboardUrl,
    });

    if (error) {
      setError(error.message || "Login admin gagal");
      setLoading(false);
      return;
    }

    navigate(adminDashboardPath, { replace: true });
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
          Portal Administrator
        </h1>
        <p className="text-gray-600 text-sm font-medium leading-relaxed">
          Pusat kendali LaporPak. Pantau seluruh aktivitas lintas dinas dan kelola eskalasi sistem secara terpusat.
        </p>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-bold text-sm px-4 py-3 rounded-xl transition-all mb-6 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {googleLoading ? (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        {googleLoading ? "Mengarahkan ke Google..." : "Login dengan Google"}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-[11px] font-bold text-gray-400">
            atau masuk dengan akun admin
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            className="text-xs font-bold text-gray-800 ml-1 block"
            htmlFor="admin-identifier"
          >
            Email Admin
          </label>
          <input
            id="admin-identifier"
            type="email"
            placeholder="admin@laporpak.id"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#db2744] focus:ring-1 focus:ring-[#db2744] transition-all"
          />
        </div>

        <div className="space-y-1.5 relative">
          <label
            className="text-xs font-bold text-gray-800 ml-1 block"
            htmlFor="admin-password"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#db2744] focus:ring-1 focus:ring-[#db2744] transition-all"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
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
            "Masuk"
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-sm font-medium text-gray-500">
        Masuk sebagai dinas?{" "}
        <Link
          to="/agency/login"
          className="font-bold text-[#db2744] hover:underline"
        >
          Gunakan portal dinas
        </Link>
      </p>
    </motion.div>
  );
}
