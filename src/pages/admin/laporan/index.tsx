import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetAdminLaporan,
  useGetDinas,
  useGetCabang,
  useUpdateAdminLaporanStatus,
  useAssignAdminLaporan,
  useDeleteAdminLaporan,
} from "@/hooks/admin";
import { QUERY_KEYS } from "@/api/queryKeys";
import type { AdminLaporan } from "@/types/admin";
import {
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Trash2,
  X,
  Building2,
  Bot,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ZoomIn,
  Image as ImageIcon,
  Navigation,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { resolvePhotoUrl } from "@/lib/resolve-photo-url";
import { maskCitizenName } from "@/lib/utils";
import {
  Map,
  MapMarker,
  MarkerContent,
  MapControls,
} from "@/components/ui/map";

const LIMIT = 20;

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Terverifikasi" },
  { value: "in_progress", label: "Diproses" },
  { value: "clarification_requested", label: "Butuh Klarifikasi" },
  { value: "resolved", label: "Selesai" },
  { value: "rejected", label: "Ditolak" },
] as const;

function getStatusStyle(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "verified":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "in_progress":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "clarification_requested":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "resolved":
      return "bg-green-50 text-green-700 border-green-200";
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function getStatusLabel(status: string) {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

function getImageUrl(url: string) {
  return resolvePhotoUrl(url);
}

function PhotoLightbox({
  images,
  index,
  onClose,
}: {
  images: string[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);
  const prev = useCallback(
    () => setCurrent((i) => (i > 0 ? i - 1 : images.length - 1)),
    [images.length],
  );
  const next = useCallback(
    () => setCurrent((i) => (i < images.length - 1 ? i + 1 : 0)),
    [images.length],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-200 bg-black/92 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
        onClick={onClose}
      >
        <X size={18} />
      </button>
      {images.length > 1 && (
        <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-xs font-bold tracking-widest">
          {current + 1} / {images.length}
        </span>
      )}
      {images.length > 1 && (
        <>
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}
      <motion.img
        key={current}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        src={images[current]}
        alt={`Foto ${current + 1}`}
        className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="px-4 py-3.5">
        <div className="h-3 w-20 bg-gray-100 rounded mb-1.5" />
        <div className="h-4 w-48 bg-gray-100 rounded mb-1" />
        <div className="h-3 w-24 bg-gray-100 rounded" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-5 w-20 bg-gray-100 rounded" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-8 w-24 bg-gray-100 rounded" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-4 w-28 bg-gray-100 rounded mb-1" />
        <div className="h-3 w-16 bg-gray-100 rounded" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-4 w-20 bg-gray-100 rounded" />
      </td>
    </tr>
  );
}

function ScoreCell({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 70
      ? "text-green-600"
      : pct >= 40
        ? "text-amber-600"
        : "text-red-500";
  return (
    <div className="bg-gray-50 rounded-sm p-2 text-center border border-gray-100">
      <p className="text-[10px] text-gray-400 mb-1 truncate">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{pct}%</p>
    </div>
  );
}

function VoteCell({ laporan }: { laporan: AdminLaporan }) {
  const voteScore = laporan.voteScore ?? 0;
  const upvotes = laporan.upvotes ?? 0;
  const downvotes = laporan.downvotes ?? 0;
  const scoreClass =
    voteScore > 0
      ? "text-emerald-700"
      : voteScore < 0
        ? "text-red-600"
        : "text-gray-600";

  return (
    <div className="inline-flex min-w-[88px] items-center justify-between gap-2 rounded-sm border border-gray-100 bg-gray-50 px-2.5 py-1.5">
      <span className={`text-sm font-black tabular-nums ${scoreClass}`}>
        {voteScore > 0 ? `+${voteScore}` : voteScore}
      </span>
      <div className="flex flex-col gap-0.5 text-[10px] font-bold leading-none">
        <span className="inline-flex items-center gap-1 text-emerald-600">
          <ThumbsUp size={10} />
          {upvotes}
        </span>
        <span className="inline-flex items-center gap-1 text-red-500">
          <ThumbsDown size={10} />
          {downvotes}
        </span>
      </div>
    </div>
  );
}

export default function AdminLaporanPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDinas, setFilterDinas] = useState("");
  const [page, setPage] = useState(1);
  const [selectedLaporan, setSelectedLaporan] = useState<AdminLaporan | null>(
    null,
  );
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminLaporan | null>(null);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showAiReview, setShowAiReview] = useState(false);

  const [statusVal, setStatusVal] = useState("");
  const [agencyNote, setAgencyNote] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");

  const [assignDinasId, setAssignDinasId] = useState("");
  const [assignCabangId, setAssignCabangId] = useState("");

  const queryClient = useQueryClient();

  const { data, isLoading } = useGetAdminLaporan(
    {
      search: search || undefined,
      status: filterStatus || undefined,
      dinasId: filterDinas || undefined,
      page,
      limit: LIMIT,
    },
    { placeholderData: (prev) => prev },
  );

  const { data: dinasData } = useGetDinas({ limit: 1000 });
  const { data: cabangForAssign } = useGetCabang(
    { dinasId: assignDinasId || undefined, limit: 100 },
    { enabled: showAssignForm && !!assignDinasId },
  );

  const laporanList = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_LAPORAN] });

  const updateStatusMutation = useUpdateAdminLaporanStatus({
    onSuccess: (res) => {
      toast.success("Status berhasil diperbarui");
      setSelectedLaporan(res.data);
      invalidate();
      setShowStatusForm(false);
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Gagal memperbarui status"),
  });

  const assignMutation = useAssignAdminLaporan({
    onSuccess: (res) => {
      toast.success("Cabang berhasil ditugaskan");
      setSelectedLaporan(res.data);
      invalidate();
      setShowAssignForm(false);
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Gagal menugaskan cabang"),
  });

  const deleteMutation = useDeleteAdminLaporan({
    onSuccess: () => {
      toast.success("Laporan berhasil dihapus");
      invalidate();
      const wasSelected = deleteTarget?.id === selectedLaporan?.id;
      setDeleteTarget(null);
      if (wasSelected) setSelectedLaporan(null);
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Gagal menghapus laporan"),
  });

  const selectLaporan = (l: AdminLaporan) => {
    setSelectedLaporan(l);
    setPhotoIndex(0);
    setShowStatusForm(false);
    setShowAssignForm(false);
    setShowAiReview(false);
  };

  const openStatusForm = () => {
    if (!selectedLaporan) return;
    setStatusVal(selectedLaporan.status);
    setAgencyNote(selectedLaporan.agencyNote ?? "");
    setResolutionNote(selectedLaporan.resolutionNote ?? "");
    setShowAssignForm(false);
    setShowStatusForm((v) => !v);
  };

  const openAssignForm = () => {
    if (!selectedLaporan) return;
    setAssignDinasId(selectedLaporan.kategori?.dinas?.id ?? "");
    setAssignCabangId(selectedLaporan.cabangDinas?.id ?? "");
    setShowStatusForm(false);
    setShowAssignForm((v) => !v);
  };

  const submitStatusUpdate = () => {
    if (!selectedLaporan || !statusVal) return;
    updateStatusMutation.mutate({
      id: selectedLaporan.id,
      status: statusVal,
      agencyNote: agencyNote || undefined,
      resolutionNote: resolutionNote || undefined,
    });
  };

  const submitAssign = () => {
    if (!selectedLaporan || !assignCabangId) return;
    assignMutation.mutate({
      id: selectedLaporan.id,
      cabangDinasId: assignCabangId,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-16 h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-heading font-black text-gray-900">
            Laporan Management
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Kelola dan tindak lanjuti laporan masuk.
          </p>
        </div>
        {meta && (
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-sm text-xs font-bold border border-gray-200">
              {meta.total} total
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-5 min-h-0">
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-sm flex flex-col overflow-hidden min-h-[500px] shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap gap-2 items-center bg-gray-50/80 shrink-0">
            <div className="relative flex-1 min-w-[140px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
              <input
                placeholder="Cari laporan..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-8 pr-3 h-8 bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-sm placeholder:text-gray-400 focus:outline-none focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 transition-colors"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="h-8 bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-sm px-2 focus:outline-none focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 appearance-none"
            >
              <option value="">Semua Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              value={filterDinas}
              onChange={(e) => {
                setFilterDinas(e.target.value);
                setPage(1);
              }}
              className="h-8 bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-sm px-2 focus:outline-none focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 appearance-none"
            >
              <option value="">Semua Dinas</option>
              {dinasData?.data?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.short ?? d.name}
                </option>
              ))}
            </select>
            {meta && (
              <span className="text-xs text-gray-400 ml-auto">
                {meta.total} total
              </span>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Laporan
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Vote
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : laporanList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-sm bg-gray-100 flex items-center justify-center">
                          <FileText size={20} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">
                          Tidak ada laporan ditemukan
                        </p>
                        <p className="text-gray-400 text-xs">
                          Coba ubah filter pencarian
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  laporanList.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => selectLaporan(l)}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${
                        selectedLaporan?.id === l.id
                          ? "bg-primary/5 border-l-2 border-l-primary"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="text-[10px] text-gray-400 font-mono mb-0.5">
                          {l.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {l.title}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {maskCitizenName(l.createdBy?.name, "—")}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(l.status)}`}
                        >
                          {getStatusLabel(l.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <VoteCell laporan={l} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-medium text-gray-700">
                          {l.kategori?.name ?? "—"}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {l.kategori?.dinas?.short ??
                            l.kategori?.dinas?.name ??
                            "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/60 shrink-0">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs text-gray-500">
                Halaman {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-sm flex flex-col overflow-hidden shadow-sm">
          {!selectedLaporan ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
              <div className="w-16 h-16 rounded-sm bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center">
                <FileText size={24} className="text-gray-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-500">
                  Pilih Laporan
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Klik baris laporan di tabel untuk melihat detail
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-100 shrink-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider mb-1.5 ${getStatusStyle(selectedLaporan.status)}`}
                    >
                      {getStatusLabel(selectedLaporan.status)}
                    </span>
                    <h2 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                      {selectedLaporan.title}
                    </h2>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      {selectedLaporan.id}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedLaporan(null)}
                    className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm shrink-0 transition-colors mt-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={openStatusForm}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-7 text-[11px] font-semibold rounded-sm border transition-colors ${
                      showStatusForm
                        ? "bg-primary text-white border-primary"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <RefreshCw size={11} />
                    Update Status
                  </button>
                  <button
                    onClick={openAssignForm}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-7 text-[11px] font-semibold rounded-sm border transition-colors ${
                      showAssignForm
                        ? "bg-primary text-white border-primary"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <Building2 size={11} />
                    Assign Cabang
                  </button>
                  <button
                    onClick={() => setDeleteTarget(selectedLaporan)}
                    className="px-3 h-7 text-[11px] font-semibold rounded-sm border bg-red-50 text-red-600 border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 size={11} />
                    Hapus
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Status update form */}
                <AnimatePresence>
                  {showStatusForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden border-b border-gray-100"
                    >
                      <div className="px-4 py-3 bg-primary/5 space-y-2.5">
                        <p className="text-xs font-bold text-gray-700">
                          Update Status Laporan
                        </p>
                        <select
                          value={statusVal}
                          onChange={(e) => setStatusVal(e.target.value)}
                          className="w-full h-8 bg-white border border-gray-200 text-gray-700 text-xs rounded-sm px-2 focus:outline-none focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <textarea
                          placeholder="Catatan dinas (opsional)..."
                          value={agencyNote}
                          onChange={(e) => setAgencyNote(e.target.value)}
                          rows={2}
                          className="w-full bg-white border border-gray-200 text-gray-700 text-xs rounded-sm px-3 py-2 focus:outline-none focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 resize-none"
                        />
                        {statusVal === "resolved" && (
                          <textarea
                            placeholder="Catatan resolusi..."
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            rows={2}
                            className="w-full bg-white border border-gray-200 text-gray-700 text-xs rounded-sm px-3 py-2 focus:outline-none focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 resize-none"
                          />
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={submitStatusUpdate}
                            disabled={updateStatusMutation.isPending}
                            className="flex-1 h-8 bg-primary text-white text-xs font-bold rounded-sm hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            {updateStatusMutation.isPending && (
                              <Loader2 size={12} className="animate-spin" />
                            )}
                            Simpan
                          </button>
                          <button
                            onClick={() => setShowStatusForm(false)}
                            className="px-4 h-8 bg-gray-100 text-gray-700 text-xs font-bold rounded-sm hover:bg-gray-200 transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Assign cabang form */}
                <AnimatePresence>
                  {showAssignForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden border-b border-gray-100"
                    >
                      <div className="px-4 py-3 bg-blue-50/60 space-y-2.5">
                        <p className="text-xs font-bold text-gray-700">
                          Assign ke Cabang
                        </p>
                        <select
                          value={assignDinasId}
                          onChange={(e) => {
                            setAssignDinasId(e.target.value);
                            setAssignCabangId("");
                          }}
                          className="w-full h-8 bg-white border border-gray-200 text-gray-700 text-xs rounded-sm px-2 focus:outline-none focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10"
                        >
                          <option value="">Pilih Dinas</option>
                          {dinasData?.data?.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                        {assignDinasId && (
                          <select
                            value={assignCabangId}
                            onChange={(e) => setAssignCabangId(e.target.value)}
                            className="w-full h-8 bg-white border border-gray-200 text-gray-700 text-xs rounded-sm px-2 focus:outline-none focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10"
                          >
                            <option value="">Pilih Cabang</option>
                            {(cabangForAssign?.data ?? []).map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} — {c.wilayah}
                              </option>
                            ))}
                          </select>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={submitAssign}
                            disabled={
                              !assignCabangId || assignMutation.isPending
                            }
                            className="flex-1 h-8 bg-primary text-white text-xs font-bold rounded-sm hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            {assignMutation.isPending && (
                              <Loader2 size={12} className="animate-spin" />
                            )}
                            Assign
                          </button>
                          <button
                            onClick={() => setShowAssignForm(false)}
                            className="px-4 h-8 bg-gray-100 text-gray-700 text-xs font-bold rounded-sm hover:bg-gray-200 transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="px-5 py-5 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Deskripsi
                    </label>
                    <div className="bg-gray-50 border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-700 min-h-18 leading-relaxed">
                      {selectedLaporan.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Pelapor
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-sm px-3 h-9 flex items-center text-sm text-gray-700 truncate">
                        {maskCitizenName(selectedLaporan.createdBy?.name, "—")}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Tanggal
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-sm px-3 h-9 flex items-center text-sm text-gray-700">
                        {new Date(selectedLaporan.createdAt).toLocaleDateString(
                          "id-ID",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Kategori
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-sm px-3 h-9 flex items-center text-sm text-gray-700 truncate">
                        {selectedLaporan.kategori?.name ?? "—"}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Dinas
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-sm px-3 h-9 flex items-center text-sm text-gray-700 truncate">
                        {selectedLaporan.kategori?.dinas?.short ??
                          selectedLaporan.kategori?.dinas?.name ??
                          "—"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Cabang Ditugaskan
                    </label>
                    <div
                      className={`border rounded-sm px-3 h-9 flex items-center text-sm truncate ${
                        selectedLaporan.cabangDinas
                          ? "bg-gray-50 border-gray-200 text-gray-700"
                          : "bg-amber-50 border-amber-200 text-amber-700"
                      }`}
                    >
                      {selectedLaporan.cabangDinas
                        ? `${selectedLaporan.cabangDinas.name} (${selectedLaporan.cabangDinas.wilayah})`
                        : "Belum ditugaskan"}
                    </div>
                  </div>

                  {(selectedLaporan.assignedTo ||
                    selectedLaporan.resolvedAt) && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedLaporan.assignedTo && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                            Ditangani
                          </label>
                          <div className="bg-gray-50 border border-gray-200 rounded-sm px-3 h-9 flex items-center text-sm text-gray-700 truncate">
                            {selectedLaporan.assignedTo.name}
                          </div>
                        </div>
                      )}
                      {selectedLaporan.resolvedAt && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                            Diselesaikan
                          </label>
                          <div className="bg-gray-50 border border-gray-200 rounded-sm px-3 h-9 flex items-center text-sm text-gray-700">
                            {new Date(
                              selectedLaporan.resolvedAt,
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedLaporan.address && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Alamat
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-sm px-3 py-2 text-sm text-gray-700 min-h-14 leading-relaxed">
                        {selectedLaporan.address}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Lokasi
                      </label>
                      {selectedLaporan.latitude != null &&
                        selectedLaporan.longitude != null && (
                          <span className="text-[11px] text-gray-400 font-mono">
                            {Number(selectedLaporan.latitude).toFixed(5)},{" "}
                            {Number(selectedLaporan.longitude).toFixed(5)}
                          </span>
                        )}
                    </div>
                    <div className="h-44 border border-gray-200 rounded-sm overflow-hidden relative bg-gray-100">
                      {selectedLaporan.latitude != null &&
                      selectedLaporan.longitude != null ? (
                        <Map
                          theme="dark"
                          center={[
                            selectedLaporan.longitude,
                            selectedLaporan.latitude,
                          ]}
                          zoom={15}
                          className="w-full h-full"
                        >
                          <MapMarker
                            longitude={selectedLaporan.longitude}
                            latitude={selectedLaporan.latitude}
                          >
                            <MarkerContent>
                              <div className="relative">
                                <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-2 bg-red-500" />
                              </div>
                            </MarkerContent>
                          </MapMarker>
                          <MapControls position="bottom-right" showZoom />
                        </Map>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                          <Navigation size={24} className="mb-1.5 opacity-40" />
                          <p className="text-xs">Koordinat tidak tersedia</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedLaporan.agencyNote && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Catatan Dinas
                      </label>
                      <div className="bg-blue-50 border border-blue-100 rounded-sm px-3 py-2.5 text-sm text-blue-800 leading-relaxed">
                        {selectedLaporan.agencyNote}
                      </div>
                    </div>
                  )}

                  {selectedLaporan.resolutionNote && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Catatan Resolusi
                      </label>
                      <div className="bg-green-50 border border-green-100 rounded-sm px-3 py-2.5 text-sm text-green-800 leading-relaxed">
                        {selectedLaporan.resolutionNote}
                      </div>
                    </div>
                  )}

                  {/* AI Review collapsible */}
                  {selectedLaporan.aiDecisionStatus && (
                    <div className="border border-gray-200 rounded-sm overflow-hidden">
                      <button
                        onClick={() => setShowAiReview((v) => !v)}
                        className="w-full px-3 py-2.5 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Bot size={12} className="text-gray-500" />
                          <span className="text-xs font-bold text-gray-700">
                            AI Review
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${getStatusStyle(selectedLaporan.aiDecisionStatus)}`}
                          >
                            {selectedLaporan.aiDecisionStatus}
                          </span>
                          {selectedLaporan.aiConfidence != null && (
                            <span className="text-[10px] text-gray-500">
                              {Math.round(selectedLaporan.aiConfidence * 100)}%
                              conf.
                            </span>
                          )}
                        </div>
                        {showAiReview ? (
                          <ChevronUp
                            size={12}
                            className="text-gray-400 shrink-0"
                          />
                        ) : (
                          <ChevronDown
                            size={12}
                            className="text-gray-400 shrink-0"
                          />
                        )}
                      </button>
                      <AnimatePresence>
                        {showAiReview && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 py-3 space-y-3 bg-white border-t border-gray-100">
                              {(selectedLaporan.aiClarityScore != null ||
                                selectedLaporan.aiSeriousnessScore != null ||
                                selectedLaporan.aiUrgencyScore != null) && (
                                <div className="grid grid-cols-3 gap-2">
                                  {selectedLaporan.aiClarityScore != null && (
                                    <ScoreCell
                                      label="Clarity"
                                      value={selectedLaporan.aiClarityScore}
                                    />
                                  )}
                                  {selectedLaporan.aiSeriousnessScore !=
                                    null && (
                                    <ScoreCell
                                      label="Seriousness"
                                      value={selectedLaporan.aiSeriousnessScore}
                                    />
                                  )}
                                  {selectedLaporan.aiUrgencyScore != null && (
                                    <ScoreCell
                                      label="Urgency"
                                      value={selectedLaporan.aiUrgencyScore}
                                    />
                                  )}
                                </div>
                              )}
                              {selectedLaporan.aiReasoning && (
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                    Alasan AI
                                  </p>
                                  <p className="text-xs text-gray-600 leading-relaxed">
                                    {selectedLaporan.aiReasoning}
                                  </p>
                                </div>
                              )}
                              {selectedLaporan.aiRejectionCode && (
                                <div className="bg-red-50 border border-red-100 rounded-sm px-2 py-2">
                                  <p className="text-[10px] font-bold text-red-600 mb-0.5 uppercase">
                                    Rejection Code
                                  </p>
                                  <p className="text-xs text-red-700">
                                    {selectedLaporan.aiRejectionCode}
                                  </p>
                                </div>
                              )}
                              {selectedLaporan.aiSuggestedRewrite && (
                                <div className="bg-amber-50 border border-amber-100 rounded-sm px-2 py-2">
                                  <p className="text-[10px] font-bold text-amber-600 mb-0.5 uppercase">
                                    Saran Penulisan Ulang
                                  </p>
                                  <p className="text-xs text-amber-700 leading-relaxed">
                                    {selectedLaporan.aiSuggestedRewrite}
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Foto Laporan
                      </label>
                      <span className="text-[11px] text-gray-400">
                        {selectedLaporan.images.length} foto
                      </span>
                    </div>
                    {selectedLaporan.images.length > 0 ? (
                      <div className="relative bg-gray-900 rounded-sm overflow-hidden h-40">
                        <button
                          type="button"
                          className="absolute inset-0 w-full h-full cursor-zoom-in z-1 group"
                          onClick={() =>
                            setLightbox({
                              images: selectedLaporan.images.map(getImageUrl),
                              index: photoIndex,
                            })
                          }
                        >
                          <img
                            src={getImageUrl(
                              selectedLaporan.images[photoIndex],
                            )}
                            alt=""
                            className="w-full h-full object-cover opacity-90"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                          <ZoomIn
                            size={16}
                            className="absolute top-2 right-2 text-white/70 drop-shadow opacity-0 group-hover:opacity-100 transition-opacity z-2"
                          />
                        </button>
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                        {selectedLaporan.images.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                setPhotoIndex((i) => Math.max(0, i - 1))
                              }
                              disabled={photoIndex === 0}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 z-10 transition-colors"
                            >
                              <ChevronLeft size={13} />
                            </button>
                            <button
                              onClick={() =>
                                setPhotoIndex((i) =>
                                  Math.min(
                                    selectedLaporan.images.length - 1,
                                    i + 1,
                                  ),
                                )
                              }
                              disabled={
                                photoIndex === selectedLaporan.images.length - 1
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 z-10 transition-colors"
                            >
                              <ChevronRight size={13} />
                            </button>
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                              {selectedLaporan.images.map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-1 rounded-full transition-all ${i === photoIndex ? "bg-white w-3" : "bg-white/50 w-1"}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                        <div className="absolute bottom-2 right-3 z-10 text-white/70 text-[10px] font-mono">
                          {photoIndex + 1}/{selectedLaporan.images.length}
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 border-2 border-dashed border-gray-200 rounded-sm bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon size={20} className="mb-1 opacity-40" />
                        <span className="text-[11px]">Tidak ada foto</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <PhotoLightbox
            images={lightbox.images}
            index={lightbox.index}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setDeleteTarget(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="bg-white rounded-sm border border-gray-200 shadow-xl w-full max-w-sm p-6 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-sm bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Hapus Laporan
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Apakah Anda yakin ingin menghapus laporan{" "}
                    <span className="font-semibold text-gray-700">
                      "{deleteTarget.title}"
                    </span>
                    ? Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 h-9 bg-gray-100 text-gray-700 text-sm font-semibold rounded-sm hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 h-9 bg-red-500 text-white text-sm font-semibold rounded-sm hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
