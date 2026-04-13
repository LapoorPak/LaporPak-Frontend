import { useState, type KeyboardEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useGetDinas,
  useGetKategori,
  useCreateKategori,
  useUpdateKategori,
  useDeleteKategori,
} from "@/hooks/admin";
import { QUERY_KEYS } from "@/api/queryKeys";
import type { Kategori } from "@/types/admin";
import {
  Plus, Search, Clock, Edit2, Trash2, X, AlertTriangle,
  Tags, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  dinasId: z.string().min(1, "Dinas harus dipilih"),
  code: z.string().min(1, "Kode tidak boleh kosong"),
  name: z.string().min(1, "Nama tidak boleh kosong"),
  description: z.string().optional().nullable(),
  slaHours: z.number().nullable().optional(),
  urgencyWeight: z.number().min(1).max(100),
  isActive: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const LIMIT = 15;

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="px-5 py-4"><div className="h-4 w-32 bg-gray-100 rounded mb-2" /><div className="flex gap-1"><div className="h-4 w-12 bg-gray-100 rounded-full" /><div className="h-4 w-16 bg-gray-100 rounded-full" /></div></td>
      <td className="px-5 py-4"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4 text-center"><div className="h-6 w-16 bg-gray-100 rounded mx-auto" /></td>
      <td className="px-5 py-4"><div className="h-4 w-10 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-5 w-14 bg-gray-100 rounded-full" /></td>
      <td className="px-5 py-4 text-right"><div className="h-6 w-14 bg-gray-100 rounded ml-auto" /></td>
    </tr>
  );
}

const URGENCY_COLORS = [
  "bg-emerald-500", "bg-emerald-400", "bg-lime-400",
  "bg-yellow-400", "bg-amber-400", "bg-orange-400",
  "bg-orange-500", "bg-red-400", "bg-red-500", "bg-rose-600",
];

function UrgencyBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const idx = Math.min(9, Math.floor((value / max) * 10));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${URGENCY_COLORS[idx]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-bold text-gray-400 w-7 text-right">{value}</span>
    </div>
  );
}

export default function AdminKategoriPage() {
  const [search, setSearch] = useState("");
  const [filterDinas, setFilterDinas] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Kategori | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState("");
  const queryClient = useQueryClient();

  const { data: dinasData } = useGetDinas({ limit: 1000 });

  const { data, isLoading } = useGetKategori(
    { search: search || undefined, dinasId: filterDinas || undefined, isActive: filterActive, page, limit: LIMIT },
    { placeholderData: (prev) => prev }
  );

  const kategoriList = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, urgencyWeight: 50, slaHours: 24 },
  });
  const isActiveVal = watch("isActive");
  const urgencyVal = watch("urgencyWeight");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_KATEGORI] });

  const createMutation = useCreateKategori({
    onSuccess: () => { toast.success("Kategori berhasil ditambahkan"); invalidate(); closeDrawer(); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Gagal menambahkan"),
  });

  const updateMutation = useUpdateKategori({
    onSuccess: () => { toast.success("Kategori berhasil diperbarui"); invalidate(); closeDrawer(); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Gagal menyimpan"),
  });

  const deleteMutation = useDeleteKategori({
    onSuccess: () => { toast.success("Kategori berhasil dihapus"); invalidate(); setDeleteTarget(null); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Gagal menghapus."),
  });

  const openDrawer = (k?: Kategori) => {
    reset({ isActive: true, urgencyWeight: 50, slaHours: 24 });
    setEditId(null);
    setKeywords([]);
    setKwInput("");
    if (k) {
      setEditId(k.id);
      (Object.keys(schema.shape) as (keyof FormValues)[]).forEach((key) => {
        setValue(key, (k as any)[key] ?? undefined);
      });
      setKeywords(k.keywords ?? []);
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => { setIsDrawerOpen(false); reset(); setEditId(null); setKeywords([]); setKwInput(""); };

  const onSubmit = (values: FormValues) => {
    if (editId) updateMutation.mutate({ id: editId, data: { ...values, keywords } });
    else createMutation.mutate({ ...values, keywords });
  };

  const addKw = () => {
    const kw = kwInput.trim();
    if (kw && !keywords.includes(kw)) setKeywords((prev) => [...prev, kw]);
    setKwInput("");
  };
  const removeKw = (kw: string) => setKeywords((prev) => prev.filter((x) => x !== kw));
  const onKwKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addKw(); }
    if (e.key === "Backspace" && !kwInput && keywords.length > 0) setKeywords((prev) => prev.slice(0, -1));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 lg:p-8 pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-xl font-heading font-black text-gray-900">Kategori Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Kelola klasifikasi dan topik laporan warga.</p>
        </div>
        <Button
          onClick={() => openDrawer()}
          className="bg-primary hover:bg-primary/90 text-white rounded-sm gap-2 font-bold px-5 shadow-lg shadow-primary/20"
        >
          <Plus size={16} /> Tambah Kategori
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
        {/* Filter bar */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex flex-wrap gap-3 items-center bg-gray-50/80">
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              placeholder="Cari nama atau kode..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 h-9 bg-white border border-gray-200 text-gray-900 text-sm rounded-sm placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <select
            value={filterDinas}
            onChange={(e) => { setFilterDinas(e.target.value); setPage(1); }}
            className="h-9 bg-white border border-gray-200 text-gray-700 text-sm rounded-sm px-3 focus:outline-none focus:border-primary appearance-none"
          >
            <option value="">Semua Dinas</option>
            {dinasData?.data?.map((d) => (
              <option key={d.id} value={d.id}>{d.short ?? d.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-sm p-1">
            {[
              { label: "Semua", val: undefined },
              { label: "Aktif", val: true },
              { label: "Nonaktif", val: false },
            ].map(({ label, val }) => (
              <button
                key={label}
                onClick={() => { setFilterActive(val); setPage(1); }}
                className={`px-3 h-7 text-xs font-semibold rounded-md transition-colors ${
                  filterActive === val ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {meta && <span className="text-xs text-gray-400 ml-auto">{meta.total} total</span>}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  { label: "Kategori", w: "" },
                  { label: "Dinas", w: "" },
                  { label: "SLA", w: "text-center" },
                  { label: "Urgency", w: "w-32" },
                  { label: "Laporan", w: "text-center" },
                  { label: "Status", w: "" },
                  { label: "Aksi", w: "text-right" },
                ].map(({ label, w }) => (
                  <th key={label} className={`px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider ${w}`}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : kategoriList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-sm bg-gray-100 flex items-center justify-center">
                        <Tags size={22} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm font-medium">Tidak ada kategori</p>
                      <p className="text-gray-400 text-xs">Tambahkan kategori baru menggunakan tombol di atas.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                kategoriList.map((k) => (
                  <tr key={k.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 shrink-0 uppercase">
                          {k.code}
                        </span>
                        <span className="font-semibold text-gray-900 text-sm truncate">{k.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {k.keywords?.slice(0, 3).map((kw) => (
                          <span key={kw} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200">
                            {kw}
                          </span>
                        ))}
                        {(k.keywords?.length ?? 0) > 3 && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded">
                            +{k.keywords!.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-gray-700 font-semibold">{k.dinas?.short ?? k.dinas?.name ?? "—"}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-500/20">
                        <Clock size={10} /> {k.slaHours ?? "—"}j
                      </span>
                    </td>
                    <td className="px-5 py-3.5 w-32">
                      <UrgencyBar value={k.urgencyWeight} max={100} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-6 bg-gray-100 border border-gray-200 rounded text-xs font-bold text-gray-600">
                        {k._count?.laporan ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        k.isActive
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-gray-100 text-gray-400 border-gray-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${k.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {k.isActive ? "Aktif" : "Off"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openDrawer(k)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-sm transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(k)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Halaman {page} dari {totalPages} &bull; {meta?.total ?? 0} data</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-sm text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = page <= 3 ? i + 1 : i + page - 2;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 text-xs font-semibold rounded-sm transition-colors ${p === page ? "bg-primary text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-sm text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Slide-over Drawer ── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={closeDrawer} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-gray-200 z-[70] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                <div>
                  <h2 className="font-heading font-black text-base text-gray-900">{editId ? "Edit Kategori" : "Tambah Kategori"}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Isi klasifikasi topik laporan.</p>
                </div>
                <button onClick={closeDrawer} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition-colors"><X size={18} /></button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <form id="kategori-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Dinas */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Induk Dinas *</label>
                    <select {...register("dinasId")} className="w-full bg-white border border-gray-200 text-gray-900 rounded-sm h-9 px-3 text-sm focus:outline-none focus:border-primary appearance-none">
                      <option value="">— Pilih Dinas —</option>
                      {dinasData?.data?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    {errors.dinasId && <p className="text-red-500 text-xs">{errors.dinasId.message as string}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Kode *</label>
                      <Input placeholder="INF" {...register("code")} className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary h-9 font-mono uppercase" />
                      {errors.code && <p className="text-red-500 text-xs">{errors.code.message}</p>}
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nama Kategori *</label>
                      <Input placeholder="Infrastruktur & Jalan" {...register("name")} className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary h-9" />
                      {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Deskripsi</label>
                    <Textarea placeholder="Laporan terkait infrastruktur jalan, jembatan, drainase..." {...register("description")} className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary resize-none h-16" />
                  </div>

                  {/* Keywords chip input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Kata Kunci</label>
                    <div className="min-h-9 bg-white border border-gray-200 rounded-sm px-3 py-1.5 flex flex-wrap gap-1.5 focus-within:border-primary transition-colors">
                      {keywords.map((kw) => (
                        <span key={kw} className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 text-xs text-gray-700 px-2 py-0.5 rounded-sm">
                          {kw}
                          <button type="button" onClick={() => removeKw(kw)} className="text-gray-400 hover:text-red-500">
                            <X size={9} />
                          </button>
                        </span>
                      ))}
                      <input
                        value={kwInput}
                        onChange={(e) => setKwInput(e.target.value)}
                        onKeyDown={onKwKeyDown}
                        onBlur={addKw}
                        placeholder={keywords.length === 0 ? "jalan rusak, lubang... (Enter)" : ""}
                        className="flex-1 min-w-16 bg-transparent text-gray-900 text-xs placeholder:text-gray-400 outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400">Tekan Enter untuk menambahkan kata kunci.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">SLA (Jam)</label>
                      <Input type="number" placeholder="24" {...register("slaHours", { setValueAs: (v) => v === "" || v == null ? null : Number(v) })} className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Bobot Urgency (1–100)</label>
                      <Input type="number" min="1" max="100" {...register("urgencyWeight", { valueAsNumber: true })} className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary h-9" />
                    </div>
                  </div>

                  {/* Urgency preview */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-sm space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Urgency Preview</span>
                      <span className="font-bold text-gray-900">{urgencyVal ?? 50} / 100</span>
                    </div>
                    <UrgencyBar value={urgencyVal ?? 50} max={100} />
                  </div>

                  {/* Status toggle */}
                  <button
                    type="button"
                    onClick={() => setValue("isActive", !isActiveVal)}
                    className={`w-full flex items-center justify-between p-4 rounded-sm border transition-colors ${isActiveVal ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"}`}
                  >
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-900">Status Aktif</p>
                      <p className="text-xs text-gray-500 mt-0.5">{isActiveVal ? "Kategori ini aktif menerima laporan." : "Kategori dinonaktifkan."}</p>
                    </div>
                    {isActiveVal ? <ToggleRight size={28} className="text-emerald-500 shrink-0" /> : <ToggleLeft size={28} className="text-gray-400 shrink-0" />}
                  </button>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
                <Button variant="ghost" onClick={closeDrawer} className="flex-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-sm">Batal</Button>
                <Button type="submit" form="kategori-form" disabled={isPending} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-sm font-bold shadow-lg shadow-primary/20">
                  {isPending ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambah Kategori"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Delete Dialog ── */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white border border-gray-200 rounded-sm shadow-2xl p-6 relative z-10 max-w-sm w-full">
              <div className="w-12 h-12 rounded-sm bg-red-50 border border-red-200 flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-500 w-6 h-6" />
              </div>
              <h3 className="text-base font-heading font-black text-gray-900 mb-1">Hapus Kategori?</h3>
              <p className="text-sm text-gray-500 mb-2">
                <span className="text-gray-900 font-semibold">{deleteTarget.name}</span> akan dihapus permanen.
              </p>
              {(deleteTarget._count?.laporan ?? 0) > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm text-xs text-amber-700 mb-3">
                  <p className="font-bold mb-0.5">Tidak dapat dihapus!</p>
                  <p>Sudah dipakai oleh <strong>{deleteTarget._count!.laporan} laporan</strong>.</p>
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <Button variant="ghost" className="flex-1 rounded-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100" onClick={() => setDeleteTarget(null)}>Batal</Button>
                <Button
                  className="flex-1 rounded-sm bg-red-500 hover:bg-red-600 text-white font-bold"
                  onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  disabled={deleteMutation.isPending || (deleteTarget._count?.laporan ?? 0) > 0}
                >
                  {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
