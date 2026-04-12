export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminOverview {
  dinas: number;
  dinasActive?: number;
  cabang: number;
  cabangActive?: number;
  kategori: number;
  kategoriActive?: number;
  users: {
    active: number;
    banned: number;
    total: number;
  };
  petugas: number;
  reports: {
    total: number;
    byStatus: Record<string, number>;
  };
  topDinas?: { name: string; short?: string; count: number }[];
  recentActivities?: any[];
}

export interface Dinas {
  id: string;
  code: string;
  type: string | null;
  name: string;
  short: string | null;
  wilayah: string | null;
  description: string | null;
  isActive: boolean;
  routingPriority: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    cabang: number;
    kategori: number;
  };
}

export interface Cabang {
  id: string;
  dinasId: string;
  name: string;
  wilayah: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  province: string | null;
  cityRegency: string | null;
  coverageRadiusKm: number | null;
  isRoutingEnabled: boolean;
  serviceTags: string[] | null;
  photos: string[] | null;
  createdAt: string;
  updatedAt: string;
  dinas?: Dinas;
  _count?: {
    petugas: number;
    laporan: number;
  };
}

export interface Kategori {
  id: string;
  dinasId: string;
  code: string;
  name: string;
  description: string | null;
  slaHours: number | null;
  urgencyWeight: number;
  keywords: string[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  dinas?: Dinas;
  _count?: {
    laporan: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string | null;
  banned: boolean;
  banReason: string | null;
  banExpires: number | null;
  createdAt: Date;
  petugas?: {
    id: string;
    nip: string | null;
    cabangDinasId: string;
    cabangDinas?: Cabang;
  };
}
