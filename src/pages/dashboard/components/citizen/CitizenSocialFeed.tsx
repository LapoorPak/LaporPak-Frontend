import { useEffect, useRef, useState } from "react";
import type { ReportLocation } from "@/api/reports";
import type {
  CitizenFeedReportCardProps,
  CitizenSocialFeedProps,
} from "@/types/dashboard";
import { resolvePhotoUrl } from "@/lib/resolve-photo-url";
import { maskCitizenName } from "@/lib/utils";
import {
  AlertTriangle,
  Building2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Navigation,
  ThumbsDown,
  ThumbsUp,
  ZoomIn,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  CITIZEN_REPORT_STATUS_MAP,
  formatMachineText,
} from "@/pages/dashboard/utils";

function formatFeedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const formatter = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });
  const units = [
    { unit: "year" as const, ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: "month" as const, ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: "week" as const, ms: 1000 * 60 * 60 * 24 * 7 },
    { unit: "day" as const, ms: 1000 * 60 * 60 * 24 },
    { unit: "hour" as const, ms: 1000 * 60 * 60 },
    { unit: "minute" as const, ms: 1000 * 60 },
  ];

  const match = units.find((item) => absMs >= item.ms);
  if (!match) return "Baru saja";

  return formatter.format(Math.round(diffMs / match.ms), match.unit);
}

function getReportPhotos(report: ReportLocation) {
  return report.images?.length
    ? report.images
    : report.aiReview?.gambarDiterimaAi?.length
      ? report.aiReview.gambarDiterimaAi
      : [];
}

function FeedReportCard({
  report,
  onPhotoClick,
  onVote,
  onOpenReportDetail,
  onOpenMyReports,
  isVoting,
}: CitizenFeedReportCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const status = CITIZEN_REPORT_STATUS_MAP[report.status] || {
    label: report.status,
    color: "bg-gray-50 text-gray-700 border-gray-200",
  };
  const photoList = getReportPhotos(report);
  const detailText = report.description?.trim() || "";
  const displayName = maskCitizenName(report.createdBy?.name);
  const voteScore = report.voteScore ?? 0;
  const upvotes = report.upvotes ?? 0;
  const downvotes = report.downvotes ?? 0;
  const myVote = report.myVote ?? 0;
  const isClarificationRequested = report.status === "clarification_requested";
  const isMine = report.ownership === "mine" || report.canEdit;
  const latestTimeline = report.timeline?.length
    ? report.timeline[report.timeline.length - 1]
    : null;
  const reversedTimeline = [...(report.timeline ?? [])].reverse();
  const latestClarificationTimeline = reversedTimeline.find(
    (item) =>
      item.status === "clarification_requested" &&
      (item.note?.trim() || item.images.length > 0),
  );
  const progressTimeline =
    (isClarificationRequested ? latestClarificationTimeline : null) ??
    reversedTimeline.find(
      (item) => item.note?.trim() || item.images.length > 0,
    ) ??
    latestTimeline;
  const progressTimelineStatus = progressTimeline
    ? CITIZEN_REPORT_STATUS_MAP[progressTimeline.status] || status
    : null;
  const progressImages =
    report.status === "resolved" && report.resolutionImages?.length
      ? report.resolutionImages
      : (progressTimeline?.images ?? []);
  const rawProgressText = isClarificationRequested
    ? progressTimeline?.note || report.agencyNote || null
    : report.resolutionNote ||
      report.agencyNote ||
      progressTimeline?.note ||
      null;
  const progressText = formatMachineText(rawProgressText);
  const progressTitle = isClarificationRequested
    ? "Butuh Klarifikasi"
    : report.resolutionNote
      ? "Hasil Penanganan"
      : report.agencyNote
        ? "Update Dinas"
        : "Progress Terbaru";
  const progressTitleClass = isClarificationRequested
    ? "text-violet-700"
    : report.resolutionNote
      ? "text-emerald-700"
      : report.agencyNote
        ? "text-sky-700"
        : "text-gray-500";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden rounded-sm border border-gray-100 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
    >
      <header className="flex items-start justify-between gap-3 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#db2744] text-sm font-black text-white shadow-sm shadow-red-500/20">
            {displayName[0] || "W"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-gray-950">
              {displayName}
            </p>
            <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-1.5 text-[10px] font-bold text-gray-400">
              <span>{formatFeedDate(report.createdAt)}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span className="max-w-[180px] truncate">
                {report.kategori?.name || "Laporan Warga"}
              </span>
            </div>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${status.color}`}
        >
          {status.label}
        </span>
      </header>

      <section className="px-4 pb-3 sm:px-5">
        <h3 className="text-base font-black leading-snug text-gray-950 sm:text-lg">
          {report.title}
        </h3>
        {detailText && (
          <div className="mt-2 text-sm leading-relaxed text-gray-600">
            <p className={!isExpanded ? "line-clamp-3" : ""}>{detailText}</p>
            {detailText.length > 160 && (
              <button
                type="button"
                onClick={() => setIsExpanded((value) => !value)}
                className="mt-1 text-xs font-black text-[#db2744] hover:text-rose-700"
              >
                {isExpanded ? "Ringkas" : "Selengkapnya"}
              </button>
            )}
          </div>
        )}
      </section>

      {photoList.length > 0 ? (
        <div className="relative bg-gray-100">
          <button
            type="button"
            onClick={() =>
              onPhotoClick(photoList.map(resolvePhotoUrl), photoIndex)
            }
            className="group relative block aspect-[4/3] w-full overflow-hidden bg-gray-100 sm:aspect-[16/10]"
          >
            <img
              src={resolvePhotoUrl(photoList[photoIndex])}
              alt={report.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent opacity-80" />
            <ZoomIn
              size={17}
              className="absolute right-3 top-3 text-white/85 drop-shadow"
            />
          </button>
          {photoList.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setPhotoIndex((index) =>
                    index > 0 ? index - 1 : photoList.length - 1,
                  );
                }}
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65"
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setPhotoIndex((index) =>
                    index < photoList.length - 1 ? index + 1 : 0,
                  );
                }}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65"
                aria-label="Foto berikutnya"
              >
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
                {photoList.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === photoIndex
                        ? "w-5 bg-white"
                        : "w-1.5 bg-white/55"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="mx-4 mb-3 flex min-h-[150px] items-center justify-center rounded-sm border border-dashed border-gray-200 bg-gray-50 text-gray-400 sm:mx-5">
          <div className="text-center">
            <Navigation size={24} className="mx-auto mb-2 text-gray-300" />
            <p className="text-[10px] font-black uppercase tracking-widest">
              Tanpa Foto
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isVoting}
            onClick={() => onVote(report, myVote === 1 ? 0 : 1)}
            className={`flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-black transition-colors ${
              myVote === 1
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:text-emerald-700"
            } ${isVoting ? "opacity-60" : ""}`}
          >
            <ThumbsUp size={15} />
            {upvotes}
          </button>
          <button
            type="button"
            disabled={isVoting}
            onClick={() => onVote(report, myVote === -1 ? 0 : -1)}
            className={`flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-black transition-colors ${
              myVote === -1
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:text-red-700"
            } ${isVoting ? "opacity-60" : ""}`}
          >
            <ThumbsDown size={15} />
            {downvotes}
          </button>
        </div>
        <span className="text-xs font-black text-gray-500">
          {voteScore > 0 ? `+${voteScore}` : voteScore} skor
        </span>
      </div>

      <footer className="space-y-3 px-4 py-3.5 sm:px-5">
        <button
          type="button"
          onClick={() => onOpenReportDetail(report)}
          className="flex h-10 w-full items-center justify-center rounded-full bg-gray-900 px-4 text-xs font-black text-white transition-colors hover:bg-gray-800"
        >
          Lihat Detail
        </button>

        <div className="grid gap-2 text-xs sm:grid-cols-2">
          <div className="flex min-w-0 items-center gap-2 rounded-sm bg-gray-50 px-3 py-2.5">
            <Building2
              size={14}
              className={
                report.dinas
                  ? "shrink-0 text-[#db2744]"
                  : "shrink-0 text-gray-400"
              }
            />
            <span className="truncate font-bold text-gray-700">
              {report.dinas?.name || "Menunggu instansi"}
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-sm bg-gray-50 px-3 py-2.5">
            <MapPin size={14} className="shrink-0 text-gray-400" />
            <span className="truncate font-mono text-[11px] font-bold text-gray-600">
              {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
            </span>
          </div>
        </div>

        {(progressText || progressTimeline || progressImages.length > 0) && (
          <div className="rounded-sm border border-gray-100 bg-gray-50 px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <p
                className={`text-[10px] font-black uppercase tracking-widest ${progressTitleClass}`}
              >
                {progressTitle}
              </p>
              {progressTimeline && progressTimelineStatus && (
                <>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${progressTimelineStatus.color}`}
                  >
                    {progressTimelineStatus.label}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">
                    {formatFeedDate(progressTimeline.createdAt)}
                  </span>
                </>
              )}
            </div>

            {progressText && (
              <p className="mt-1 text-xs leading-relaxed text-gray-700">
                {progressText}
              </p>
            )}

            {progressImages.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {progressImages.slice(0, 4).map((image, index) => {
                  const remaining = progressImages.length - 4;

                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        onPhotoClick(progressImages.map(resolvePhotoUrl), index)
                      }
                      className="group relative aspect-square overflow-hidden rounded-sm bg-gray-200"
                      aria-label={`Buka foto progress ${index + 1}`}
                    >
                      <img
                        src={resolvePhotoUrl(image)}
                        alt={`Foto progress ${index + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
                      {index === 3 && remaining > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-black text-white">
                          +{remaining}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {isClarificationRequested && isMine && onOpenMyReports && (
              <button
                type="button"
                onClick={() => onOpenMyReports(report)}
                className="mt-3 inline-flex h-8 items-center justify-center rounded-full bg-violet-600 px-3 text-[11px] font-black text-white shadow-sm transition-colors hover:bg-violet-700"
              >
                Buka Laporan
              </button>
            )}
          </div>
        )}
      </footer>
    </motion.article>
  );
}

export function CitizenSocialFeed({
  reports,
  totalCount,
  onPhotoClick,
  onVote,
  onOpenReportDetail,
  onOpenMyReports,
  onLoadMore,
  hasNextPage,
  isLoading,
  isFetchingNextPage,
  votingReportId,
}: CitizenSocialFeedProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const sortedReports = [...reports].sort(
    (a, b) =>
      (b.voteScore ?? 0) - (a.voteScore ?? 0) ||
      (b.upvotes ?? 0) - (a.upvotes ?? 0) ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const displayedTotalCount = totalCount ?? sortedReports.length;

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
    <div className="absolute inset-0 z-10 overflow-y-auto bg-[#f3f4f6] px-3 pb-28 pt-52 sm:px-5 sm:pb-36 sm:pt-24 md:px-8 md:pt-28">
      <div className="z-0 mb-4 border-b border-gray-200/70 bg-[#f3f4f6] pb-3  sm:top-0 sm:z-10 sm:-mx-5 sm:bg-[#f3f4f6]/95 sm:px-5 sm:pt-1 sm:backdrop-blur md:-mx-8 md:px-8">
        <div className="mx-auto flex w-full max-w-2xl items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-black tracking-tight text-gray-950">
              Isu Terkini
            </h2>
            <p className="text-xs font-bold text-gray-400">
              {displayedTotalCount} laporan warga
            </p>
          </div>
          <div className="hidden rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 sm:block">
            Feed
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-sm border border-gray-100 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-28 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-2.5 w-44 animate-pulse rounded-full bg-gray-100" />
                </div>
              </div>
              <div className="px-4 pb-3 sm:px-5">
                <div className="h-4 w-40 animate-pulse rounded-full bg-gray-100" />
              </div>
              <div className="aspect-[4/3] w-full animate-pulse bg-gray-100 sm:aspect-[16/10]" />
              <div className="px-4 py-3 sm:px-5">
                <div className="h-8 w-full animate-pulse rounded-sm bg-gray-100" />
              </div>
            </div>
          ))
        ) : sortedReports.length === 0 ? (
          <div className="mt-10 flex min-h-[300px] flex-col items-center justify-center rounded-sm border border-dashed border-gray-200 bg-white px-6 text-center shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <AlertTriangle size={24} />
            </div>
            <p className="text-sm font-black text-gray-800">
              Belum ada isu yang cocok
            </p>
            <p className="mt-1 max-w-xs text-xs font-medium leading-relaxed text-gray-400">
              Coba ubah kata kunci pencarian.
            </p>
          </div>
        ) : (
          sortedReports.map((report) => (
            <FeedReportCard
              key={report.id}
              report={report}
              onPhotoClick={onPhotoClick}
              onVote={onVote}
              onOpenReportDetail={onOpenReportDetail}
              onOpenMyReports={onOpenMyReports}
              isVoting={votingReportId === report.id}
            />
          ))
        )}

        {!isLoading && (
          <div
            ref={loadMoreRef}
            className="flex min-h-16 items-center justify-center py-2"
          >
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-black text-gray-500 shadow-sm">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-200 border-t-[#db2744]" />
                Memuat laporan...
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
