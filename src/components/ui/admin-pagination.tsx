import { ChevronLeft, ChevronRight } from "lucide-react";

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
};

function getVisiblePages(page: number, totalPages: number) {
  const totalVisible = Math.min(5, totalPages);
  const start = Math.max(1, Math.min(totalPages - totalVisible + 1, page - 2));

  return Array.from({ length: totalVisible }, (_, index) => start + index);
}

export function AdminPagination({
  page,
  totalPages,
  totalItems = 0,
  pageSize = 20,
  itemLabel = "data",
  onPageChange,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const firstItem = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
  const lastItem = totalItems > 0 ? Math.min(page * pageSize, totalItems) : 0;
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-700">
            Halaman {page} dari {totalPages}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-gray-400">
            Menampilkan {firstItem}-{lastItem} dari {totalItems} {itemLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-gray-200 bg-white text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Ke halaman sebelumnya"
            title="Halaman sebelumnya"
          >
            <ChevronLeft size={14} />
          </button>

          <div className="flex items-center gap-1">
            {visiblePages[0] > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => onPageChange(1)}
                  className="h-8 min-w-8 rounded-sm px-2 text-xs font-black text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  1
                </button>
                <span className="px-1 text-xs font-bold text-gray-300">...</span>
              </>
            )}

            {visiblePages.map((visiblePage) => (
              <button
                key={visiblePage}
                type="button"
                onClick={() => onPageChange(visiblePage)}
                aria-current={visiblePage === page ? "page" : undefined}
                className={`h-8 min-w-8 rounded-sm px-2 text-xs font-black transition-colors ${
                  visiblePage === page
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {visiblePage}
              </button>
            ))}

            {visiblePages[visiblePages.length - 1] < totalPages && (
              <>
                <span className="px-1 text-xs font-bold text-gray-300">...</span>
                <button
                  type="button"
                  onClick={() => onPageChange(totalPages)}
                  className="h-8 min-w-8 rounded-sm px-2 text-xs font-black text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-gray-200 bg-white text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Ke halaman berikutnya"
            title="Halaman berikutnya"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
