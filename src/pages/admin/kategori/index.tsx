import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useGetDinas,
  useGetKategori,
  useGetKategoriActivity,
  useCreateKategori,
  useUpdateKategori,
  useDeleteKategori,
} from "@/hooks/admin";
import { QUERY_KEYS } from "@/api/queryKeys";
import type { Kategori } from "@/types/admin";
import {
  Plus, Search, Clock, Edit2, Trash2, X, AlertTriangle,
  Activity, BarChart3, Tags, ToggleLeft, ToggleRight, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AdminPagination } from "@/components/ui/admin-pagination";
import { AdminMultiSelect, AdminSelect } from "@/components/ui/admin-select";
import { AdminSortHeader } from "@/components/ui/admin-sort-header";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";

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
const NONE_FILTER_VALUE = "__none";
const CATEGORY_STATUS_COLORS = ["#10b981", "#e5e7eb"];
const URGENCY_COLORS = [
  "bg-emerald-500", "bg-emerald-400", "bg-lime-400",
  "bg-yellow-400", "bg-amber-400", "bg-orange-400",
  "bg-orange-500", "bg-red-400", "bg-red-500", "bg-rose-600",
];

function areStringArraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;

  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
}

function getMultiFilterParam(values: string[], allValues: string[]) {
  if (allValues.length === 0 || values.length === allValues.length) return undefined;
  if (values.length === 0) return NONE_FILTER_VALUE;
  return values.join(",");
}

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

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="px-5 py-4"><div className="h-4 w-32 bg-gray-100 rounded mb-2" /><div className="flex gap-1"><div className="h-4 w-12 bg-gray-100 rounded-full" /><div className="h-4 w-16 bg-gray-100 rounded-full" /></div></td>
      <td className="px-5 py-4"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4 text-center"><div className="h-6 w-16 bg-gray-100 rounded mx-auto" /></td>
      <td className="px-5 py-4"><div className="h-4 w-10 bg-gray-100 rounded" /></td>
      <td className="px-5 py-4"><div className="h-5 w-14 bg-gray-100 rounded-full" /></td>
      <td className="px-5 py-4"><div className="h-5 w-14 bg-gray-100 rounded-full" /></td>
      <td className="px-5 py-4 text-right"><div className="h-6 w-14 bg-gray-100 rounded ml-auto" /></td>
    </tr>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>
      <div className="flex h-9 items-center truncate rounded-sm border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700">
        {value}
      </div>
    </div>
  );
}

export default function AdminKategoriPage() {
  const [search, setSearch] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [filterDinasIds, setFilterDinasIds] = useState<string[]>([]);
  const [draftFilterDinasIds, setDraftFilterDinasIds] = useState<string[]>([]);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [draftFilterActive, setDraftFilterActive] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc" | undefined>();
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedKategori, setSelectedKategori] = useState<Kategori | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Kategori | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState("");
  const hasInitializedDinasFilterRef = useRef(false);
  const queryClient = useQueryClient();

  const { data: dinasData } = useGetDinas({ limit: 1000 });
  const dinasFilterValues = dinasData?.data?.map((d) => d.id) ?? [];

  useEffect(() => {
    if (hasInitializedDinasFilterRef.current || dinasFilterValues.length === 0) {
      return;
    }

    hasInitializedDinasFilterRef.current = true;
    setFilterDinasIds(dinasFilterValues);
    setDraftFilterDinasIds(dinasFilterValues);
  }, [dinasFilterValues]);

  const { data, isLoading, isFetching } = useGetKategori(
    {
      search: search || undefined,
      dinasId: getMultiFilterParam(filterDinasIds, dinasFilterValues),
      isActive: filterActive,
      sortBy,
      sortDir,
      page,
      limit: LIMIT,
    },
    { placeholderData: (prev) => prev }
  );
  const { data: categoryActivityData, isLoading: isCategoryActivityLoading } =
    useGetKategoriActivity({
      search: search || undefined,
      dinasId: getMultiFilterParam(filterDinasIds, dinasFilterValues),
      isActive: filterActive,
    });

  const kategoriList = data?.data ?? [];
  const meta = data?.meta;
  const categoryActivity = categoryActivityData?.data;
  const totalPages = meta?.totalPages ?? 1;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, urgencyWeight: 50, slaHours: 24 },
  });
  const isActiveVal = watch("isActive");
  const urgencyVal = watch("urgencyWeight");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_KATEGORI] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_KATEGORI_ACTIVITY] });
  };

  const createMutation = useCreateKategori({
    onSuccess: () => { toast.success("Kategori berhasil ditambahkan"); invalidate(); closeDrawer(); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Gagal menambahkan"),
  });

  const updateMutation = useUpdateKategori({
    onSuccess: () => { toast.success("Kategori berhasil diperbarui"); invalidate(); closeDrawer(); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Gagal menyimpan"),
  });

  const deleteMutation = useDeleteKategori({
    onSuccess: () => {
      toast.success("Kategori berhasil dihapus");
      invalidate();
      if (deleteTarget?.id === selectedKategori?.id) setSelectedKategori(null);
      setDeleteTarget(null);
    },
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
  const dinasOptions = [
    ...(dinasData?.data?.map((d) => ({
      value: d.id,
      label: d.short ?? d.name,
    })) ?? []),
  ];
  const formDinasOptions = [
    { value: "", label: "Pilih Dinas" },
    ...(dinasData?.data?.map((d) => ({ value: d.id, label: d.name })) ?? []),
  ];
  const applyFilters = () => {
    setSearch(draftSearch.trim());
    setFilterDinasIds(draftFilterDinasIds);
    setFilterActive(draftFilterActive);
    setPage(1);
  };
  const hasUnappliedFilters =
    draftSearch.trim() !== search ||
    !areStringArraysEqual(draftFilterDinasIds, filterDinasIds) ||
    draftFilterActive !== filterActive;
  const isApplyingFilters = isFetching && !isLoading;
  const categoryStatusChartData = [
    {
      name: "Aktif",
      value: categoryActivity?.summary.activeCategories ?? 0,
    },
    {
      name: "Nonaktif",
      value: categoryActivity?.summary.inactiveCategories ?? 0,
    },
  ];
  const hasCategoryStatusChartData = categoryStatusChartData.some(
    (item) => item.value > 0,
  );
  const handleSort = (nextSortBy: string) => {
    setPage(1);

    if (sortBy !== nextSortBy) {
      setSortBy(nextSortBy);
      setSortDir("asc");
      return;
    }

    if (sortDir === "asc") {
      setSortDir("desc");
      return;
    }

    setSortBy(undefined);
    setSortDir(undefined);
  };

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

      <section className="rounded-sm border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch">
          <div className="shrink-0 xl:w-64">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">
              <Activity size={12} />
              Analytics Kategori
            </div>
            <h2 className="mt-2 text-sm font-black text-gray-950">
              Performa klasifikasi
            </h2>
            <p className="mt-0.5 text-xs font-medium text-gray-400">
              Mengikuti filter aktif di tabel.
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2 xl:grid-cols-2">
              {[
                { label: "Kategori", value: categoryActivity?.summary.totalCategories ?? 0 },
                { label: "Aktif", value: categoryActivity?.summary.activeCategories ?? 0 },
                { label: "Laporan", value: categoryActivity?.summary.totalReports ?? 0 },
                { label: "SLA Avg", value: `${categoryActivity?.summary.averageSlaHours ?? 0}j` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-sm border border-gray-100 bg-gray-50 px-3 py-2"
                >
                  <p className="truncate text-[9px] font-black uppercase tracking-widest text-gray-400">
                    {item.label}
                  </p>
                  <p className="mt-1 truncate text-base font-black text-gray-950">
                    {isCategoryActivityLoading ? "-" : item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid min-w-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)_minmax(200px,0.65fr)]">
            <div className="min-w-0 rounded-sm border border-gray-100 bg-gray-50 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-black text-gray-950">
                    Tren laporan
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">
                    30 hari terakhir
                  </p>
                </div>
                <Activity size={15} className="shrink-0 text-gray-400" />
              </div>
              <div className="h-[150px] min-w-0">
                {isCategoryActivityLoading ? (
                  <div className="h-full animate-pulse rounded-sm bg-white" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={categoryActivity?.series ?? []}
                      margin={{ top: 8, right: 8, bottom: 0, left: -24 }}
                    >
                      <XAxis
                        dataKey="label"
                        interval="preserveStartEnd"
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <ChartTooltip
                        cursor={{ stroke: "#e5e7eb" }}
                        contentStyle={{
                          borderRadius: 4,
                          borderColor: "#e5e7eb",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Total"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="resolved"
                        name="Selesai"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="min-w-0 rounded-sm border border-gray-100 bg-gray-50 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-black text-gray-950">
                    Top kategori
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">
                    Beban laporan
                  </p>
                </div>
                <BarChart3 size={15} className="shrink-0 text-gray-400" />
              </div>
              <div className="h-[150px] min-w-0">
                {isCategoryActivityLoading ? (
                  <div className="h-full animate-pulse rounded-sm bg-white" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(categoryActivity?.topByReports ?? []).slice(0, 5)}
                      layout="vertical"
                      margin={{ top: 6, right: 8, bottom: 0, left: 4 }}
                    >
                      <XAxis type="number" allowDecimals={false} hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={126}
                        tickFormatter={(value) =>
                          String(value).length > 20
                            ? `${String(value).slice(0, 20)}...`
                            : String(value)
                        }
                        tick={{ fontSize: 10, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <ChartTooltip
                        cursor={{ fill: "#ecfdf5" }}
                        contentStyle={{
                          borderRadius: 4,
                          borderColor: "#e5e7eb",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      />
                      <Bar
                        dataKey="totalReports"
                        name="Laporan"
                        fill="#10b981"
                        radius={[0, 4, 4, 0]}
                        barSize={12}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="min-w-0 rounded-sm border border-gray-100 bg-gray-50 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-black text-gray-950">
                    Status
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">
                    Aktif vs nonaktif
                  </p>
                </div>
                <Tags size={15} className="shrink-0 text-gray-400" />
              </div>
              <div className="grid h-[150px] min-w-0 grid-cols-[112px_minmax(0,1fr)] items-center gap-2">
                {isCategoryActivityLoading ? (
                  <div className="col-span-2 h-full animate-pulse rounded-sm bg-white" />
                ) : hasCategoryStatusChartData ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryStatusChartData}
                          cx="50%"
                          cy="50%"
                          dataKey="value"
                          innerRadius={34}
                          outerRadius={52}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {categoryStatusChartData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={CATEGORY_STATUS_COLORS[index % CATEGORY_STATUS_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <ChartTooltip
                          contentStyle={{
                            borderRadius: 4,
                            borderColor: "#e5e7eb",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {categoryStatusChartData.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between gap-2 text-[11px] font-bold">
                          <span className="inline-flex min-w-0 items-center gap-1.5 text-gray-600">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  CATEGORY_STATUS_COLORS[index % CATEGORY_STATUS_COLORS.length],
                              }}
                            />
                            <span className="truncate">{item.name}</span>
                          </span>
                          <span className="shrink-0 tabular-nums text-gray-900">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="col-span-2 text-center text-xs font-semibold text-gray-400">
                    Tidak ada data
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-5">
        {/* Table Card */}
        <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm lg:col-span-3">
          {/* Filter bar */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex flex-wrap gap-3 items-center bg-gray-50/80">
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                placeholder="Cari nama atau kode..."
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters();
              }}
              className="w-full pl-9 pr-3 h-9 bg-white border border-gray-200 text-gray-900 text-sm rounded-sm placeholder:text-gray-400 focus:outline-none focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 transition-colors"
            />
          </div>
          <AdminMultiSelect
            values={draftFilterDinasIds}
            onChange={setDraftFilterDinasIds}
            options={dinasOptions}
            placeholder="Pilih Dinas"
            allLabel="Semua Dinas"
            countLabel="Dinas"
            className="h-9"
          />
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-sm p-1">
            {[
              { label: "Semua", val: undefined },
              { label: "Aktif", val: true },
              { label: "Nonaktif", val: false },
            ].map(({ label, val }) => (
              <button
                key={label}
                onClick={() => setDraftFilterActive(val)}
                className={`px-3 h-7 text-xs font-semibold rounded-md transition-colors ${
                  draftFilterActive === val ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {meta && <span className="text-xs text-gray-400 ml-auto">{meta.total} total</span>}
          <Button
            type="button"
            onClick={applyFilters}
            disabled={!hasUnappliedFilters || isApplyingFilters}
            className="h-9 rounded-sm bg-gray-900 px-4 text-xs font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isApplyingFilters ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin" />
                Menerapkan...
              </span>
            ) : (
              "Apply"
            )}
          </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <AdminSortHeader label="Kategori" sortKey="name" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <AdminSortHeader label="Dinas" sortKey="dinas" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <AdminSortHeader label="SLA" sortKey="slaHours" sortBy={sortBy} sortDir={sortDir} align="center" className="text-center" onSort={handleSort} />
                <AdminSortHeader label="Urgency" sortKey="urgencyWeight" sortBy={sortBy} sortDir={sortDir} className="w-32" onSort={handleSort} />
                <AdminSortHeader label="Laporan" sortKey="laporan" sortBy={sortBy} sortDir={sortDir} align="center" className="text-center" onSort={handleSort} />
                <AdminSortHeader label="Status" sortKey="isActive" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <AdminSortHeader label="Aksi" align="right" />
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
                  <tr
                    key={k.id}
                    onClick={() => setSelectedKategori(k)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors group ${
                      selectedKategori?.id === k.id
                        ? "bg-primary/8 border-l-2 border-l-primary"
                        : "hover:bg-gray-50 border-l-2 border-l-transparent"
                    }`}
                  >
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDrawer(k);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-sm transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(k);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                          title="Hapus"
                        >
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

          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={meta?.total ?? 0}
            pageSize={LIMIT}
            itemLabel="kategori"
            onPageChange={setPage}
          />
        </div>

        <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm lg:sticky lg:top-4 lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedKategori ? (
              <motion.div
                key={selectedKategori.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3.5">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-gray-900">
                      {selectedKategori.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-primary">
                        {selectedKategori.code}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-bold ${
                          selectedKategori.isActive ? "text-emerald-600" : "text-gray-400"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${selectedKategori.isActive ? "bg-emerald-500" : "bg-gray-300"}`} />
                        {selectedKategori.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => openDrawer(selectedKategori)}
                      className="rounded-sm p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(selectedKategori)}
                      className="rounded-sm p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-5 px-5 py-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Induk Dinas
                    </label>
                    <div className="flex min-h-9 items-center rounded-sm border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700">
                      {selectedKategori.dinas?.name ?? "—"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <DetailField
                      label="SLA"
                      value={selectedKategori.slaHours ? `${selectedKategori.slaHours} jam` : "—"}
                    />
                    <DetailField
                      label="Laporan"
                      value={`${selectedKategori._count?.laporan ?? 0} laporan`}
                    />
                  </div>

                  <div className="rounded-sm border border-gray-200 bg-gray-50 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-bold uppercase tracking-wide text-gray-500">
                        Urgency
                      </span>
                      <span className="font-black text-gray-900">
                        {selectedKategori.urgencyWeight}/100
                      </span>
                    </div>
                    <UrgencyBar value={selectedKategori.urgencyWeight} max={100} />
                    <p className="mt-2 text-[11px] font-bold text-gray-400">
                      Dipakai untuk membantu prioritas routing dan penanganan.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Deskripsi
                    </label>
                    <div className="min-h-[72px] rounded-sm border border-gray-200 bg-gray-50 px-3 py-2 text-sm leading-relaxed text-gray-700">
                      {selectedKategori.description ?? "Belum ada deskripsi."}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Kata Kunci
                    </label>
                    {(selectedKategori.keywords?.length ?? 0) > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedKategori.keywords!.map((kw) => (
                          <span
                            key={kw}
                            className="rounded-sm border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-sm border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-xs font-semibold text-gray-400">
                        Belum ada kata kunci.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex min-h-[340px] flex-col items-center justify-center p-8 text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-sm border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                  <Tags size={24} className="text-gray-300" />
                </div>
                <h3 className="mb-1.5 text-sm font-bold text-gray-500">Pilih kategori</h3>
                <p className="max-w-[190px] text-xs leading-relaxed text-gray-400">
                  Klik baris di tabel untuk melihat detail klasifikasi.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Induk Dinas <span className="text-[#db2744]" aria-hidden="true">*</span>
                    </label>
                    <AdminSelect value={watch("dinasId") ?? ""} onChange={(value) => setValue("dinasId", value)} options={formDinasOptions} className="h-9 w-full" />
                    {errors.dinasId && <p className="text-red-500 text-xs">{errors.dinasId.message as string}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Kode <span className="text-[#db2744]" aria-hidden="true">*</span>
                      </label>
                      <Input placeholder="INF" {...register("code")} className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 h-9 font-mono uppercase" />
                      {errors.code && <p className="text-red-500 text-xs">{errors.code.message}</p>}
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Nama Kategori <span className="text-[#db2744]" aria-hidden="true">*</span>
                      </label>
                      <Input placeholder="Infrastruktur & Jalan" {...register("name")} className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 h-9" />
                      {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Deskripsi</label>
                    <Textarea placeholder="Laporan terkait infrastruktur jalan, jembatan, drainase..." {...register("description")} className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 resize-none h-16" />
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
                      <Input type="number" placeholder="24" {...register("slaHours", { setValueAs: (v) => v === "" || v == null ? null : Number(v) })} className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Bobot Urgency (1-100) <span className="text-[#db2744]" aria-hidden="true">*</span>
                      </label>
                      <Input type="number" min="1" max="100" {...register("urgencyWeight", { valueAsNumber: true })} className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 h-9" />
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
