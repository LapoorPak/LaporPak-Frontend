import type { ReportStatus } from "@/types/reports";

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
    byStatus: Partial<Record<ReportStatus, number>> & Record<string, number | undefined>;
  };
  topDinas?: { name: string; short?: string; count: number }[];
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

export interface DinasActivityItem {
  id: string;
  code: string;
  name: string;
  short: string | null;
  isActive: boolean;
  totalBranches: number;
  totalCategories: number;
  totalReports: number;
  activeReports: number;
  resolvedReports: number;
  rejectedReports: number;
  averageResolutionHours: number;
}

export interface DinasActivityPoint {
  date: string;
  label: string;
  total: number;
  active: number;
  resolved: number;
}

export interface DinasActivity {
  days: number;
  summary: {
    totalDinas: number;
    activeDinas: number;
    inactiveDinas: number;
    totalBranches: number;
    totalCategories: number;
    totalReports: number;
    activeReports: number;
    resolvedReports: number;
    averageResolutionHours: number;
  };
  topByReports: DinasActivityItem[];
  coverage: DinasActivityItem[];
  fastestResolution: DinasActivityItem[];
  series: DinasActivityPoint[];
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

export interface CabangActivityItem {
  id: string;
  name: string;
  wilayah: string;
  dinasId: string;
  dinasName: string;
  dinasShort: string | null;
  isRoutingEnabled: boolean;
  coverageRadiusKm: number | null;
  serviceTagsCount: number;
  petugasCount: number;
  categoryCoverage: number;
  totalReports: number;
  activeReports: number;
  resolvedReports: number;
  rejectedReports: number;
  averageResolutionHours: number;
}

export interface CabangActivityDinasItem {
  id: string;
  name: string;
  short: string | null;
  totalBranches: number;
  routingEnabled: number;
  totalReports: number;
  petugasCount: number;
}

export interface CabangActivityPoint {
  date: string;
  label: string;
  total: number;
  active: number;
  resolved: number;
}

export interface CabangActivity {
  days: number;
  summary: {
    totalBranches: number;
    routingEnabled: number;
    routingDisabled: number;
    totalReports: number;
    activeReports: number;
    resolvedReports: number;
    averageResolutionHours: number;
    totalPetugas: number;
  };
  topByReports: CabangActivityItem[];
  topByCoverage: CabangActivityItem[];
  fastestResolution: CabangActivityItem[];
  series: CabangActivityPoint[];
  byDinas: CabangActivityDinasItem[];
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

export interface CategoryActivityItem {
  id: string;
  code: string;
  name: string;
  dinasId: string;
  dinasName: string;
  dinasShort: string | null;
  isActive: boolean;
  slaHours: number | null;
  urgencyWeight: number;
  totalReports: number;
}

export interface CategoryActivityDinasItem {
  id: string;
  name: string;
  short: string | null;
  totalCategories: number;
  activeCategories: number;
  totalReports: number;
}

export interface CategoryActivityPoint {
  date: string;
  label: string;
  total: number;
  resolved: number;
  active: number;
}

export interface CategoryActivity {
  days: number;
  summary: {
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
    totalReports: number;
    averageUrgency: number;
    averageSlaHours: number;
  };
  topByReports: CategoryActivityItem[];
  topByUrgency: CategoryActivityItem[];
  topBySla: CategoryActivityItem[];
  series: CategoryActivityPoint[];
  byDinas: CategoryActivityDinasItem[];
}

export interface AdminLaporan {
  id: string;
  title: string;
  description: string;
  status: ReportStatus;
  routingStatus: string;
  images: string[];
  latitude: number;
  longitude: number;
  address: string | null;
  agencyNote: string | null;
  resolutionNote: string | null;
  upvotes?: number;
  downvotes?: number;
  voteScore?: number;
  aiDecisionStatus: string | null;
  aiConfidence: number | null;
  aiReasoning: string | null;
  aiClarityScore: number | null;
  aiSeriousnessScore: number | null;
  aiUrgencyScore: number | null;
  aiRejectionCode: string | null;
  aiSuggestedRewrite: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  kategori: {
    id: string;
    code: string;
    name: string;
    dinas: { id: string; code: string; name: string; short: string } | null;
  } | null;
  cabangDinas: { id: string; name: string; wilayah: string; address?: string | null; phone?: string | null } | null;
  createdBy: { id: string; name: string; email: string; image: string | null } | null;
  assignedTo?: { id: string; name: string; email: string; image: string | null } | null;
  resolvedBy?: { id: string; name: string; email: string } | null;
  rating?: {
    score: number;
    count?: number;
    id?: string;
    userId?: string;
    dinasId?: string | null;
    cabangDinasId?: string | null;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  averageRating?: number | null;
  ratingCount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  phone: string | null;
  role: string | null;
  banned: boolean;
  banReason: string | null;
  banExpires: number | null;
  createdAt: string;
  lastLoginAt: string | null;
  petugas?: {
    id: string;
    nip: string | null;
    cabangDinasId: string;
    cabangDinas?: Cabang;
  };
}

export interface UserActivityPoint {
  date: string;
  label: string;
  activeUsers: number;
  sessions: number;
  newUsers: number;
}

export interface UserActivitySummary {
  activeToday: number;
  averageDailyActive: number;
  peakActive: number;
  peakDate: string;
  totalActiveUsers: number;
  totalSessions: number;
  newUsers: number;
}

export interface UserActivity {
  days: number;
  from: string;
  to: string;
  summary: UserActivitySummary;
  series: UserActivityPoint[];
}

export interface ReportActivityPoint {
  date: string;
  label: string;
  total: number;
  resolved: number;
  rejected: number;
  active: number;
  manualReview: number;
}

export interface ReportActivitySummary {
  totalReports: number;
  newReports: number;
  activeReports: number;
  resolvedReports: number;
  rejectedReports: number;
  manualReviewReports: number;
  averageDailyReports: number;
  peakReports: number;
  peakDate: string;
  averageResolutionHours: number;
  averageRating: number;
  aiAccepted: number;
  aiRejected: number;
}

export interface ReportActivityBreakdown {
  status: string;
  label: string;
  total: number;
}

export interface ReportActivityTopDinas {
  id: string;
  name: string;
  short: string | null;
  total: number;
}

export interface ReportActivityTopKategori {
  id: string;
  name: string;
  dinasName: string;
  total: number;
}

export interface ReportActivity {
  days: number;
  from: string;
  to: string;
  summary: ReportActivitySummary;
  series: ReportActivityPoint[];
  byStatus: ReportActivityBreakdown[];
  routing: ReportActivityBreakdown[];
  topDinas: ReportActivityTopDinas[];
  topKategori: ReportActivityTopKategori[];
}
