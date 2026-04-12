import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { adminApi } from "@/api/admin";
import { QUERY_KEYS } from "@/api/queryKeys";
import type { Dinas } from "@/types/admin";
import {
  Plus, Search, MapPin, Tag, Edit2, Trash2, X, AlertTriangle,
  Building2, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  code: z.string().min(1, "Kode tidak boleh kosong"),
  name: z.string().min(1, "Nama tidak boleh kosong"),
  type: z.string().optional().nullable(),
  short: z.string().optional().nullable(),
  wilayah: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean(),
  routingPriority: z.number().min(1),
});
type FormValues = z.infer<typeof schema>;

const LIMIT = 15;

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="px-5 py-4"><div className="h-4 w-40 bg-gray-100 rounded mb-2" /><div className="h-3 w-24 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-6 w-14 bg-gray-100 rounded-md" /></td>
      <td className="px-5 py-4"><div className="h-6 w-16 bg-gray-100 rounded-full" /></td>
      <td className="px-5 py-4"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4 text-right"><div className="h-7 w-16 bg-gray-100 rounded ml-auto" /></td>
    </tr>
  );
}

export default function AdminDinasPage() {
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dinas | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_DINAS, search, filterActive, page],
    queryFn: () => adminApi.getDinas({ search: search || undefined, isActive: filterActive, page, limit: LIMIT }),
    placeholderData: (prev) => prev,
  });

  const dinas = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, routingPriority: 100 },
  });
  const isActiveVal = watch("isActive");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_DINAS] });

  const createMutation = useMutation({
    mutationFn: adminApi.createDinas,
    onSuccess: () => { toast.success("Dinas berhasil ditambahkan"); invalidate(); closeDrawer(); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Gagal menambahkan"),
  });

  const updateMutation = useMutation({
    mutationFn: (args: { id: string; data: Partial<FormValues> }) => adminApi.updateDinas(args.id, args.data),
    onSuccess: () => { toast.success("Dinas berhasil diperbarui"); invalidate(); closeDrawer(); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Gagal menyimpan"),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteDinas,
    onSuccess: () => { toast.success("Dinas berhasil dihapus"); invalidate(); setDeleteTarget(null); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Gagal menghapus. Pastikan tidak ada relasi."),
  });

  const openDrawer = (d?: Dinas) => {
    reset({ isActive: true, routingPriority: 100 });
    setEditId(null);
    if (d) {
      setEditId(d.id);
      (Object.keys(schema.shape) as (keyof FormValues)[]).forEach((key) => {
        setValue(key, (d as any)[key] ?? undefined);
      });
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => { setIsDrawerOpen(false); reset(); setEditId(null); };

  const onSubmit = (values: FormValues) => {
    if (editId) updateMutation.mutate({ id: editId, data: values });
    else createMutation.mutate(values as any);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-xl font-heading font-black text-gray-900">Dinas Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Kelola data instansi dinas pemerintah.</p>
        </div>
        <Button
          onClick={() => openDrawer()}
          className="bg-primary hover:bg-primary/90 text-white rounded-sm gap-2 font-bold px-5 shadow-sm shadow-primary/20 shrink-0"
        >
          <Plus size={16} /> Tambah Dinas
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
        {/* Filter bar */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              placeholder="Cari dinas..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 h-9 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-sm placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-sm p-1">
            {[
              { label: "Semua", val: undefined },
              { label: "Aktif", val: true },
              { label: "Nonaktif", val: false },
            ].map(({ label, val }) => (
              <button
                key={label}
                onClick={() => { setFilterActive(val); setPage(1); }}
                className={`px-3 h-7 text-xs font-semibold rounded-md transition-colors ${
                  filterActive === val
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {meta && (
            <span className="text-xs text-gray-400 ml-auto">
              {meta.total} total
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Nama Dinas", "Kode", "Status", "Statistik", "Aksi"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider ${i === 4 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : dinas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-sm bg-gray-100 flex items-center justify-center">
                        <Building2 size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm font-medium">Tidak ada data dinas</p>
                      <p className="text-gray-400 text-xs">Mulai tambah dinas menggunakan tombol di atas.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                dinas.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-gray-900 text-sm">{d.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                        {d.type && <span>{d.type}</span>}
                        {d.type && d.short && <span className="text-gray-300">•</span>}
                        {d.short && <span className="text-gray-500 font-mono">{d.short}</span>}
                        {d.wilayah && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-0.5"><MapPin size={9} />{d.wilayah}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-primary bg-primary/8 px-2 py-0.5 rounded border border-primary/15">
                        {d.code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        d.isActive
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${d.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {d.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-gray-300" />
                          <span className="font-semibold text-gray-600">{d._count?.cabang ?? 0}</span> Cabang
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag size={12} className="text-gray-300" />
                          <span className="font-semibold text-gray-600">{d._count?.kategori ?? 0}</span> Kategori
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openDrawer(d)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-sm transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(d)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
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
            <span className="text-xs text-gray-400">
              Halaman {page} dari {totalPages} &bull; {meta?.total ?? 0} data
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = page <= 3 ? i + 1 : i + page - 2;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 text-xs font-semibold rounded-sm transition-colors ${
                      p === page ? "bg-primary text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={closeDrawer}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-gray-200 z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                <div>
                  <h2 className="font-heading font-black text-base text-gray-900">
                    {editId ? "Edit Dinas" : "Tambah Dinas Baru"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {editId ? "Perbarui informasi instansi dinas." : "Isi detail instansi dinas baru."}
                  </p>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <form id="dinas-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Kode *</label>
                      <Input
                        placeholder="cth: DPU"
                        {...register("code")}
                        className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary h-9"
                      />
                      {errors.code && <p className="text-red-500 text-xs">{errors.code.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Singkatan</label>
                      <Input
                        placeholder="cth: DPUPR"
                        {...register("short")}
                        className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nama Dinas *</label>
                    <Input
                      placeholder="Dinas Pekerjaan Umum dan Penataan Ruang"
                      {...register("name")}
                      className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary h-9"
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tipe</label>
                      <Input
                        placeholder="cth: Daerah"
                        {...register("type")}
                        className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Level Wilayah</label>
                      <Input
                        placeholder="cth: Provinsi"
                        {...register("wilayah")}
                        className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Deskripsi</label>
                    <Textarea
                      placeholder="Uraian singkat tentang ruang lingkup dinas..."
                      {...register("description")}
                      className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary resize-none h-20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Prioritas Routing</label>
                    <Input
                      type="number"
                      placeholder="100"
                      {...register("routingPriority", { valueAsNumber: true })}
                      className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-primary h-9"
                    />
                    <p className="text-[11px] text-gray-400">Nilai lebih kecil = prioritas lebih tinggi.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setValue("isActive", !isActiveVal)}
                    className={`w-full flex items-center justify-between p-4 rounded-sm border transition-colors ${
                      isActiveVal
                        ? "bg-emerald-50 border-emerald-100"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-900">Status Aktif</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isActiveVal ? "Dinas ini aktif menerima laporan." : "Dinas ini dinonaktifkan."}
                      </p>
                    </div>
                    {isActiveVal
                      ? <ToggleRight size={28} className="text-emerald-500 shrink-0" />
                      : <ToggleLeft size={28} className="text-gray-400 shrink-0" />
                    }
                  </button>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0 bg-white">
                <Button
                  variant="ghost"
                  onClick={closeDrawer}
                  className="flex-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-sm"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  form="dinas-form"
                  disabled={isPending}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-sm font-bold"
                >
                  {isPending ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambah Dinas"}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-gray-200 rounded-sm shadow-2xl p-6 relative z-10 max-w-sm w-full mx-4"
            >
              <div className="w-12 h-12 rounded-sm bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-500 w-6 h-6" />
              </div>
              <h3 className="text-base font-heading font-black text-gray-900 mb-1">Hapus Dinas?</h3>
              <p className="text-sm text-gray-500 mb-1">
                <span className="text-gray-900 font-semibold">{deleteTarget.name}</span> akan dihapus permanen.
              </p>
              {((deleteTarget._count?.cabang ?? 0) > 0 || (deleteTarget._count?.kategori ?? 0) > 0) ? (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-sm text-xs text-amber-700">
                  <p className="font-bold mb-1">Tidak dapat dihapus!</p>
                  <p>Masih memiliki <strong>{deleteTarget._count?.cabang ?? 0} cabang</strong> dan <strong>{deleteTarget._count?.kategori ?? 0} kategori</strong>. Hapus relasi terlebih dahulu.</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-2">Tindakan ini tidak bisa dibatalkan.</p>
              )}
              <div className="flex gap-3 mt-5">
                <Button
                  variant="ghost"
                  className="flex-1 rounded-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setDeleteTarget(null)}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1 rounded-sm bg-red-500 hover:bg-red-600 text-white font-bold"
                  onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  disabled={
                    deleteMutation.isPending ||
                    (deleteTarget._count?.cabang ?? 0) > 0 ||
                    (deleteTarget._count?.kategori ?? 0) > 0
                  }
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
