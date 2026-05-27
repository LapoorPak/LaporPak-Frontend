import { AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react";
import type {
  DashboardReportItem,
  ReportLocation,
  ReportsDashboardSummary,
  ReportsDashboardTab,
  ReportsDashboardTabKey,
  ReportsScope,
  ReportStatus,
  ReportTimelineItem,
} from "@/types/reports";

export const DEFAULT_REPORTS_DASHBOARD_TABS: ReportsDashboardTab[] = [
  { key: "semua", label: "Semua", total: 0 },
  { key: "baru", label: "Baru", total: 0 },
  { key: "diproses", label: "Diproses", total: 0 },
  { key: "klarifikasi", label: "Klarifikasi", total: 0 },
  { key: "tuntas", label: "Tuntas", total: 0 },
];

export const DEFAULT_REPORTS_DASHBOARD_SUMMARY: ReportsDashboardSummary = {
  totalTarget: 0,
  laporanBaru: 0,
  diproses: 0,
  klarifikasi: 0,
  tuntas: 0,
  byStatusRaw: {
    pending: 0,
    verified: 0,
    in_progress: 0,
    clarification_requested: 0,
    resolved: 0,
    rejected: 0,
  },
};

export const SUMMARY_CARD_META = [
  {
    key: "totalTarget",
    label: "Total Target",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-100",
    border: "border-blue-200",
  },
  {
    key: "laporanBaru",
    label: "Laporan Baru",
    icon: AlertCircle,
    color: "text-[#C01D33]",
    bg: "bg-red-100",
    border: "border-red-200",
  },
  {
    key: "diproses",
    label: "Diproses",
    icon: Clock,
    color: "text-orange-600",
    bg: "bg-orange-100",
    border: "border-orange-200",
  },
  {
    key: "klarifikasi",
    label: "Butuh Klarifikasi",
    icon: AlertCircle,
    color: "text-violet-600",
    bg: "bg-violet-100",
    border: "border-violet-200",
  },
  {
    key: "tuntas",
    label: "Tuntas",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    border: "border-emerald-200",
  },
] as const;

export const REPORT_SCOPE_OPTIONS: {
  value: ReportsScope;
  label: string;
  shortLabel: string;
}[] = [
  { value: "mine", label: "Milik Saya", shortLabel: "Saya" },
  { value: "all", label: "Semua Tiket", shortLabel: "Semua" },
];

export const ALL_AGENCY_DASHBOARD_TAB_KEYS: ReportsDashboardTabKey[] = [
  "semua",
  "baru",
  "diproses",
  "klarifikasi",
  "tuntas",
];

export const AGENCY_STATUS_OPTIONS = [
  {
    value: "verified",
    label: "Terverifikasi",
    activeClass: "border-blue-500 bg-blue-50 text-blue-600",
  },
  {
    value: "in_progress",
    label: "Diproses",
    activeClass: "border-orange-500 bg-orange-50 text-orange-600",
  },
  {
    value: "clarification_requested",
    label: "Butuh Klarifikasi",
    activeClass: "border-violet-500 bg-violet-50 text-violet-600",
  },
  {
    value: "resolved",
    label: "Selesai",
    activeClass: "border-emerald-500 bg-emerald-50 text-emerald-600",
  },
] as const;

export const AGENCY_ROUTING_STATUS_MAP: Record<
  string,
  { label: string; color: string; markerClass?: string }
> = {
  auto_assigned: {
    label: "AI Assigned",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  manual_review: {
    label: "Review Manual",
    color: "bg-sky-50 text-sky-700 border-sky-200",
    markerClass: "bg-sky-600 shadow-sky-500/50 text-white",
  },
};

export const getAgencyRoutingStatusMeta = (routingStatus?: string | null) =>
  routingStatus ? AGENCY_ROUTING_STATUS_MAP[routingStatus] : undefined;

export const isManualReviewReport = (
  report: Pick<ReportLocation, "routingStatus">,
) => report.routingStatus === "manual_review";

export const canClaimManualReviewReport = (
  report: Pick<ReportLocation, "routingStatus" | "canEdit" | "assignedTo">,
) => isManualReviewReport(report) && report.canEdit !== true;

export const AGENCY_DASHBOARD_DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export const formatAgencyDetailDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));

export const formatAgencyRegionLabel = (
  wilayah?: string | null,
  fallback = "Wilayah dinas",
) => {
  if (!wilayah?.trim()) return fallback;

  return wilayah
    .trim()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const matchesAgencyDashboardTab = (
  status: ReportLocation["status"],
  tab: ReportsDashboardTabKey,
) => {
  if (status === "rejected") return false;
  if (tab === "baru") return status === "pending" || status === "verified";
  if (tab === "diproses") return status === "in_progress";
  if (tab === "klarifikasi") return status === "clarification_requested";
  if (tab === "tuntas") return status === "resolved";
  return true;
};

export const matchesAgencyDashboardTabs = (
  status: ReportLocation["status"],
  tabs: ReportsDashboardTabKey[],
) =>
  tabs.some(
    (tab) => tab !== "semua" && matchesAgencyDashboardTab(status, tab),
  );

export const matchesDashboardItemTabs = (
  report: DashboardReportItem,
  tabs: ReportsDashboardTabKey[],
) => tabs.includes(report.dashboardGroup);

export const isOwnedAgencyLocationReport = (report: ReportLocation) =>
  report.ownership === "mine" ||
  report.canEdit === true ||
  canClaimManualReviewReport(report);

export const isOwnedAgencyDashboardReport = (report: DashboardReportItem) =>
  report.ownership === "mine" ||
  report.canEdit === true ||
  canClaimManualReviewReport(report);

export const matchesAgencyDashboardSearch = (
  report: ReportLocation,
  query: string,
) => {
  if (!query) return true;

  const normalizedQuery = query.toLowerCase();
  const agencyName = report.cabangDinas?.name || report.dinas?.name || "Pusat";
  const categoryName = report.kategori?.name || "";

  return (
    report.id.toLowerCase().includes(normalizedQuery) ||
    report.title.toLowerCase().includes(normalizedQuery) ||
    agencyName.toLowerCase().includes(normalizedQuery) ||
    categoryName.toLowerCase().includes(normalizedQuery)
  );
};

export const getAgencyDashboardPresentation = (
  status: ReportLocation["status"],
): Pick<DashboardReportItem, "statusLabel" | "statusTone" | "dashboardGroup"> => {
  switch (status) {
    case "pending":
      return {
        statusLabel: "Menunggu",
        statusTone: "warning",
        dashboardGroup: "baru",
      };
    case "verified":
      return {
        statusLabel: "Terverifikasi",
        statusTone: "info",
        dashboardGroup: "baru",
      };
    case "in_progress":
      return {
        statusLabel: "Diproses",
        statusTone: "warning",
        dashboardGroup: "diproses",
      };
    case "clarification_requested":
      return {
        statusLabel: "Butuh Klarifikasi",
        statusTone: "danger",
        dashboardGroup: "klarifikasi",
      };
    case "resolved":
      return {
        statusLabel: "Selesai",
        statusTone: "success",
        dashboardGroup: "tuntas",
      };
    default:
      return {
        statusLabel: "Ditolak",
        statusTone: "danger",
        dashboardGroup: "tuntas",
      };
  }
};

export const toAgencyDashboardReport = (
  report: ReportLocation,
): DashboardReportItem | null => {
  if (report.status === "rejected") return null;

  const presentation = getAgencyDashboardPresentation(report.status);
  const agencyName =
    report.cabangDinas?.name || report.dinas?.name || "Belum ditugaskan";

  return {
    id: report.id,
    referenceCode: `#${report.id.slice(0, 8)}`,
    title: report.title,
    status: report.status,
    routingStatus: report.routingStatus,
    statusLabel: presentation.statusLabel,
    statusTone: presentation.statusTone,
    dashboardGroup: presentation.dashboardGroup,
    date: report.createdAt,
    dateLabel: AGENCY_DASHBOARD_DATE_FORMATTER.format(
      new Date(report.createdAt),
    ),
    agencyName,
    canEdit: report.canEdit,
    ownership: report.ownership,
    dinas: report.dinas,
    cabangDinas: report.cabangDinas,
    assignedTo: report.assignedTo,
    kategori: report.kategori
      ? {
          id: report.kategori.id,
          code: report.kategori.code,
          name: report.kategori.name,
        }
      : null,
  };
};

export type AgencyTicketTimelineStep = {
  key: string;
  status: ReportStatus;
  item: ReportTimelineItem;
  isCurrent: boolean;
};

export const buildAgencyTicketTimelineSteps = (
  timeline: ReportTimelineItem[],
  currentStatus: ReportStatus,
): AgencyTicketTimelineStep[] => {
  const latestCurrentStatusIndex = timeline.reduce(
    (latestIndex, item, index) =>
      item.status === currentStatus ? index : latestIndex,
    -1,
  );

  return timeline.map((item, index) => ({
    key: item.id,
    status: item.status,
    item,
    isCurrent: index === latestCurrentStatusIndex,
  }));
};

export const getAgencyTimelineDotClass = (isCurrent: boolean) =>
  isCurrent
    ? "border-[#db2744] bg-[#db2744] text-white shadow-sm shadow-red-500/30"
    : "border-emerald-500 bg-emerald-500 text-white";

export const AGENCY_TIMELINE_LINE_CLASS = "bg-emerald-200";
