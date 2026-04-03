export const REPORT_STATUSES = {
  pending: { label: "Menunggu", color: "bg-yellow-100 text-yellow-800" },
  verified: { label: "Terverifikasi", color: "bg-blue-100 text-blue-800" },
  in_progress: { label: "Dalam Proses", color: "bg-orange-100 text-orange-800" },
  resolved: { label: "Selesai", color: "bg-green-100 text-green-800" },
  rejected: { label: "Ditolak", color: "bg-red-100 text-red-800" },
} as const;

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
