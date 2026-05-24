import type { ReportStatus } from "@/types/reports";

export const REPORT_STATUSES = {
  pending: {
    label: "Menunggu",
    color: "bg-yellow-100 text-yellow-800",
    chartColor: "#f59e0b",
  },
  verified: {
    label: "Terverifikasi",
    color: "bg-blue-100 text-blue-800",
    chartColor: "#2563eb",
  },
  in_progress: {
    label: "Diproses",
    color: "bg-orange-100 text-orange-800",
    chartColor: "#0ea5e9",
  },
  clarification_requested: {
    label: "Butuh Klarifikasi",
    color: "bg-violet-100 text-violet-800",
    chartColor: "#8b5cf6",
  },
  resolved: {
    label: "Selesai",
    color: "bg-green-100 text-green-800",
    chartColor: "#22c55e",
  },
  rejected: {
    label: "Ditolak",
    color: "bg-red-100 text-red-800",
    chartColor: "#ef4444",
  },
} satisfies Record<ReportStatus, { label: string; color: string; chartColor: string }>;

export const REPORT_STATUS_ALIASES = {
  menunggu: "pending",
  verifikasi: "verified",
  proses: "in_progress",
  klarifikasi: "clarification_requested",
  selesai: "resolved",
  ditolak: "rejected",
} satisfies Record<string, ReportStatus>;

export function normalizeReportStatus(status: string): ReportStatus | null {
  if (status in REPORT_STATUSES) {
    return status as ReportStatus;
  }

  return REPORT_STATUS_ALIASES[status as keyof typeof REPORT_STATUS_ALIASES] ?? null;
}

export const REPORT_CATEGORIES = [
  { code: "jalan_rusak", name: "Jalan Rusak", agency: "dinas_pu" },
  { code: "jembatan_rusak", name: "Jembatan Rusak", agency: "dinas_pu" },
  { code: "drainase_tersumbat", name: "Drainase Tersumbat", agency: "dinas_pu" },
  { code: "trotoar_rusak", name: "Trotoar Rusak", agency: "dinas_pu" },
  { code: "bangunan_publik_rusak", name: "Bangunan Publik Rusak", agency: "dinas_pu" },
  { code: "sampah_menumpuk", name: "Sampah Menumpuk", agency: "dlhk" },
  { code: "pencemaran_air", name: "Pencemaran Air", agency: "dlhk" },
  { code: "pencemaran_udara", name: "Pencemaran Udara", agency: "dlhk" },
  { code: "pohon_tumbang", name: "Pohon Tumbang", agency: "dlhk" },
  { code: "sampah_sungai", name: "Sampah Sungai", agency: "dlhk" },
  { code: "banjir", name: "Banjir", agency: "bpbd" },
  { code: "tanah_longsor", name: "Tanah Longsor", agency: "bpbd" },
  { code: "kebakaran", name: "Kebakaran", agency: "bpbd" },
  { code: "bencana_lain", name: "Bencana Lain", agency: "bpbd" },
  { code: "lampu_jalan_mati", name: "Lampu Jalan Mati", agency: "dishub" },
  { code: "rambu_lalulintas", name: "Rambu Lalu Lintas", agency: "dishub" },
  { code: "kemacetan", name: "Kemacetan", agency: "dishub" },
  { code: "listrik_padam", name: "Listrik Padam", agency: "pln" },
  { code: "kabel_bahaya", name: "Kabel Bahaya", agency: "pln" },
] as const;
