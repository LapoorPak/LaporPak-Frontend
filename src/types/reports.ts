export type ReportsScope = "mine" | "all";
export type ReportOwnership = "mine" | "other";
export type ReportStatus =
  | "pending"
  | "verified"
  | "in_progress"
  | "clarification_requested"
  | "resolved"
  | "rejected";
export type ReportVoteValue = -1 | 0 | 1;

export interface ReportCategory {
  id: string;
  code: string;
  name: string;
  dinas: {
    id: string;
    code: string;
    type: string;
    name: string;
  };
}

export interface AiReview {
  statusAi: "diterima" | "ditolak";
  diterimaAi: boolean;
  ditolakAi: boolean;
  confidence: number;
  alasanAi: string;
  saranPerbaikanAi: string | null;
  skorKejelasanAi: number;
  skorKeseriusanAi: number;
  kodePenolakanAi: string | null;
  gambarDiterimaAi: string[];
  gambarDiabaikanAi: string[];
  petunjukGambarAi: string | null;
}

export interface ReportLocation {
  id: string;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  status: ReportStatus;
  routingStatus: string;
  urgencyScore?: number;
  createdAt: string;
  updatedAt: string;
  kategori?: ReportCategory | null;
  dinas?: {
    id: string;
    code: string;
    type: string;
    name: string;
  } | null;
  cabangDinas?: {
    id: string;
    name: string;
    wilayah: string;
  } | null;
  canEdit?: boolean;
  ownership?: ReportOwnership;
  agencyNote?: string | null;
  resolutionNote?: string | null;
  resolutionImages?: string[];
  assignedTo?: {
    id: string;
    name: string;
  } | null;
  createdBy?: {
    id: string;
    name: string;
  } | null;
  upvotes: number;
  downvotes: number;
  voteScore: number;
  myVote: ReportVoteValue | null;
  rating?: ReportRating | null;
  aiReview?: AiReview | null;
  images?: string[];
  timeline?: ReportTimelineItem[];
}

export interface ReportRating {
  id: string;
  score: number;
  note: string | null;
  userId: string;
  dinasId: string | null;
  cabangDinasId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportTimelineItem {
  id: string;
  status: ReportStatus;
  note: string | null;
  images: string[];
  actorRole: string | null;
  createdAt: string;
}

export interface LocationStats {
  total: number;
  byStatus: { status: string; total: number }[];
  byCategory: {
    kategoriId: string;
    kategoriCode: string;
    kategoriName: string;
    total: number;
  }[];
}

export interface GetReportLocationsResponse {
  data: ReportLocation[];
  stats: LocationStats;
  meta?: {
    page: number;
    limit: number;
    take: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateReportRequest {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  kategoriId?: string;
  address?: string;
  images?: File[];
}

export interface CreateReportResponse {
  data: ReportLocation;
}

export interface GetReportLocationsRequest {
  scope?: ReportsScope;
  page?: number;
  limit?: number;
  take?: number;
  status?: string;
  kategoriId?: string;
  dinasId?: string;
  cabangDinasId?: string;
  createdById?: string;
  search?: string;
  sort?: "top" | "newest";
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
}

export interface GetMyReportsRequest {
  page?: number;
  limit?: number;
  take?: number;
  status?: string;
  kategoriId?: string;
  search?: string;
}

export type ReportsDashboardTabKey =
  | "semua"
  | "baru"
  | "diproses"
  | "klarifikasi"
  | "tuntas";
export type ReportStatusTone = "success" | "warning" | "danger" | "info";

export interface DashboardReportItem {
  id: string;
  referenceCode: string;
  title: string;
  status: ReportLocation["status"];
  statusLabel: string;
  statusTone: ReportStatusTone;
  dashboardGroup: Exclude<ReportsDashboardTabKey, "semua">;
  date: string;
  dateLabel: string;
  agencyName: string;
  canEdit?: boolean;
  ownership?: ReportOwnership;
  dinas?: ReportLocation["dinas"];
  cabangDinas?: ReportLocation["cabangDinas"];
  kategori?: Pick<ReportCategory, "id" | "code" | "name"> | null;
}

export interface ReportsDashboardSummary {
  totalTarget: number;
  laporanBaru: number;
  diproses: number;
  klarifikasi?: number;
  tuntas: number;
  byStatusRaw: Record<string, number>;
}

export interface ReportsDashboardTab {
  key: ReportsDashboardTabKey;
  label: string;
  total: number;
}

export interface GetReportsDashboardRequest {
  scope?: ReportsScope;
  tab?: ReportsDashboardTabKey;
  page?: number;
  limit?: number;
  take?: number;
  search?: string;
  dinasId?: string;
  cabangDinasId?: string;
  kategoriId?: string;
}

export interface GetReportsDashboardResponse {
  data: DashboardReportItem[];
  meta: NonNullable<GetReportLocationsResponse["meta"]>;
  stats: {
    total: number;
    activeTab: ReportsDashboardTabKey;
    summary: ReportsDashboardSummary;
    tabs: ReportsDashboardTab[];
  };
}

export interface UpdateReportStatusRequest {
  status: ReportLocation["status"];
  agencyNote?: string | null;
  catatanDinas?: string | null;
  resolutionNote?: string | null;
  images?: File[];
}

export interface ResolveReportRequest {
  agencyNote?: string | null;
  catatanDinas?: string | null;
  resolutionNote?: string | null;
  resolutionImages?: File[];
}

export interface SubmitReportClarificationRequest {
  note: string;
  images?: File[];
}

export interface VoteReportRequest {
  vote: ReportVoteValue;
}

export interface RateReportRequest {
  score: number;
  note?: string | null;
}

export interface UpdateReportMutationResponse {
  data: Pick<
    ReportLocation,
    "id" | "status" | "agencyNote" | "resolutionNote" | "assignedTo" | "canEdit" | "ownership"
  > & {
    resolvedAt?: string | null;
  };
}
