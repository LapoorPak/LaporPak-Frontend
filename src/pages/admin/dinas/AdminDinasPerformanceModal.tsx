import { useEffect, useRef, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Star,
  TimerReset,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import type { Dinas } from "@/types/admin";
import type { AgencyPerformanceMetrics } from "@/types/dashboard";
import type { ReportLocation, ReportStatus } from "@/types/reports";

type AdminDinasPerformanceModalProps = {
  dinas: Dinas;
  reports: ReportLocation[];
  performance?: AgencyPerformanceMetrics | null;
  scopeLabel?: "dinas" | "cabang";
  title?: string;
  subtitle?: string;
  onClose: () => void;
};

const STATUS_META: Record<
  Exclude<ReportStatus, "rejected">,
  { label: string; color: string }
> = {
  pending: { label: "Baru", color: "#f59e0b" },
  verified: { label: "Terverifikasi", color: "#6366f1" },
  in_progress: { label: "Proses", color: "#0ea5e9" },
  clarification_requested: { label: "Klarifikasi", color: "#a855f7" },
  resolved: { label: "Selesai", color: "#10b981" },
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function getResolvedTime(report: ReportLocation) {
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

function formatDuration(hours: number | null | undefined) {
  if (hours === null || hours === undefined) return "0 jam";
  if (hours < 24) return `${Math.max(1, Math.round(hours))} jam`;

  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);

  return remainingHours > 0 ? `${days}h ${remainingHours}j` : `${days} hari`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(date: Date) {
  return `${MONTH_LABELS[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`;
}

function buildMonthlyData(reports: ReportLocation[]) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: getMonthKey(date),
      label: getMonthLabel(date),
      masuk: 0,
      selesai: 0,
      aktif: 0,
    };
  });
  const monthByKey = new Map(months.map((month) => [month.key, month]));

  reports.forEach((report) => {
    const createdAt = new Date(report.createdAt);
    const createdMonth = Number.isNaN(createdAt.getTime())
      ? null
      : monthByKey.get(getMonthKey(createdAt));

    if (createdMonth) {
      createdMonth.masuk += 1;
      if (report.status !== "resolved" && report.status !== "rejected") {
        createdMonth.aktif += 1;
      }
    }

    if (report.status !== "resolved") return;
    const resolvedTime = getResolvedTime(report);
    if (!resolvedTime) return;

    const resolvedAt = new Date(resolvedTime);
    const resolvedMonth = monthByKey.get(getMonthKey(resolvedAt));
    if (resolvedMonth) resolvedMonth.selesai += 1;
  });

  return months;
}

export function AdminDinasPerformanceModal({
  dinas,
  reports,
  performance,
  scopeLabel = "dinas",
  title,
  subtitle,
  onClose,
}: AdminDinasPerformanceModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const targetTitle = title ?? dinas.name;
  const targetSubtitle = subtitle;
  const scopeText = scopeLabel === "cabang" ? "cabang" : "dinas";
  const snapshotTime = Date.now();
  const relevantReports = reports.filter((report) => report.status !== "rejected");
  const activeReports = relevantReports.filter(
    (report) => report.status !== "resolved",
  );
  const resolvedReports = relevantReports.filter(
    (report) => report.status === "resolved",
  );
  const activeAges = activeReports
    .map((report) => ({
      report,
      hours: getHoursBetween(report.createdAt, snapshotTime),
    }))
    .filter((item): item is { report: ReportLocation; hours: number } => (
      item.hours !== null
    ));
  const ratings = resolvedReports
    .map((report) => report.averageRating ?? report.rating?.score)
    .filter((score): score is number => typeof score === "number");
  const averageRating =
    performance?.averageRating ??
    (ratings.length > 0
      ? ratings.reduce((sum, score) => sum + score, 0) / ratings.length
      : null);
  const completionRate =
    performance?.completionRate ??
    (relevantReports.length > 0
      ? Math.round((resolvedReports.length / relevantReports.length) * 100)
      : 0);
  const averageResolutionHours = performance?.averageResolutionHours ?? null;
  const longestOpenHours = performance?.longestOpenHours ?? null;
  const monthlyData = buildMonthlyData(relevantReports);
  const statusData = Object.entries(STATUS_META).map(([status, meta]) => ({
    status,
    name: meta.label,
    value: relevantReports.filter((report) => report.status === status).length,
    color: meta.color,
  }));
  const ageData = [
    {
      name: "<7 hari",
      value: activeAges.filter((item) => item.hours <= 24 * 7).length,
      fill: "#38bdf8",
    },
    {
      name: "7-14 hari",
      value: activeAges.filter(
        (item) => item.hours > 24 * 7 && item.hours <= 24 * 14,
      ).length,
      fill: "#f59e0b",
    },
    {
      name: ">14 hari",
      value: activeAges.filter((item) => item.hours > 24 * 14).length,
      fill: "#fb7185",
    },
  ];
  const priorityReports = activeAges
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 6);
  const riskLevel =
    performance?.stale && performance.stale > 0
      ? "Perlu perhatian"
      : performance?.overdue && performance.overdue > 0
        ? "Pantau SLA"
        : "Stabil";

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target)) return;

      onClose();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div
        ref={panelRef}
        className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-sm border border-gray-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.32)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
              Analitik Performa Admin
            </p>
            <h2 className="mt-1 truncate text-lg font-black text-gray-950">
              {targetTitle}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold text-gray-400">
              {targetSubtitle ? (
                <span className="max-w-[620px] truncate">{targetSubtitle}</span>
              ) : (
                <>
                  <span>{dinas.short ?? dinas.code}</span>
                  {dinas.wilayah && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-gray-300" />
                      <span className="max-w-[560px] truncate">{dinas.wilayah}</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                riskLevel === "Stabil"
                  ? "bg-emerald-50 text-emerald-700"
                  : riskLevel === "Pantau SLA"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-rose-50 text-rose-700"
              }`}
            >
              {riskLevel}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-sm bg-gray-100 text-gray-500 transition hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              aria-label="Tutup performa admin"
            >
              <X size={17} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50/70 p-4">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <KpiCard
              icon={Activity}
              label="Total"
              value={relevantReports.length}
              helper="laporan valid"
              tooltip={`Total laporan ${scopeText} ini, tidak termasuk laporan ditolak.`}
              color="text-indigo-600"
              bg="bg-indigo-50"
            />
            <KpiCard
              icon={CheckCircle2}
              label="Selesai"
              value={resolvedReports.length}
              helper={`${completionRate}% selesai`}
              tooltip="Jumlah laporan yang sudah diselesaikan dibanding total laporan valid."
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
            <KpiCard
              icon={Clock}
              label="Aktif"
              value={activeReports.length}
              helper="belum selesai"
              tooltip="Laporan yang masih berjalan dan belum dinyatakan selesai."
              color="text-sky-600"
              bg="bg-sky-50"
            />
            <KpiCard
              icon={AlertTriangle}
              label="Terlambat"
              value={performance?.overdue ?? 0}
              helper=">7 hari"
              tooltip="Laporan aktif yang sudah berjalan lebih dari 7 hari."
              color="text-amber-600"
              bg="bg-amber-50"
            />
            <KpiCard
              icon={TimerReset}
              label="Mandek"
              value={performance?.stale ?? 0}
              helper=">14 hari"
              tooltip="Laporan aktif yang perlu perhatian khusus karena belum selesai lebih dari 14 hari."
              color="text-rose-600"
              bg="bg-rose-50"
            />
            <KpiCard
              icon={Star}
              label="Rating"
              value={averageRating === null ? "0/5" : `${averageRating.toFixed(1)}/5`}
              helper={`${performance?.ratingCount ?? ratings.length} rating`}
              tooltip={`Rata-rata rating warga untuk laporan ${scopeText} ini yang sudah selesai.`}
              color="text-orange-600"
              bg="bg-orange-50"
            />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_0.8fr]">
            <Panel
              title="Tren Laporan 6 Bulan"
              tooltip="Perbandingan laporan masuk, selesai, dan yang masih aktif per bulan."
            >
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="adminMasuk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="masuk" name="Masuk" stroke="#6366f1" strokeWidth={2.5} fill="url(#adminMasuk)" />
                  <Area type="monotone" dataKey="selesai" name="Selesai" stroke="#10b981" strokeWidth={2.5} fill="transparent" />
                  <Area type="monotone" dataKey="aktif" name="Aktif" stroke="#f59e0b" strokeWidth={2.5} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </Panel>

            <Panel
              title="Komposisi Status"
              tooltip={`Sebaran status laporan terbaru untuk ${scopeText} ini.`}
            >
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={86}
                    paddingAngle={2}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2">
                {statusData.map((item) => (
                  <div key={item.status} className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name}</span>
                    <span className="ml-auto text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
            <Panel
              title="Umur Laporan Aktif"
              tooltip="Mengelompokkan laporan aktif berdasarkan lama penanganan."
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Laporan" radius={[5, 5, 0, 0]}>
                    {ageData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel
              title="Laporan Prioritas Admin"
              tooltip="Daftar laporan aktif paling lama yang perlu dipantau admin."
            >
              <div className="overflow-hidden rounded-sm border border-gray-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <tr>
                      <th className="px-3 py-2">Laporan</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Umur</th>
                      <th className="px-3 py-2">Vote</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priorityReports.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-8 text-center font-bold text-gray-400">
                          Tidak ada laporan aktif.
                        </td>
                      </tr>
                    ) : (
                      priorityReports.map(({ report, hours }) => (
                        <tr key={report.id} className="border-t border-gray-100">
                          <td className="max-w-[260px] px-3 py-2">
                            <p className="truncate font-black text-gray-900">{report.title}</p>
                            <p className="mt-0.5 text-[10px] font-bold text-gray-400">
                              {formatDate(report.createdAt)}
                            </p>
                          </td>
                          <td className="px-3 py-2">
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-black text-gray-500">
                              {STATUS_META[report.status as Exclude<ReportStatus, "rejected">]?.label ?? report.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-black text-rose-600">
                            {formatDuration(hours)}
                          </td>
                          <td className="px-3 py-2 font-black text-gray-700">
                            {report.voteScore && report.voteScore > 0
                              ? `+${report.voteScore}`
                              : (report.voteScore ?? 0)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Insight
              label="Rata-rata selesai"
              value={formatDuration(averageResolutionHours)}
              helper="waktu penanganan laporan selesai"
            />
            <Insight
              label="Laporan aktif terlama"
              value={formatDuration(longestOpenHours)}
              helper="indikator potensi bottleneck"
            />
            <Insight
              label="Completion rate"
              value={`${completionRate}%`}
              helper="persentase penyelesaian dari total valid"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  helper,
  tooltip,
  color,
  bg,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  helper: string;
  tooltip: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-sm border border-gray-100 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${bg} ${color}`}>
          <Icon size={15} strokeWidth={2.5} />
        </span>
        <span className="truncate text-[10px] font-black uppercase tracking-widest text-gray-400">
          {label}
        </span>
        <HelpTooltip content={tooltip} align="right" className="ml-auto" />
      </div>
      <p className="truncate text-xl font-black text-gray-950">{value}</p>
      <p className="truncate text-[11px] font-bold text-gray-400">{helper}</p>
    </div>
  );
}

function Panel({
  title,
  tooltip,
  children,
}: {
  title: string;
  tooltip: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-sm border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          {title}
        </h3>
        <HelpTooltip content={tooltip} align="right" />
      </div>
      {children}
    </section>
  );
}

function Insight({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-sm border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-gray-950">{value}</p>
      <p className="mt-0.5 text-[11px] font-bold text-gray-400">{helper}</p>
    </div>
  );
}
