export const AGENCY_ROLES = [
  "dinas_pu",
  "dinas_dlhk",
  "dinas_bpbd",
  "dinas_dishub",
  "dinas_pln",
] as const;

export const AGENCY_CATEGORIES = {
  dinas_pu: { name: "Dinas Pekerjaan Umum", short: "DPU" },
  dlhk: { name: "Dinas Lingkungan Hidup & Kebersihan", short: "DLHK" },
  bpbd: { name: "Badan Penanggulangan Bencana Daerah", short: "BPBD" },
  dishub: { name: "Dinas Perhubungan", short: "Dishub" },
  pln: { name: "PLN", short: "PLN" },
} as const;
