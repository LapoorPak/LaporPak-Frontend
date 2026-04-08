export interface ReportStatusMeta {
  label: string;
  color: string;
}

export const DASHBOARD_STATUS_TONE_STYLES: Record<string, string> = {
  warning: "bg-red-100 text-[#C01D33] border border-red-200",
  info: "bg-blue-100 text-blue-700 border border-blue-200",
  success: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  danger: "bg-gray-100 text-gray-700 border border-gray-200",
};

export const getDashboardStatusToneStyle = (tone?: string) => {
  return DASHBOARD_STATUS_TONE_STYLES[tone ?? ""] || "bg-gray-100 text-gray-700 border border-gray-200";
};

export const CITIZEN_REPORT_STATUS_MAP: Record<string, ReportStatusMeta> = {
  pending: { label: "Menunggu", color: "bg-amber-50 text-amber-700 border-amber-200" },
  verified: { label: "Terverifikasi", color: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress: { label: "Diproses", color: "bg-sky-50 text-sky-700 border-sky-200" },
  resolved: { label: "Selesai", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Ditolak", color: "bg-red-50 text-red-700 border-red-200" },
};

export const AGENCY_REPORT_STATUS_MAP: Record<string, ReportStatusMeta> = {
  pending: { label: "Menunggu", color: "bg-amber-100 text-amber-700 border-amber-200" },
  verified: { label: "Terverifikasi", color: "bg-blue-100 text-blue-700 border-blue-200" },
  in_progress: { label: "Diproses", color: "bg-orange-100 text-orange-700 border-orange-200" },
  resolved: { label: "Selesai", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rejected: { label: "Ditolak", color: "bg-red-100 text-[#C01D33] border-red-200" },
};
