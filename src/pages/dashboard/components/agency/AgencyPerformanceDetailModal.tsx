import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  X,
  Star,
  CheckCircle2,
  Activity,
  TimerReset,
  Clock,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AgencyLocation } from "@/types/agencies";
import type { AgencyPerformanceMetrics } from "@/types/dashboard";
import type { ReportLocation, ReportStatus } from "@/types/reports";
import { HelpTooltip } from "@/components/ui/help-tooltip";

type AgencyPerformanceDetailModalProps = {
  agency: AgencyLocation;
  reports: ReportLocation[];
  performance?: AgencyPerformanceMetrics | null;
  onClose: () => void;
  onFocusReport?: (report: ReportLocation) => void;
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
const MOBILE_SHEET_SNAP_POINTS = [52, 72, 88];
const MOBILE_SHEET_MIN_HEIGHT = 36;
const MOBILE_SHEET_MAX_HEIGHT = 92;
const MOBILE_SHEET_CLOSE_HEIGHT = 42;
const MOBILE_SHEET_CLOSE_VELOCITY = 0.65;

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

function formatDuration(hours: number | null | undefined) {
  if (hours === null || hours === undefined) return "0 jam";
  if (hours < 24) return `${Math.max(1, Math.round(hours))} jam`;

  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);

  return remainingHours > 0 ? `${days}h ${remainingHours}j` : `${days} hari`;
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
    };
  });
  const monthByKey = new Map(months.map((month) => [month.key, month]));

  reports.forEach((report) => {
    const createdAt = new Date(report.createdAt);
    if (!Number.isNaN(createdAt.getTime())) {
      const month = monthByKey.get(getMonthKey(createdAt));
      if (month) month.masuk += 1;
    }

    if (report.status !== "resolved") return;
    const resolvedTime = getReportResolvedTime(report);
    if (!resolvedTime) return;

    const resolvedAt = new Date(resolvedTime);
    const month = monthByKey.get(getMonthKey(resolvedAt));
    if (month) month.selesai += 1;
  });

  return months;
}

function formatReportDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

function getNearestSheetSnap(height: number) {
  return MOBILE_SHEET_SNAP_POINTS.reduce((nearest, point) =>
    Math.abs(point - height) < Math.abs(nearest - height) ? point : nearest,
  );
}

export function AgencyPerformanceDetailModal({
  agency,
  reports,
  performance,
  onClose,
  onFocusReport,
}: AgencyPerformanceDetailModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const sheetResizeRef = useRef<{
    startY: number;
    startHeight: number;
    lastY: number;
    lastTime: number;
    velocityY: number;
  } | null>(null);
  const sheetResizeMovedRef = useRef(false);
  const [snapshotTime] = useState(() => Date.now());
  const [mobileSheetHeight, setMobileSheetHeight] = useState(88);
  const [isMobileSheetDragging, setIsMobileSheetDragging] = useState(false);
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
  const resolutionHours = resolvedReports
    .map((report) => {
      const resolvedTime = getReportResolvedTime(report);
      return resolvedTime ? getHoursBetween(report.createdAt, resolvedTime) : null;
    })
    .filter((hours): hours is number => hours !== null);
  const ratings = resolvedReports
    .map((report) => report.rating?.score)
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
  const averageResolutionHours =
    performance?.averageResolutionHours ??
    (resolutionHours.length > 0
      ? resolutionHours.reduce((sum, hours) => sum + hours, 0) /
        resolutionHours.length
      : null);
  const longestOpenHours =
    performance?.longestOpenHours ??
    (activeAges.length > 0 ? Math.max(...activeAges.map((item) => item.hours)) : null);
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
  const ratingData = [1, 2, 3, 4, 5].map((score) => ({
    name: `${score}`,
    value: ratings.filter((rating) => Math.ceil(rating) === score).length,
  }));
  const monthlyData = buildMonthlyData(relevantReports);
  const oldestActiveReports = activeAges
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5);

  useEffect(() => {
    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target)) return;

      onClose();
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown, true);
    };
  }, [onClose]);

  const startMobileSheetResize = (event: ReactPointerEvent) => {
    if (window.innerWidth >= 768) return;

    event.preventDefault();
    event.stopPropagation();
    sheetResizeMovedRef.current = false;
    setIsMobileSheetDragging(true);
    sheetResizeRef.current = {
      startY: event.clientY,
      startHeight: mobileSheetHeight,
      lastY: event.clientY,
      lastTime: globalThis.performance.now(),
      velocityY: 0,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const resizeState = sheetResizeRef.current;
      if (!resizeState) return;

      const deltaY = resizeState.startY - moveEvent.clientY;
      if (Math.abs(deltaY) > 2) {
        sheetResizeMovedRef.current = true;
      }

      const now = globalThis.performance.now();
      const elapsed = Math.max(1, now - resizeState.lastTime);
      resizeState.velocityY = (moveEvent.clientY - resizeState.lastY) / elapsed;
      resizeState.lastY = moveEvent.clientY;
      resizeState.lastTime = now;

      const nextHeight =
        resizeState.startHeight + (deltaY / window.innerHeight) * 100;
      setMobileSheetHeight(
        Math.min(
          MOBILE_SHEET_MAX_HEIGHT,
          Math.max(MOBILE_SHEET_MIN_HEIGHT, nextHeight),
        ),
      );
    };

    const handlePointerUp = () => {
      const resizeState = sheetResizeRef.current;
      sheetResizeRef.current = null;
      setIsMobileSheetDragging(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);

      if (!resizeState) return;

      setMobileSheetHeight((currentHeight) => {
        const shouldClose =
          currentHeight <= MOBILE_SHEET_CLOSE_HEIGHT ||
          (resizeState.velocityY > MOBILE_SHEET_CLOSE_VELOCITY &&
            currentHeight < MOBILE_SHEET_SNAP_POINTS[1]);

        if (shouldClose) {
          window.requestAnimationFrame(onClose);
          return MOBILE_SHEET_SNAP_POINTS[1];
        }

        return getNearestSheetSnap(currentHeight);
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/45 px-0 py-0 backdrop-blur-sm md:items-center md:px-3 md:py-4"
      onPointerDown={onClose}
    >
      <div
        ref={panelRef}
        className={`flex h-[var(--mobile-performance-sheet-height)] max-h-[92svh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_-20px_56px_rgba(15,23,42,0.28)] md:h-auto md:max-h-[92vh] md:rounded-sm md:shadow-[0_28px_90px_rgba(15,23,42,0.32)] ${
          isMobileSheetDragging ? "" : "transition-[height] duration-200 ease-out"
        }`}
        style={
          {
            "--mobile-performance-sheet-height": `${mobileSheetHeight}svh`,
          } as CSSProperties
        }
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => {
            if (sheetResizeMovedRef.current) return;
            setMobileSheetHeight((height) => (height > 80 ? 72 : 88));
          }}
          onPointerDown={startMobileSheetResize}
          className="flex touch-none justify-center bg-white pt-3 pb-1 cursor-grab active:cursor-grabbing md:hidden"
          aria-label={
            mobileSheetHeight > 80
              ? "Perkecil detail performa"
              : "Perbesar detail performa"
          }
        >
          <span className="h-1.5 w-12 rounded-full bg-gray-200" />
        </button>

        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 md:gap-4 md:px-5 md:py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
              Detail Performa Dinas
            </p>
            <h2 className="mt-1 truncate text-base font-black text-gray-950 md:text-lg">
              {agency.dinasName || agency.name}
            </h2>
            <p className="truncate text-xs font-bold text-gray-400">
              {agency.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-200 md:h-9 md:w-9"
            aria-label="Tutup detail performa"
          >
            <X size={17} strokeWidth={2.5} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 md:px-5 md:py-4">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
            <SummaryCard
              icon={Star}
              label="Rating"
              value={averageRating === null ? "0/5" : `${averageRating.toFixed(1)}/5`}
              helper={`${ratings.length} rating`}
              tooltip="Rata-rata penilaian warga dari laporan selesai yang sudah diberi rating."
              color="text-amber-600"
              bg="bg-amber-50"
            />
            <SummaryCard
              icon={CheckCircle2}
              label="Selesai"
              value={resolvedReports.length}
              helper={`${completionRate}% selesai`}
              tooltip="Jumlah laporan yang statusnya sudah selesai dibanding seluruh laporan dinas ini."
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
            <SummaryCard
              icon={Activity}
              label="Proses"
              value={activeReports.length}
              helper={`${activeAges.filter((item) => item.hours > 24 * 7).length} terlambat`}
              tooltip="Laporan aktif yang belum selesai. Terlambat berarti sudah berjalan lebih dari 7 hari."
              color="text-sky-600"
              bg="bg-sky-50"
            />
            <SummaryCard
              icon={TimerReset}
              label="Terlama"
              value={formatDuration(longestOpenHours)}
              helper={`${activeAges.filter((item) => item.hours > 24 * 14).length} mandek`}
              tooltip="Durasi laporan aktif tertua yang belum selesai. Mandek dihitung jika lebih dari 14 hari."
              color="text-rose-600"
              bg="bg-rose-50"
            />
            <SummaryCard
              icon={Clock}
              label="Rata-rata"
              value={formatDuration(averageResolutionHours)}
              helper="waktu selesai"
              tooltip="Rata-rata waktu dari laporan dibuat sampai dinyatakan selesai."
              color="text-slate-600"
              bg="bg-slate-100"
            />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.35fr]">
            <ChartPanel
              title="Komposisi Status"
              tooltip="Pembagian laporan berdasarkan status terakhirnya: baru, terverifikasi, proses, klarifikasi, dan selesai."
            >
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={82}
                    paddingAngle={2}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel
              title="Tren 6 Bulan"
              tooltip="Perbandingan jumlah laporan masuk dan laporan selesai dalam enam bulan terakhir."
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="masuk" name="Masuk" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="selesai" name="Selesai" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <ChartPanel
              title="Umur Laporan Aktif"
              tooltip="Mengelompokkan laporan yang belum selesai berdasarkan umur penanganannya."
            >
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Laporan" radius={[5, 5, 0, 0]}>
                    {ageData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel
              title="Sebaran Rating"
              tooltip="Jumlah rating warga per nilai bintang. Rating setengah bintang masuk ke bintang atasnya di grafik ini."
            >
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Rating" fill="#f59e0b" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>
          </div>

          <div className="mt-3 rounded-sm border border-gray-100 bg-gray-50 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Laporan Aktif Terlama
              </h3>
              <span className="rounded-full bg-white px-2 py-1 text-[9px] font-black text-gray-400">
                {oldestActiveReports.length} item
              </span>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {oldestActiveReports.length === 0 ? (
                <div className="rounded-sm border border-dashed border-gray-200 bg-white px-3 py-4 text-xs font-bold text-gray-400">
                  Tidak ada laporan aktif.
                </div>
              ) : (
                oldestActiveReports.map(({ report, hours }) => (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => {
                      onFocusReport?.(report);
                      onClose();
                    }}
                    className="min-w-0 rounded-sm border border-gray-100 bg-white p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-black text-gray-950">
                        {report.title}
                      </span>
                      <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-black text-rose-600">
                        {formatDuration(hours)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-gray-400">
                      <span className="truncate">
                        {STATUS_META[report.status as Exclude<ReportStatus, "rejected">]?.label ?? report.status}
                      </span>
                      <span>{formatReportDate(report.createdAt)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
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
    <div className="min-w-0 rounded-sm border border-gray-100 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}>
          <Icon size={16} strokeWidth={2.5} />
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

function ChartPanel({
  title,
  tooltip,
  children,
}: {
  title: string;
  tooltip: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-sm border border-gray-100 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-1.5">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          {title}
        </h3>
        <HelpTooltip content={tooltip} align="right" />
      </div>
      {children}
    </div>
  );
}
