import { useEffect, useRef } from "react";
import { AlertCircle, Building2, CheckCircle2, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import type { AgencySocialFeedProps } from "@/types/dashboard";
import {
  formatAgencyRegionLabel,
  getAgencyRoutingStatusMeta,
} from "@/pages/dashboard/config";
import { getDashboardStatusToneStyle } from "@/pages/dashboard/utils";

const FEED_SKELETONS = Array.from({ length: 5 });

export function AgencySocialFeed({
  reports,
  totalCount,
  isLoading,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  onSelectReport,
  onOpenReportDetail,
}: AgencySocialFeedProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore();
        }
      },
      { rootMargin: "360px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <div className="absolute inset-0 z-10 overflow-y-auto bg-[#f3f4f6] px-3 pb-28 pt-56 sm:px-5 sm:pb-36 sm:pt-24 md:px-8 md:pt-28">
      <div className="z-0 mb-4 border-b border-gray-200/70 bg-[#f3f4f6] pb-3 sm:top-0 sm:z-10 sm:-mx-5 sm:bg-[#f3f4f6]/95 sm:px-5 sm:pt-1 sm:backdrop-blur md:-mx-8 md:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-black tracking-tight text-gray-950">
                Feed Tiket
              </h2>
              <p className="text-xs font-bold text-gray-400">
                {totalCount} tiket dalam pantauan
              </p>
            </div>
            <div className="hidden rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 sm:block">
              Dinas
            </div>
          </div>

        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        {isLoading ? (
          FEED_SKELETONS.map((_, index) => (
            <div
              key={index}
              className="rounded-sm border border-gray-100 bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="h-7 w-24 animate-pulse rounded-full bg-gray-100" />
                <div className="h-3 w-20 animate-pulse rounded-full bg-gray-100" />
              </div>
              <div className="mb-3 h-4 w-2/3 animate-pulse rounded-full bg-gray-100" />
              <div className="h-16 animate-pulse rounded-sm bg-gray-100" />
            </div>
          ))
        ) : reports.length === 0 ? (
          <div className="mt-8 flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-[#db2744] shadow-[0_8px_24px_rgba(219,39,68,0.08)]">
              <AlertCircle size={19} strokeWidth={2.4} />
            </div>
            <p className="text-sm font-black tracking-tight text-gray-900">
              Belum ada tiket yang cocok
            </p>
            <p className="mt-1 max-w-[260px] text-xs font-semibold leading-relaxed text-gray-500">
              Coba ubah pencarian atau tab status tiket.
            </p>
          </div>
        ) : (
          reports.map((report, index) => {
            const routingStatusMeta = getAgencyRoutingStatusMeta(
              report.routingStatus,
            );

            return (
              <motion.article
                key={report.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.025, 0.16) }}
                className="overflow-hidden rounded-sm border border-gray-100 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
              >
                <button
                  type="button"
                  onClick={() =>
                    (onOpenReportDetail ?? onSelectReport)(report.id)
                  }
                  className="block w-full p-4 text-left transition-colors hover:bg-gray-50/70 sm:p-5"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-sm px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${getDashboardStatusToneStyle(report.statusTone)}`}
                      >
                        {report.statusLabel}
                      </span>
                      {routingStatusMeta && (
                        <span className={`rounded-sm border px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${routingStatusMeta.color}`}>
                          {routingStatusMeta.label}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold text-gray-400">
                      {report.dateLabel}
                    </span>
                  </div>

                  <h3 className="mb-3 text-[17px] font-black leading-snug tracking-tight text-gray-950">
                    {report.title}
                  </h3>

                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {report.kategori?.name && (
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-[10px] font-black text-[#db2744]">
                      {report.kategori.name}
                    </span>
                  )}
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black text-gray-400">
                    {report.referenceCode}
                  </span>
                  {report.canEdit === false && (
                    <span className="rounded-full border border-gray-200 px-3 py-1 text-[10px] font-black text-gray-500">
                      Lihat Saja
                    </span>
                  )}
                </div>

                <div className="rounded-sm border border-gray-100 bg-gray-50 px-3 py-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-700">
                    <Building2 size={14} className="text-[#db2744]" />
                    <span className="min-w-0 truncate">
                      {report.agencyName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-400">
                    <MapPin size={13} className="text-gray-300" />
                    <span className="min-w-0 truncate">
                      {formatAgencyRegionLabel(
                        report.cabangDinas?.wilayah,
                        report.cabangDinas?.name || "Wilayah dinas",
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Update tiket
                  </span>
                  <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-gray-900 px-3 text-[11px] font-black text-white">
                    <CheckCircle2 size={14} />
                    Buka
                  </span>
                </div>
                </button>
              </motion.article>
            );
          })
        )}

        {!isLoading && reports.length > 0 && (
          <div
            ref={loadMoreRef}
            className="flex min-h-16 items-center justify-center py-2"
          >
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-black text-gray-500 shadow-sm">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-200 border-t-[#db2744]" />
                Memuat tiket...
              </div>
            ) : hasNextPage ? (
              <button
                type="button"
                onClick={onLoadMore}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-black text-gray-500 shadow-sm transition-colors hover:text-gray-900"
              >
                Muat lagi
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
