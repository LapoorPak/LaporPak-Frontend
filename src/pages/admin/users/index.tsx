import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetUsers,
  useGetCabang,
  useAssignPetugas,
  useRemovePetugas,
  useUpdateUser,
  useResetUserPassword,
} from "@/hooks/admin";
import { QUERY_KEYS } from "@/api/queryKeys";
import type { User, Cabang } from "@/types/admin";
import {
  Search, Users, Ban, Building2, Lock, X, CheckCircle2,
  ChevronRight, Check, Shield, UserCheck, ChevronLeft, ChevronRight as ChevronRightIcon,
  Phone, Mail, Calendar, Hash,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function getRoleBadge(role: string | null) {
  if (role === "admin")
    return <span className="inline-flex items-center gap-1 bg-violet-500/15 text-violet-400 border border-violet-500/25 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider"><Shield size={9} /> ADMIN</span>;
  if (role === "agency" || role === "petugas")
    return <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider"><UserCheck size={9} /> DINAS</span>;
  return <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider"><Users size={9} /> WARGA</span>;
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100">
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
                <div className="h-2.5 w-36 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </td>
          <td className="px-4 py-3"><div className="h-5 w-16 bg-gray-100 rounded animate-pulse" /></td>
          <td className="px-4 py-3"><div className="h-5 w-14 bg-gray-100 rounded animate-pulse" /></td>
          <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-100 rounded animate-pulse" /></td>
        </tr>
      ))}
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_USERS] });

  // Filters & pagination
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterBanned, setFilterBanned] = useState<"" | "true" | "false">("");
  const [filterHasPetugas, setFilterHasPetugas] = useState<"" | "true">("");
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  // Selected user for detail panel
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Wizard modal
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardCabang, setWizardCabang] = useState<Cabang | null>(null);
  const [wizardNip, setWizardNip] = useState("");
  const [cabangSearch, setCabangSearch] = useState("");

  // Ban modal
  const [banOpen, setBanOpen] = useState(false);
  const [banReason, setBanReason] = useState("");

  // Reset password modal
  const [resetOpen, setResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // ── Queries ──

  const params = {
    search: search || undefined,
    role: filterRole || undefined,
    banned: filterBanned !== "" ? filterBanned === "true" : undefined,
    hasPetugas: filterHasPetugas === "true" ? true : undefined,
    page,
    limit: LIMIT,
  };

  const { data, isLoading } = useGetUsers(params, { placeholderData: (prev) => prev });

  const { data: cabangData } = useGetCabang({ limit: 1000 }, { enabled: wizardOpen });

  // ── Mutations ──

  const assignMutation = useAssignPetugas({
    onSuccess: () => {
      toast.success("Berhasil ditugaskan sebagai Petugas");
      invalidate();
      setWizardOpen(false);
      setSelectedUser(null);
    },
    onError: () => toast.error("Gagal menugaskan petugas"),
  });

  const removeMutation = useRemovePetugas({
    onSuccess: () => {
      toast.success("Akses petugas dicabut");
      invalidate();
      setSelectedUser(null);
    },
    onError: () => toast.error("Gagal mencabut akses petugas"),
  });

  const banMutation = useUpdateUser({
    onSuccess: () => {
      toast.success(selectedUser?.banned ? "Pengguna berhasil di-unban" : "Pengguna berhasil di-ban");
      invalidate();
      setBanOpen(false);
      setSelectedUser(null);
    },
    onError: () => toast.error("Gagal memperbarui status"),
  });

  const resetMutation = useResetUserPassword({
    onSuccess: () => {
      toast.success("Password berhasil direset");
      setResetOpen(false);
      setNewPassword("");
    },
    onError: () => toast.error("Gagal mereset password"),
  });

  // ── Wizard helpers ──

  const openWizard = () => {
    setWizardStep(1);
    setWizardCabang(null);
    setWizardNip("");
    setCabangSearch("");
    setWizardOpen(true);
  };

  const filteredCabang = cabangData?.data?.filter((c) =>
    !cabangSearch || c.name.toLowerCase().includes(cabangSearch.toLowerCase()) ||
    c.dinas?.name?.toLowerCase().includes(cabangSearch.toLowerCase())
  ) ?? [];

  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="h-full flex flex-col p-6 gap-5">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-xl font-heading font-bold text-gray-900">Users Management</h1>
        <p className="text-xs text-gray-500 mt-0.5">Kelola pengguna, role, dan penugasan petugas</p>
      </div>

      {/* Main split */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* ── Left: Table ── */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-sm border border-gray-200 overflow-hidden shadow-sm">
          {/* Filters */}
          <div className="shrink-0 p-4 border-b border-gray-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <Input
                placeholder="Cari nama atau email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-9 bg-white border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 rounded-sm focus-visible:ring-primary/40"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterRole}
                onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
                className="h-8 bg-white border border-gray-200 text-gray-700 text-xs rounded-sm px-2.5 outline-none focus:border-primary"
              >
                <option value="">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="agency">Petugas Dinas</option>
                <option value="warga">Warga</option>
              </select>

              <button
                onClick={() => { setFilterBanned(filterBanned === "true" ? "" : "true"); setPage(1); }}
                className={`h-8 px-3 text-xs rounded-sm border transition-colors font-medium ${
                  filterBanned === "true"
                    ? "bg-red-50 text-red-500 border-red-200"
                    : "bg-white text-gray-500 border-gray-200 hover:text-gray-900"
                }`}
              >
                <Ban size={11} className="inline mr-1" />Banned
              </button>

              <button
                onClick={() => { setFilterHasPetugas(filterHasPetugas === "true" ? "" : "true"); setPage(1); }}
                className={`h-8 px-3 text-xs rounded-sm border transition-colors font-medium ${
                  filterHasPetugas === "true"
                    ? "bg-gray-900 text-white border-gray-800"
                    : "bg-white text-gray-500 border-gray-200 hover:text-gray-900"
                }`}
              >
                <Building2 size={11} className="inline mr-1" />Petugas
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pengguna</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Bergabung</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonRows />
                ) : !data?.data?.length ? (
                  <tr>
                    <td colSpan={4} className="py-16">
                      <div className="flex flex-col items-center gap-3">
                        <img src="/illustrations/empty_state.png" alt="" className="w-28 h-28 object-contain opacity-60 mix-blend-screen" />
                        <p className="text-xs text-gray-400">Pengguna tidak ditemukan</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.data.map((user) => {
                    const isSelected = selectedUser?.id === user.id;
                    return (
                      <tr
                        key={user.id}
                        onClick={() => setSelectedUser(isSelected ? null : user)}
                        className={`border-b border-gray-100 cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/5 border-l-2 border-l-primary" : "border-l-2 border-l-transparent hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-100 border border-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-600 shrink-0">
                              {getInitials(user.name || "?")}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-gray-900 truncate">{user.name}</div>
                              <div className="text-[11px] text-gray-400 truncate">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {getRoleBadge(user.role)}
                            {user.petugas && (
                              <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Building2 size={9} />
                                {user.petugas.cabangDinas?.name ?? "Cabang"}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {user.banned ? (
                            <span className="inline-flex items-center gap-1 text-red-500 text-[10px] font-bold">
                              <Ban size={10} /> BAN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                              <CheckCircle2 size={10} /> AKTIF
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-[11px] text-gray-400">{formatDate(user.createdAt)}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="shrink-0 px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Total {data?.meta?.total ?? 0} pengguna
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 rounded-sm flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-sm text-xs font-semibold transition-colors ${
                        p === page
                          ? "bg-primary text-white"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 rounded-sm flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Detail ── */}
        <div className="lg:col-span-2 bg-white rounded-sm border border-gray-200 overflow-hidden flex flex-col shadow-sm">
          <AnimatePresence mode="wait">
            {selectedUser ? (
              <motion.div
                key={selectedUser.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col h-full"
              >
                {/* User header */}
                <div className="p-5 border-b border-gray-100 flex items-start gap-4 bg-gray-50">
                  <div className="w-14 h-14 rounded-sm bg-gradient-to-br from-gray-200 to-gray-100 border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 shrink-0">
                    {getInitials(selectedUser.name || "?")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{selectedUser.name}</h3>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {getRoleBadge(selectedUser.role)}
                      {selectedUser.banned ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-500 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          <Ban size={9} /> BANNED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          <CheckCircle2 size={9} /> AKTIF
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Info section */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Contact info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <Mail size={12} className="text-gray-400" />
                      <span className="truncate">{selectedUser.email}</span>
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        <Phone size={12} className="text-gray-400" />
                        <span>{selectedUser.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <Calendar size={12} className="text-gray-400" />
                      <span>Bergabung {formatDate(selectedUser.createdAt)}</span>
                    </div>
                  </div>

                  {/* Petugas info */}
                  {selectedUser.petugas ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-sm p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 size={13} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-600">Informasi Petugas</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-[10px] text-gray-500 mb-0.5">Cabang</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedUser.petugas.cabangDinas?.name ?? "—"}
                          </p>
                          {selectedUser.petugas.cabangDinas?.dinas && (
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {selectedUser.petugas.cabangDinas.dinas.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 mb-0.5">NIP</p>
                          <div className="flex items-center gap-1.5">
                            <Hash size={11} className="text-gray-400" />
                            <p className="text-xs text-gray-700 font-mono">
                              {selectedUser.petugas.nip ?? "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-sm p-4 text-center">
                      <Building2 size={20} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Belum ditugaskan sebagai petugas dinas</p>
                    </div>
                  )}

                  {/* Ban info */}
                  {selectedUser.banned && selectedUser.banReason && (
                    <div className="bg-red-50 border border-red-200 rounded-sm p-3">
                      <p className="text-[10px] text-red-500 font-bold mb-1">Alasan Ban</p>
                      <p className="text-xs text-gray-500">{selectedUser.banReason}</p>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="shrink-0 p-4 border-t border-gray-100 space-y-2">
                  {/* Assign / Remove Petugas */}
                  {!selectedUser.petugas ? (
                    <button
                      onClick={openWizard}
                      className="w-full h-9 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-sm text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Building2 size={14} /> Jadikan Petugas Dinas
                    </button>
                  ) : (
                    <button
                      onClick={() => removeMutation.mutate(selectedUser!.id)}
                      disabled={removeMutation.isPending}
                      className="w-full h-9 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-sm text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <X size={14} /> {removeMutation.isPending ? "Mencabut..." : "Cabut Akses Petugas"}
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {/* Reset Password */}
                    <button
                      onClick={() => { setNewPassword(""); setResetOpen(true); }}
                      className="h-9 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-sm text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Lock size={13} /> Reset Password
                    </button>

                    {/* Ban / Unban */}
                    <button
                      onClick={() => { setBanReason(""); setBanOpen(true); }}
                      className={`h-9 rounded-sm text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors ${
                        selectedUser.banned
                          ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/25"
                          : "bg-red-500/15 hover:bg-red-500/25 text-red-400 border-red-500/25"
                      }`}
                    >
                      {selectedUser.banned ? (
                        <><CheckCircle2 size={13} /> Unban</>
                      ) : (
                        <><Ban size={13} /> Ban</>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-14 h-14 rounded-sm bg-gray-100 border border-gray-200 flex items-center justify-center mb-4">
                  <Users size={24} className="text-gray-300" />
                </div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Pilih Pengguna</h3>
                <p className="text-xs text-gray-300 max-w-[180px]">
                  Klik baris pengguna di tabel untuk melihat detail dan tindakan
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Petugas Wizard Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {wizardOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setWizardOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 w-full max-w-md bg-white border border-gray-200 rounded-sm shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">Tugaskan Petugas Dinas</h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">untuk {selectedUser?.name}</p>
                </div>
                <button
                  onClick={() => setWizardOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Step indicator */}
              <div className="px-5 pt-5 pb-2">
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        wizardStep > s
                          ? "bg-primary text-white"
                          : wizardStep === s
                          ? "bg-primary text-white ring-2 ring-primary/30"
                          : "bg-gray-100 text-gray-400 border border-gray-200"
                      }`}>
                        {wizardStep > s ? <Check size={12} /> : s}
                      </div>
                      {s < 3 && (
                        <div className={`w-10 h-0.5 rounded-full transition-colors ${wizardStep > s ? "bg-primary" : "bg-gray-200"}`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-12 mt-1.5">
                  {["Cabang", "NIP", "Konfirmasi"].map((label, i) => (
                    <span key={i} className={`text-[10px] font-medium ${wizardStep === i + 1 ? "text-primary" : "text-gray-400"}`}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div className="px-5 pb-5">
                <AnimatePresence mode="wait">
                  {wizardStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3 pt-3"
                    >
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">Pilih Cabang Dinas</p>
                        <p className="text-[11px] text-gray-500 mb-3">Tempat petugas ini akan berdinas</p>
                        <div className="relative mb-2">
                          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={cabangSearch}
                            onChange={(e) => setCabangSearch(e.target.value)}
                            placeholder="Cari cabang..."
                            className="w-full h-9 pl-8 pr-3 bg-white border border-gray-200 rounded-sm text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1 rounded-sm border border-gray-200 bg-gray-50">
                          {filteredCabang.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">Tidak ada cabang</p>
                          ) : filteredCabang.slice(0, 20).map((c) => (
                            <button
                              key={c.id}
                              onClick={() => setWizardCabang(c)}
                              className={`w-full text-left px-3 py-2.5 rounded-sm transition-colors flex items-center gap-3 ${
                                wizardCabang?.id === c.id
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-gray-100 text-gray-700"
                              }`}
                            >
                              {wizardCabang?.id === c.id ? (
                                <Check size={13} className="shrink-0 text-primary" />
                              ) : (
                                <div className="w-3 h-3 rounded-full border border-gray-300 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-medium truncate">{c.name}</p>
                                {c.dinas && <p className="text-[10px] text-gray-400 truncate">{c.dinas.name}</p>}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => setWizardStep(2)}
                        disabled={!wizardCabang}
                        className="w-full h-9 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-sm flex items-center justify-center gap-1.5 transition-colors"
                      >
                        Lanjut <ChevronRight size={14} />
                      </button>
                    </motion.div>
                  )}

                  {wizardStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3 pt-3"
                    >
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">Nomor Induk Pegawai (NIP)</p>
                        <p className="text-[11px] text-gray-500 mb-3">Opsional — kosongkan jika tidak tersedia</p>
                        <Input
                          placeholder="Contoh: 198801012010011001"
                          value={wizardNip}
                          onChange={(e) => setWizardNip(e.target.value)}
                          className="h-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-sm focus-visible:ring-primary/40 font-mono"
                        />
                        <p className="text-[10px] text-gray-400 mt-1.5">Biarkan kosong untuk melewati langkah ini</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setWizardStep(1)}
                          className="w-1/3 h-9 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 rounded-sm text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <ChevronLeft size={14} /> Kembali
                        </button>
                        <button
                          onClick={() => setWizardStep(3)}
                          className="flex-1 h-9 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-sm flex items-center justify-center gap-1.5 transition-colors"
                        >
                          Lanjut <ChevronRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {wizardStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3 pt-3"
                    >
                      <div className="bg-gray-50 border border-gray-200 rounded-sm p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Check size={14} className="text-emerald-500" />
                          <p className="text-xs font-bold text-gray-900">Ringkasan Penugasan</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-gray-400 text-[10px] mb-0.5">Pengguna</p>
                            <p className="text-gray-900 font-semibold truncate">{selectedUser?.name}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[10px] mb-0.5">Cabang</p>
                            <p className="text-gray-900 font-semibold truncate">{wizardCabang?.name}</p>
                          </div>
                          {wizardCabang?.dinas && (
                            <div>
                              <p className="text-gray-400 text-[10px] mb-0.5">Dinas</p>
                              <p className="text-gray-900 font-semibold truncate">{wizardCabang.dinas.name}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-400 text-[10px] mb-0.5">NIP</p>
                            <p className="text-gray-700 font-mono">{wizardNip || "—"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setWizardStep(2)}
                          className="w-1/3 h-9 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 rounded-sm text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <ChevronLeft size={14} /> Kembali
                        </button>
                        <button
                          onClick={() => assignMutation.mutate({ id: selectedUser!.id, data: { cabangDinasId: wizardCabang!.id, nip: wizardNip || undefined } })}
                          disabled={assignMutation.isPending}
                          className="flex-1 h-9 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-xs font-bold rounded-sm flex items-center justify-center gap-1.5 transition-colors"
                        >
                          {assignMutation.isPending ? "Menyimpan..." : <><Check size={14} /> Konfirmasi & Simpan</>}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Reset Password Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {resetOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setResetOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 w-full max-w-sm bg-white border border-gray-200 rounded-sm shadow-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">Reset Password</h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">{selectedUser?.name}</p>
                </div>
                <button onClick={() => setResetOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Password Baru <span className="text-gray-400 font-normal">(opsional)</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Kosongkan untuk reset ke default"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-sm focus-visible:ring-primary/40"
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5">Jika dikosongkan, password akan direset ke nilai default sistem</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setResetOpen(false)}
                    className="flex-1 h-9 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 rounded-sm text-xs font-semibold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => resetMutation.mutate({ id: selectedUser!.id, newPassword: newPassword || undefined })}
                    disabled={resetMutation.isPending}
                    className="flex-1 h-9 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-xs font-bold rounded-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Lock size={13} /> {resetMutation.isPending ? "Mereset..." : "Reset Password"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Ban / Unban Modal ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {banOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setBanOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 w-full max-w-sm bg-white border border-gray-200 rounded-sm shadow-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">
                    {selectedUser?.banned ? "Unban Pengguna" : "Ban Pengguna"}
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">{selectedUser?.name}</p>
                </div>
                <button onClick={() => setBanOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {!selectedUser?.banned ? (
                  <>
                    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-sm">
                      <Ban size={16} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">
                        Pengguna ini akan diblokir dan tidak dapat masuk ke sistem.
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                        Alasan Ban <span className="text-gray-400 font-normal">(opsional)</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tuliskan alasan pemblokiran..."
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-gray-900 text-xs placeholder:text-gray-400 rounded-sm px-3 py-2.5 outline-none focus:border-primary resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-sm">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600">
                      Pengguna ini akan diaktifkan kembali dan dapat masuk ke sistem.
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setBanOpen(false)}
                    className="flex-1 h-9 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 rounded-sm text-xs font-semibold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => banMutation.mutate({ id: selectedUser!.id, data: { banned: !selectedUser!.banned, banReason: !selectedUser!.banned ? banReason || undefined : undefined } as Partial<User> })}
                    disabled={banMutation.isPending}
                    className={`flex-1 h-9 disabled:opacity-50 text-white text-xs font-bold rounded-sm flex items-center justify-center gap-1.5 transition-colors ${
                      selectedUser?.banned
                        ? "bg-emerald-600 hover:bg-emerald-500"
                        : "bg-red-600 hover:bg-red-500"
                    }`}
                  >
                    {banMutation.isPending ? "Memproses..." : (
                      selectedUser?.banned ? <><CheckCircle2 size={13} /> Aktifkan</> : <><Ban size={13} /> Ban Pengguna</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
