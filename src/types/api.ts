import type { Agency } from "./agency";

export interface PaginatedResponse<T> {
  laporan: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AgencyStats {
  dinas: Agency;
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
  };
}
