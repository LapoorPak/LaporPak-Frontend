import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { GoogleIcon, EyeIcon, EyeOffIcon } from "@/assets/icon";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await authClient.signIn.email({ email, password });

    if (error) {
      setError(error.message || "Login gagal");
      setLoading(false);
      return;
    }

    navigate("/dashboard");
  };

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
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
          Selamat datang!
        </h1>
        <p className="text-gray-600 text-sm font-medium">
          Belum punya akun?{" "}
          <Link to="/register" className="text-[#db2744] font-bold hover:underline transition-all">
            Daftar
          </Link>
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-5 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 text-center font-medium"
        >
          {error}
        </motion.div>
      )}

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-bold text-sm px-4 py-3 rounded-xl transition-all mb-6"
      >
        <GoogleIcon />
        Login dengan Google
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-[11px] font-bold text-gray-400">atau masuk dengan email anda</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-800 ml-1 block" htmlFor="login-email">Alamat Email</label>
          <div className="relative">
            <input
              id="login-email"
              type="email"
              placeholder="Alamat Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#db2744] focus:ring-1 focus:ring-[#db2744] transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-800 ml-1 block" htmlFor="login-password">Password</label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#db2744] focus:ring-1 focus:ring-[#db2744] transition-all"
            />
            <div 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#db2744] text-white font-bold tracking-wide py-3.5 rounded-xl hover:bg-[#b01e33] transition-all mt-6 disabled:opacity-60"
        >
          {loading ? (
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            "Masuk"
          )}
        </button>
      </form>
    </motion.div>
  );
}
