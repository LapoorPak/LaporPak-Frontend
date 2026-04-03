export interface PaginatedResponse<T> {
  laporan: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}