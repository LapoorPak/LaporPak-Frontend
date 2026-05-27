import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useGetDinas,
  useGetDinasActivity,
  useGetCabang,
  useGetAdminLaporan,
  useCreateDinas,
  useUpdateDinas,
  useDeleteDinas,
} from "@/hooks/admin";
import { QUERY_KEYS } from "@/api/queryKeys";
import type { AdminLaporan, Cabang, Dinas } from "@/types/admin";
import type { AgencyPerformanceMetrics } from "@/types/dashboard";
import type { ReportLocation } from "@/types/reports";
import { AdminDinasPerformanceModal } from "./AdminDinasPerformanceModal";
import {
  Plus, Search, MapPin, Tag, Edit2, Trash2, X, AlertTriangle,
  Activity, Building2, ToggleLeft, ToggleRight, BarChart3, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AdminPagination } from "@/components/ui/admin-pagination";
import { AdminSortHeader } from "@/components/ui/admin-sort-header";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";

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

function getErrorMessage(error: unknown, fallback: string) {
  const responseError = error as {
    response?: { data?: { message?: string } };
  };

  return responseError.response?.data?.message ?? fallback;
}

function getReportResolvedTime(report: ReportLocation) {
  const resolvedTimeline = report.timeline?.find(
    (item) => item.status === "resolved",
  );
  const value = resolvedTimeline?.createdAt || report.updatedAt;
  const time = new Date(value).getTime();

  return Number.isNaN(time) ? null : time;
}

function getHoursBetween(start: string, endTime: number) {
  const startTime = new Date(start).getTime();
  if (Number.isNaN(startTime) || endTime < startTime) return null;

  return (endTime - startTime) / (1000 * 60 * 60);
}

function getAgencyPerformance(
  reports: ReportLocation[],
  snapshotTime: number,
): AgencyPerformanceMetrics {
  const relevantReports = reports.filter((report) => report.status !== "rejected");
  const resolvedReports = relevantReports.filter(
    (report) => report.status === "resolved",
  );
  const activeReports = relevantReports.filter(
    (report) => report.status !== "resolved",
  );
  const ratedReports = resolvedReports.filter(
    (report) => typeof report.rating?.score === "number",
  );
  const activeAges = activeReports
    .map((report) => getHoursBetween(report.createdAt, snapshotTime))
    .filter((hours): hours is number => hours !== null);
  const resolutionHours = resolvedReports
    .map((report) => {
      const resolvedTime = getReportResolvedTime(report);
      return resolvedTime ? getHoursBetween(report.createdAt, resolvedTime) : null;
    })
    .filter((hours): hours is number => hours !== null);
  const totalRating = ratedReports.reduce(
    (sum, report) => sum + (report.rating?.score ?? 0),
    0,
  );

  return {
    total: relevantReports.length,
    resolved: resolvedReports.length,
    active: activeReports.length,
    overdue: activeAges.filter((hours) => hours > 24 * 7).length,
    stale: activeAges.filter((hours) => hours > 24 * 14).length,
    averageRating:
      ratedReports.length > 0 ? totalRating / ratedReports.length : null,
    ratingCount: ratedReports.length,
    completionRate:
      relevantReports.length > 0
        ? Math.round((resolvedReports.length / relevantReports.length) * 100)
        : 0,
    averageResolutionHours:
      resolutionHours.length > 0
        ? resolutionHours.reduce((sum, hours) => sum + hours, 0) /
          resolutionHours.length
        : null,
    longestOpenHours:
      activeAges.length > 0 ? Math.max(...activeAges) : null,
  };
}

function toReportLocation(report: AdminLaporan, dinas: Dinas): ReportLocation {
  return {
    id: report.id,
    title: report.title,
    description: report.description,
    lat: report.latitude,
    lng: report.longitude,
    status: report.status,
    routingStatus: report.routingStatus,
    createdAt: report.createdAt,
    updatedAt: report.resolvedAt ?? report.updatedAt,
    kategori: report.kategori
      ? {
          id: report.kategori.id,
          code: report.kategori.code,
          name: report.kategori.name,
          dinas: {
            id: dinas.id,
            code: dinas.code,
            type: dinas.type ?? dinas.code,
            name: dinas.name,
          },
        }
      : null,
    dinas: {
      id: dinas.id,
      code: dinas.code,
      type: dinas.type ?? dinas.code,
      name: dinas.name,
    },
    cabangDinas: report.cabangDinas,
    ownership: "other",
    agencyNote: report.agencyNote,
    resolutionNote: report.resolutionNote,
    resolutionImages: [],
    assignedTo: report.assignedTo
      ? { id: report.assignedTo.id, name: report.assignedTo.name }
      : null,
    createdBy: report.createdBy
      ? { id: report.createdBy.id, name: report.createdBy.name }
      : null,
    upvotes: report.upvotes ?? 0,
    downvotes: report.downvotes ?? 0,
    voteScore: report.voteScore ?? 0,
    myVote: null,
    rating: report.rating ?? null,
    images: report.images,
    timeline: report.resolvedAt
      ? [
          {
            id: `${report.id}-resolved`,
            status: "resolved",
            note: report.resolutionNote,
            images: [],
            actorRole: "admin",
            createdAt: report.resolvedAt,
          },
        ]
      : [],
  };
}

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

export default function AdminDinasPage() {
  const [search, setSearch] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [draftFilterActive, setDraftFilterActive] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc" | undefined>();
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedDinas, setSelectedDinas] = useState<Dinas | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dinas | null>(null);
  const [performanceTarget, setPerformanceTarget] = useState<Dinas | null>(null);
  const [performanceSnapshotTime] = useState(() => Date.now());
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useGetDinas(
    { search: search || undefined, isActive: filterActive, sortBy, sortDir, page, limit: LIMIT },
    { placeholderData: (prev) => prev }
  );
  const { data: dinasActivityData, isLoading: isDinasActivityLoading } =
    useGetDinasActivity({
      search: search || undefined,
      isActive: filterActive,
    });
  const { data: allCabangData } = useGetCabang({ limit: 1000 });
  const { data: allLaporanData } = useGetAdminLaporan({ limit: 1000 });

  const dinas = data?.data ?? [];
  const dinasActivity = dinasActivityData?.data;
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const cabangById = useMemo(
    () =>
      new Map(
        (allCabangData?.data ?? []).map((cabang) => [cabang.id, cabang] as const),
      ),
    [allCabangData?.data],
  );
  const selectedPerformanceReports = useMemo(() => {
    if (!performanceTarget) return [];

    return (allLaporanData?.data ?? [])
      .filter((report) => {
        const assignedCabang: Cabang | undefined = report.cabangDinas?.id
          ? cabangById.get(report.cabangDinas.id)
          : undefined;

        if (assignedCabang) {
          return assignedCabang.dinasId === performanceTarget.id;
        }

        return report.kategori?.dinas?.id === performanceTarget.id;
      })
      .map((report) => toReportLocation(report, performanceTarget));
  }, [allLaporanData?.data, cabangById, performanceTarget]);
  const selectedPerformanceMetrics = useMemo(
    () =>
      performanceTarget
        ? getAgencyPerformance(selectedPerformanceReports, performanceSnapshotTime)
        : null,
    [performanceSnapshotTime, performanceTarget, selectedPerformanceReports],
  );

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, routingPriority: 100 },
  });
  const isActiveVal = useWatch({ control, name: "isActive" });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_DINAS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_DINAS_ACTIVITY] });
  };

  const createMutation = useCreateDinas({
    onSuccess: () => { toast.success("Dinas berhasil ditambahkan"); invalidate(); closeDrawer(); },
    onError: (e) => toast.error(getErrorMessage(e, "Gagal menambahkan")),
  });

  const updateMutation = useUpdateDinas({
    onSuccess: () => { toast.success("Dinas berhasil diperbarui"); invalidate(); closeDrawer(); },
    onError: (e) => toast.error(getErrorMessage(e, "Gagal menyimpan")),
  });

  const deleteMutation = useDeleteDinas({
    onSuccess: () => {
      toast.success("Dinas berhasil dihapus");
      invalidate();
      if (deleteTarget?.id === selectedDinas?.id) setSelectedDinas(null);
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(getErrorMessage(e, "Gagal menghapus. Pastikan tidak ada relasi.")),
  });

  const openDrawer = (d?: Dinas) => {
    reset({ isActive: true, routingPriority: 100 });
    setEditId(null);
    if (d) {
      setEditId(d.id);
      reset({
        code: d.code,
        name: d.name,
        type: d.type,
        short: d.short,
        wilayah: d.wilayah,
        description: d.description,
        isActive: d.isActive,
        routingPriority: d.routingPriority,
      });
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => { setIsDrawerOpen(false); reset(); setEditId(null); };

  const onSubmit = (values: FormValues) => {
    if (editId) updateMutation.mutate({ id: editId, data: values });
    else createMutation.mutate(values);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const applyFilters = () => {
    setSearch(draftSearch.trim());
    setFilterActive(draftFilterActive);
    setPage(1);
  };
  const hasUnappliedFilters =
    draftSearch.trim() !== search || draftFilterActive !== filterActive;
  const isApplyingFilters = isFetching && !isLoading;
  const formatResolution = (hours: number) =>
    hours >= 24 ? `${Math.round(hours / 24)} hr` : `${hours} j`;
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

      <section className="rounded-sm border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch">
          <div className="shrink-0 xl:w-64">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600">
              <Activity size={12} />
              Analytics Dinas
            </div>
            <h2 className="mt-2 text-sm font-black text-gray-950">
              Ringkasan instansi
            </h2>
            <p className="mt-0.5 text-xs font-medium text-gray-400">
              Mengikuti filter pencarian dan status aktif.
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2 xl:grid-cols-2">
              {[
                { label: "Dinas", value: dinasActivity?.summary.totalDinas ?? 0 },
                { label: "Aktif", value: dinasActivity?.summary.activeDinas ?? 0 },
                { label: "Laporan", value: dinasActivity?.summary.totalReports ?? 0 },
                {
                  label: "Resolusi",
                  value: formatResolution(dinasActivity?.summary.averageResolutionHours ?? 0),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-sm border border-gray-100 bg-gray-50 px-3 py-2"
                >
                  <p className="truncate text-[9px] font-black uppercase tracking-widest text-gray-400">
                    {item.label}
                  </p>
                  <p className="mt-1 truncate text-base font-black text-gray-950">
                    {isDinasActivityLoading ? "-" : item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid min-w-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)_minmax(260px,0.75fr)]">
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
                {isDinasActivityLoading ? (
                  <div className="h-full animate-pulse rounded-sm bg-white" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dinasActivity?.series ?? []}
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
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="resolved"
                        name="Selesai"
                        stroke="#10b981"
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
                    Top dinas
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">
                    Beban laporan
                  </p>
                </div>
                <BarChart3 size={15} className="shrink-0 text-gray-400" />
              </div>
              <div className="h-[150px] min-w-0">
                {isDinasActivityLoading ? (
                  <div className="h-full animate-pulse rounded-sm bg-white" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(dinasActivity?.topByReports ?? []).slice(0, 5)}
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
                        cursor={{ fill: "#eff6ff" }}
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
                        fill="#2563eb"
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
                    Coverage
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">
                    Cabang vs kategori
                  </p>
                </div>
                <Building2 size={15} className="shrink-0 text-gray-400" />
              </div>
              <div className="h-[150px] min-w-0">
                {isDinasActivityLoading ? (
                  <div className="h-full animate-pulse rounded-sm bg-white" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(dinasActivity?.coverage ?? []).slice(0, 5)}
                      margin={{ top: 8, right: 4, bottom: 0, left: -26 }}
                    >
                      <XAxis
                        dataKey="short"
                        tickFormatter={(value, index) => {
                          const item = dinasActivity?.coverage?.[index];
                          return value || item?.code || "";
                        }}
                        tick={{ fontSize: 10, fill: "#6b7280" }}
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
                        cursor={{ fill: "#f3f4f6" }}
                        contentStyle={{
                          borderRadius: 4,
                          borderColor: "#e5e7eb",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      />
                      <Bar
                        dataKey="totalBranches"
                        name="Cabang"
                        fill="#111827"
                        radius={[4, 4, 0, 0]}
                        barSize={12}
                      />
                      <Bar
                        dataKey="totalCategories"
                        name="Kategori"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        barSize={12}
                      />
                    </BarChart>
                  </ResponsiveContainer>
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
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                placeholder="Cari dinas..."
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters();
              }}
              className="w-full pl-9 pr-3 h-9 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-sm placeholder:text-gray-400 focus:outline-none focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 transition-colors"
            />
          </div>
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
                  draftFilterActive === val
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
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
            <table className="w-full min-w-[760px] text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <AdminSortHeader label="Nama Dinas" sortKey="name" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <AdminSortHeader label="Kode" sortKey="code" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <AdminSortHeader label="Status" sortKey="isActive" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <AdminSortHeader label="Statistik" sortKey="cabang" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <AdminSortHeader label="Aksi" align="right" />
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
                    onClick={() => setSelectedDinas(d)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors group ${
                      selectedDinas?.id === d.id
                        ? "bg-primary/8 border-l-2 border-l-primary"
                        : "hover:bg-gray-50 border-l-2 border-l-transparent"
                    }`}
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
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPerformanceTarget(d);
                          }}
                          className="inline-flex h-7 items-center gap-1.5 rounded-sm bg-indigo-50 px-2.5 text-[11px] font-bold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white"
                          title="Detail performa"
                        >
                          <BarChart3 size={13} strokeWidth={2.5} />
                          <span>Performa</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDrawer(d);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-sm transition-colors opacity-0 group-hover:opacity-100"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(d);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors opacity-0 group-hover:opacity-100"
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
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={meta?.total ?? 0}
            pageSize={LIMIT}
            itemLabel="dinas"
            onPageChange={setPage}
          />
        </div>

        <div className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm lg:sticky lg:top-4 lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedDinas ? (
              <motion.div
                key={selectedDinas.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3.5">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-gray-900">
                      {selectedDinas.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="rounded border border-primary/15 bg-primary/8 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                        {selectedDinas.code}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-bold ${
                          selectedDinas.isActive ? "text-emerald-600" : "text-gray-400"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${selectedDinas.isActive ? "bg-emerald-500" : "bg-gray-300"}`} />
                        {selectedDinas.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => openDrawer(selectedDinas)}
                      className="rounded-sm p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(selectedDinas)}
                      className="rounded-sm p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-5 px-5 py-5">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailField label="Singkatan" value={selectedDinas.short ?? "—"} />
                    <DetailField label="Tipe" value={selectedDinas.type ?? "—"} />
                    <DetailField label="Wilayah" value={selectedDinas.wilayah ?? "—"} />
                    <DetailField label="Prioritas" value={selectedDinas.routingPriority} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-sm border border-gray-200 bg-gray-50 p-3">
                      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-gray-400">
                        <MapPin size={12} />
                        Cabang
                      </div>
                      <p className="text-lg font-black text-gray-950">
                        {selectedDinas._count?.cabang ?? 0}
                      </p>
                      <p className="text-[11px] font-bold text-gray-400">unit terdaftar</p>
                    </div>
                    <div className="rounded-sm border border-gray-200 bg-gray-50 p-3">
                      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-gray-400">
                        <Tag size={12} />
                        Kategori
                      </div>
                      <p className="text-lg font-black text-gray-950">
                        {selectedDinas._count?.kategori ?? 0}
                      </p>
                      <p className="text-[11px] font-bold text-gray-400">klasifikasi laporan</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Deskripsi
                    </label>
                    <div className="min-h-[76px] rounded-sm border border-gray-200 bg-gray-50 px-3 py-2 text-sm leading-relaxed text-gray-700">
                      {selectedDinas.description ?? "Belum ada deskripsi."}
                    </div>
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
                  <Building2 size={24} className="text-gray-300" />
                </div>
                <h3 className="mb-1.5 text-sm font-bold text-gray-500">Pilih dinas</h3>
                <p className="max-w-[190px] text-xs leading-relaxed text-gray-400">
                  Klik baris di tabel untuk melihat detail instansi.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {performanceTarget && (
        <AdminDinasPerformanceModal
          dinas={performanceTarget}
          reports={selectedPerformanceReports}
          performance={selectedPerformanceMetrics}
          onClose={() => setPerformanceTarget(null)}
        />
      )}

      {/* ── Slide-over Drawer ── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
              onClick={closeDrawer}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-gray-200 z-[70] flex flex-col shadow-2xl"
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
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Kode <span className="text-[#db2744]" aria-hidden="true">*</span>
                      </label>
                      <Input
                        placeholder="cth: DPU"
                        {...register("code")}
                        className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 h-9"
                      />
                      {errors.code && <p className="text-red-500 text-xs">{errors.code.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Singkatan</label>
                      <Input
                        placeholder="cth: DPUPR"
                        {...register("short")}
                        className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Nama Dinas <span className="text-[#db2744]" aria-hidden="true">*</span>
                    </label>
                    <Input
                      placeholder="Dinas Pekerjaan Umum dan Penataan Ruang"
                      {...register("name")}
                      className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 h-9"
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tipe</label>
                      <Input
                        placeholder="cth: Daerah"
                        {...register("type")}
                        className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Level Wilayah</label>
                      <Input
                        placeholder="cth: Provinsi"
                        {...register("wilayah")}
                        className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Deskripsi</label>
                    <Textarea
                      placeholder="Uraian singkat tentang ruang lingkup dinas..."
                      {...register("description")}
                      className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 resize-none h-20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Prioritas Routing <span className="text-[#db2744]" aria-hidden="true">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="100"
                      {...register("routingPriority", { valueAsNumber: true })}
                      className="bg-white border-gray-200 text-gray-900 rounded-sm focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 h-9"
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
