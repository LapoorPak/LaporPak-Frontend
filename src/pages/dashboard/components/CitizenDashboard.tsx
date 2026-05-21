import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  type MapRef,
} from "@/components/ui/map";
import { authClient } from "@/lib/auth-client";
import {
  useInfiniteQueryGetReportLocations,
  useMutationRateReport,
  useMutationSubmitReportClarification,
  useMutationVoteReport,
  type ReportLocation,
  type ReportVoteValue,
} from "@/api/reports/reports-queries";
import { useGetAgencyLocations } from "@/hooks/agencies/useGetAgencyLocations";
import { useQueryGetMyReports } from "@/api/reports/reports-queries";
import { useGetReportLocations } from "@/hooks/reports/useGetReportLocations";
import { useCreateReport } from "@/hooks/reports/useCreateReport";
import {
  useQuerySearchLocation,
  type SearchResult,
} from "@/hooks/search/useSearchLocation";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/api/queryKeys";
import axios from "axios";
import { toast } from "sonner";
import { resolvePhotoUrl } from "@/lib/resolve-photo-url";
import { maskCitizenName } from "@/lib/utils";
import { useDashboardViewMode } from "@/context/dashboard-view-mode";
import {
  MapPin,
  X,
  AlertTriangle,
  Plus,
  Target,
  Check,
  Clock,
  User,
  Navigation,
  Building2,
  ListFilter,
  Search,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CitizenMyReportsPanel } from "./CitizenMyReportsPanel";
import { CitizenReportFormPanel } from "./CitizenReportFormPanel";
import { LocationSearchResultsDropdown } from "./LocationSearchResultsDropdown";
import { CITIZEN_REPORT_STATUS_MAP } from "../utils/reportStatus";

type InteractionMode = "idle" | "pin_drop";

type LightboxState = { images: string[]; index: number } | null;

const EMPTY_SEARCH_RESULTS: SearchResult[] = [];

function PhotoLightbox({
  images,
  index,
  onClose,
}: {
  images: string[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);

  const prev = useCallback(
    () => setCurrent((i) => (i > 0 ? i - 1 : images.length - 1)),
    [images.length],
  );
  const next = useCallback(
    () => setCurrent((i) => (i < images.length - 1 ? i + 1 : 0)),
    [images.length],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/92 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
        onClick={onClose}
      >
        <X size={18} />
      </button>

      {images.length > 1 && (
        <span className="hidden md:inline absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-xs font-bold tracking-widest">
          {current + 1} / {images.length}
        </span>
      )}

      {images.length > 1 && (
        <>
          <button
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      <motion.img
        key={current}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        src={resolvePhotoUrl(images[current])}
        alt={`Foto ${current + 1}`}
        className="max-w-[92vw] max-h-[75vh] md:max-h-[88vh] object-contain rounded-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <div className="md:hidden absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6 z-10">
          <button
            className="w-12 h-12 rounded-full bg-white/15 active:bg-white/30 text-white flex items-center justify-center transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-white/60 text-sm font-bold tracking-widest min-w-[48px] text-center">
            {current + 1} / {images.length}
          </span>
          <button
            className="w-12 h-12 rounded-full bg-white/15 active:bg-white/30 text-white flex items-center justify-center transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

function ReportPopup({
  report,
  onPhotoClick,
  onVote,
  isVoting = false,
  fullWidth = false,
}: {
  report: ReportLocation;
  onPhotoClick: (imgs: string[], idx: number) => void;
  onVote?: (report: ReportLocation, vote: ReportVoteValue) => void;
  isVoting?: boolean;
  fullWidth?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const status = CITIZEN_REPORT_STATUS_MAP[report.status] || {
    label: report.status,
    color: "bg-gray-50 text-gray-700 border-gray-200",
  };
  const categoryLabel = report.kategori?.name || "Laporan Warga";
  const detailText = report.description?.trim() || "";
  const agencyNote = report.agencyNote?.trim();
  const resolutionNote = report.resolutionNote?.trim();
  const photos = report.images?.length
    ? report.images
    : report.aiReview?.gambarDiterimaAi?.length
      ? report.aiReview.gambarDiterimaAi
      : null;
  const photoList = photos ?? [];
  const timelineCount = report.timeline?.length ?? 0;
  const timelineItems = showAllTimeline
    ? [...(report.timeline ?? [])].reverse()
    : (report.timeline?.slice(-5).reverse() ?? []);
  const hasHeroPhotos = photoList.length > 0;
  const hasTimelineColumn = timelineCount > 0;
  const voteScore = report.voteScore ?? 0;
  const upvotes = report.upvotes ?? 0;
  const downvotes = report.downvotes ?? 0;
  const myVote = report.myVote ?? 0;
  const renderVoteControls = (compact = false) => (
    <div
      className={`flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/80 ${compact ? "px-3 py-2" : "px-3 py-2.5"}`}
    >
      <div className="min-w-0">
        <p className="text-[8.5px] font-black uppercase tracking-[0.14em] text-gray-400">
          Vote Warga
        </p>
        <p className="text-[11px] font-bold text-gray-700">
          {voteScore > 0 ? `+${voteScore}` : voteScore} skor
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={!onVote || isVoting}
          onClick={(event) => {
            event.stopPropagation();
            onVote?.(report, myVote === 1 ? 0 : 1);
          }}
          className={`flex h-8 items-center gap-1 rounded-full border px-2.5 text-[10px] font-black transition-colors ${
            myVote === 1
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-gray-200 bg-white text-gray-500 hover:border-emerald-200 hover:text-emerald-700"
          } ${isVoting ? "opacity-60" : ""}`}
          aria-label="Vote up laporan"
        >
          <ThumbsUp size={12} />
          {upvotes}
        </button>
        <button
          type="button"
          disabled={!onVote || isVoting}
          onClick={(event) => {
            event.stopPropagation();
            onVote?.(report, myVote === -1 ? 0 : -1);
          }}
          className={`flex h-8 items-center gap-1 rounded-full border px-2.5 text-[10px] font-black transition-colors ${
            myVote === -1
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:text-red-700"
          } ${isVoting ? "opacity-60" : ""}`}
          aria-label="Vote down laporan"
        >
          <ThumbsDown size={12} />
          {downvotes}
        </button>
      </div>
    </div>
  );

  if (!fullWidth && hasTimelineColumn) {
    return (
      <div className="grid w-[560px] max-w-[calc(100vw-32px)] h-[430px] max-h-[calc(100vh-150px)] grid-cols-[320px_minmax(0,1fr)] overflow-hidden bg-white">
        <div className="min-w-0 overflow-y-auto border-r border-gray-100 bg-white">
          <div className="relative h-[190px] bg-gray-100">
            {hasHeroPhotos ? (
              <>
                <button
                  type="button"
                  className="absolute inset-0 z-1 h-full w-full cursor-zoom-in"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPhotoClick(photoList.map(resolvePhotoUrl), photoIndex);
                  }}
                />
                <img
                  src={resolvePhotoUrl(photoList[photoIndex])}
                  alt={report.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
                <ZoomIn
                  size={14}
                  className="absolute top-2.5 right-2.5 z-2 text-white/80 drop-shadow pointer-events-none"
                />
                <span
                  className={`absolute bottom-3 left-4 z-2 max-w-[calc(100%-32px)] truncate rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest shadow-sm ${status.color}`}
                >
                  {status.label}
                </span>
                {photoList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoIndex((i) =>
                          i > 0 ? i - 1 : photoList.length - 1,
                        );
                      }}
                      className="absolute left-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
                    >
                      <ChevronLeft size={15} strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoIndex((i) =>
                          i < photoList.length - 1 ? i + 1 : 0,
                        );
                      }}
                      className="absolute right-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
                    >
                      <ChevronRight size={15} strokeWidth={2.5} />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-300">
                <Navigation size={22} className="text-gray-300" />
                <span
                  className={`max-w-[calc(100%-32px)] truncate rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${status.color}`}
                >
                  {status.label}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 p-4">
            <div className="space-y-2">
              <h4 className="font-extrabold text-base leading-snug text-gray-950">
                {report.title}
              </h4>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex max-w-full items-center rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-[#db2744]">
                  {categoryLabel}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex min-w-0 items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm ring-1 ring-gray-100">
                  <Navigation size={13} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-gray-400">
                    Koordinat
                  </p>
                  <p className="break-all font-mono text-[11px] font-bold text-gray-700">
                    {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100 ${report.dinas ? "text-[#db2744]" : "text-gray-400"}`}
                >
                  <Building2 size={13} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-gray-400">
                    Dinas
                  </p>
                  <p className="truncate text-[12px] font-bold text-gray-800">
                    {report.dinas ? (
                      report.dinas.name
                    ) : (
                      <span className="text-gray-400 italic">
                        Menunggu instansi
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {renderVoteControls()}
            </div>

            {detailText && (
              <div>
                <p
                  className={`text-xs text-gray-500 leading-relaxed transition-all duration-300 ${!isExpanded ? "line-clamp-3" : ""}`}
                >
                  {detailText}
                </p>
                {detailText.length > 150 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    className="text-[10px] font-bold text-[#db2744] hover:text-rose-700 transition-colors mt-1"
                  >
                    {isExpanded ? "Ringkas" : "Selengkapnya"}
                  </button>
                )}
              </div>
            )}

            {(agencyNote || resolutionNote) && (
              <div className="space-y-1.5">
                {agencyNote && (
                  <div className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2">
                    <p className="text-[8.5px] font-black uppercase tracking-widest text-sky-600 mb-0.5">
                      Update Dinas
                    </p>
                    <p className="text-[10.5px] leading-relaxed text-sky-900">
                      {agencyNote}
                    </p>
                  </div>
                )}
                {resolutionNote && (
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
                    <p className="text-[8.5px] font-black uppercase tracking-widest text-emerald-600 mb-0.5">
                      Hasil Penanganan
                    </p>
                    <p className="text-[10.5px] leading-relaxed text-emerald-900">
                      {resolutionNote}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <User size={10} className="text-gray-500" />
                </div>
                <span className="text-[10.5px] font-semibold text-gray-500 truncate">
                  {maskCitizenName(report.createdBy?.name)}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Clock size={10} className="text-gray-400" />
                <span className="text-[10px] font-medium text-gray-400">
                  {new Date(report.createdAt).toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <aside className="min-w-0 overflow-y-auto bg-white p-4">
          <div className="flex items-center justify-between mb-3 pr-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Riwayat
            </p>
            {timelineCount > 5 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllTimeline((v) => !v);
                }}
                className="text-[9px] font-bold text-[#db2744] hover:text-rose-600 transition-colors"
              >
                {showAllTimeline ? "Ringkas" : `+${timelineCount - 5} lagi`}
              </button>
            )}
          </div>

          <div className="relative">
            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gray-100" />
            <div className="space-y-3.5">
              {timelineItems.map((item, index) => {
                const timelineStatus = CITIZEN_REPORT_STATUS_MAP[
                  item.status
                ] || {
                  label: item.status,
                  color: "bg-gray-100 text-gray-600 border-gray-200",
                };
                return (
                  <div key={item.id} className="flex gap-3 relative">
                    <div
                      className={`relative z-10 mt-0.5 shrink-0 w-3 h-3 rounded-full border-2 bg-white ${index === 0 ? "border-[#db2744]" : "border-gray-300"}`}
                    />
                    <div className="min-w-0 flex-1 pb-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${timelineStatus.color}`}
                        >
                          {timelineStatus.label}
                        </span>
                        <span className="text-[9px] font-medium text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-[11px] leading-relaxed text-gray-600">
                          {item.note}
                        </p>
                      )}
                      {item.images.length > 0 && (
                        <div className="mt-2 flex gap-1.5">
                          {item.images.slice(0, 3).map((url, imageIndex) => (
                            <button
                              key={`${url}-${imageIndex}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPhotoClick(
                                  item.images.map(resolvePhotoUrl),
                                  imageIndex,
                                );
                              }}
                              className="overflow-hidden rounded-md group relative"
                            >
                              <img
                                src={resolvePhotoUrl(url)}
                                alt={`Bukti riwayat ${imageIndex + 1}`}
                                className="h-11 w-14 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-md" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col bg-white overflow-y-auto ${
        fullWidth
          ? "w-full min-w-0 overflow-visible"
          : "w-[300px] max-w-[calc(100vw-24px)] max-h-[min(80vh,580px)]"
      }`}
    >
      {/* Hero image */}
      <div
        className={`relative shrink-0 bg-gray-100 ${fullWidth ? "h-40 sm:h-52" : "h-48"}`}
      >
        {hasHeroPhotos ? (
          <>
            <button
              type="button"
              className="absolute inset-0 z-1 h-full w-full cursor-zoom-in"
              onClick={(e) => {
                e.stopPropagation();
                onPhotoClick(photoList.map(resolvePhotoUrl), photoIndex);
              }}
            />
            <img
              src={resolvePhotoUrl(photoList[photoIndex])}
              alt={report.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
            <ZoomIn
              size={14}
              className="absolute top-2.5 right-2.5 z-2 text-white/80 drop-shadow pointer-events-none"
            />
            <span
              className={`absolute bottom-3 left-3 z-2 max-w-[calc(100%-24px)] truncate rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest shadow-sm ${status.color}`}
            >
              {status.label}
            </span>
            {photoList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoIndex((i) =>
                      i > 0 ? i - 1 : photoList.length - 1,
                    );
                  }}
                  className="absolute left-2 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
                >
                  <ChevronLeft size={14} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoIndex((i) =>
                      i < photoList.length - 1 ? i + 1 : 0,
                    );
                  }}
                  className="absolute right-2 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
                >
                  <ChevronRight size={14} strokeWidth={2.5} />
                </button>
                <div className="absolute bottom-3 right-3 z-2 flex items-center gap-1 pointer-events-none">
                  {photoList.map((_: string, idx: number) => (
                    <div
                      key={idx}
                      className={`h-1 rounded-full transition-all duration-300 ${idx === photoIndex ? "bg-white w-4" : "bg-white/40 w-1"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-300">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Navigation size={18} className="text-gray-300" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">
              Tidak ada foto
            </span>
            <span
              className={`max-w-[calc(100%-32px)] truncate rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${status.color}`}
            >
              {status.label}
            </span>
          </div>
        )}
      </div>

      {/* Info block */}
      <div
        className={`flex flex-col gap-3 ${fullWidth ? "px-4 pt-3.5 pb-5 sm:px-5" : "px-4 pt-3.5 pb-4"}`}
      >
        {/* Title + category */}
        <div>
          <h4 className="font-extrabold text-[15px] leading-snug text-gray-900 line-clamp-2 mb-1">
            {report.title}
          </h4>
          <span className="inline-block max-w-full truncate rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold px-2.5 py-0.5">
            {categoryLabel}
          </span>
        </div>

        {/* Koordinat + Dinas */}
        <div className="space-y-2">
          <div className="flex items-start gap-2.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 min-w-0">
            <Navigation size={11} className="mt-0.5 shrink-0 text-gray-400" />
            <div className="min-w-0">
              <p className="text-[8.5px] font-black uppercase tracking-[0.15em] text-gray-400 mb-0.5">
                Koordinat
              </p>
              <p className="text-[11px] font-mono font-semibold text-gray-600 break-all">
                {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 min-w-0">
            <Building2
              size={11}
              className={`mt-0.5 shrink-0 ${report.dinas ? "text-[#db2744]" : "text-gray-400"}`}
            />
            <div className="min-w-0">
              <p className="text-[8.5px] font-black uppercase tracking-[0.15em] text-gray-400 mb-0.5">
                Dinas
              </p>
              <p className="text-[11px] font-semibold text-gray-700 truncate">
                {report.dinas ? (
                  report.dinas.name
                ) : (
                  <span className="text-gray-400 italic">
                    Menunggu instansi
                  </span>
                )}
              </p>
            </div>
          </div>

          {renderVoteControls(true)}
        </div>

        {/* Description */}
        {detailText && (
          <div>
            <p
              className={`text-[11.5px] text-gray-500 leading-relaxed transition-all duration-300 ${!isExpanded ? "line-clamp-3" : ""}`}
            >
              {detailText}
            </p>
            {detailText.length > 120 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-[10px] font-bold text-[#db2744] hover:text-rose-700 transition-colors mt-1"
              >
                {isExpanded ? "Ringkas" : "Selengkapnya"}
              </button>
            )}
          </div>
        )}

        {/* Agency / resolution notes */}
        {(agencyNote || resolutionNote) && (
          <div className="space-y-1.5">
            {agencyNote && (
              <div className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2">
                <p className="text-[8.5px] font-black uppercase tracking-widest text-sky-600 mb-0.5">
                  Update Dinas
                </p>
                <p className="text-[10.5px] leading-relaxed text-sky-900">
                  {agencyNote}
                </p>
              </div>
            )}
            {resolutionNote && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
                <p className="text-[8.5px] font-black uppercase tracking-widest text-emerald-600 mb-0.5">
                  Hasil Penanganan
                </p>
                <p className="text-[10.5px] leading-relaxed text-emerald-900">
                  {resolutionNote}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Riwayat */}
        {hasTimelineColumn && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                Riwayat
              </p>
              {timelineCount > 5 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllTimeline((v) => !v);
                  }}
                  className="text-[9px] font-bold text-[#db2744] hover:text-rose-600 transition-colors"
                >
                  {showAllTimeline ? "Ringkas" : `+${timelineCount - 5} lagi`}
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gray-100" />
              <div className="space-y-4">
                {timelineItems.map((item, index) => {
                  const timelineStatus = CITIZEN_REPORT_STATUS_MAP[
                    item.status
                  ] || {
                    label: item.status,
                    color: "bg-gray-100 text-gray-600 border-gray-200",
                  };
                  return (
                    <div key={item.id} className="flex gap-3 relative">
                      <div
                        className={`relative z-10 mt-0.5 shrink-0 w-3 h-3 rounded-full border-2 bg-white ${index === 0 ? "border-[#db2744]" : "border-gray-300"}`}
                      />
                      <div className="min-w-0 flex-1 pb-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${timelineStatus.color}`}
                          >
                            {timelineStatus.label}
                          </span>
                          <span className="text-[9px] font-medium text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString(
                              "id-ID",
                            )}
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-[11px] leading-relaxed text-gray-600">
                            {item.note}
                          </p>
                        )}
                        {item.images.length > 0 && (
                          <div className="mt-2 flex gap-1.5">
                            {item.images.slice(0, 3).map((url, imageIndex) => (
                              <button
                                key={`${url}-${imageIndex}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPhotoClick(
                                    item.images.map(resolvePhotoUrl),
                                    imageIndex,
                                  );
                                }}
                                className="overflow-hidden rounded-md group relative"
                              >
                                <img
                                  src={resolvePhotoUrl(url)}
                                  alt={`Bukti riwayat ${imageIndex + 1}`}
                                  className="h-11 w-14 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-md" />
                              </button>
                            ))}
                            {item.images.length > 3 && (
                              <div className="h-11 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                                <span className="text-[9px] font-black text-gray-500">
                                  +{item.images.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Reporter + date */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <User size={10} className="text-gray-500" />
            </div>
            <span className="text-[10.5px] font-semibold text-gray-500 truncate">
              {maskCitizenName(report.createdBy?.name)}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Clock size={10} className="text-gray-400" />
            <span className="text-[10px] font-medium text-gray-400">
              {new Date(report.createdAt).toLocaleDateString("id-ID")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  onOpenMyReports,
  isVoting,
}: {
  report: ReportLocation;
  onPhotoClick: (imgs: string[], idx: number) => void;
  onVote: (report: ReportLocation, vote: ReportVoteValue) => void;
  onOpenMyReports?: (report: ReportLocation) => void;
  isVoting?: boolean;
}) {
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
  const progressText = isClarificationRequested
    ? progressTimeline?.note || report.agencyNote || null
    : report.resolutionNote ||
      report.agencyNote ||
      progressTimeline?.note ||
      null;
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
                Balas di Laporanku
              </button>
            )}
          </div>
        )}
      </footer>
    </motion.article>
  );
}

function CitizenSocialFeed({
  reports,
  onPhotoClick,
  onVote,
  onOpenMyReports,
  onLoadMore,
  hasNextPage,
  isLoading,
  isFetchingNextPage,
  votingReportId,
}: {
  reports: ReportLocation[];
  onPhotoClick: (imgs: string[], idx: number) => void;
  onVote: (report: ReportLocation, vote: ReportVoteValue) => void;
  onOpenMyReports: (report: ReportLocation) => void;
  onLoadMore: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  votingReportId?: string | null;
}) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const sortedReports = [...reports].sort(
    (a, b) =>
      (b.voteScore ?? 0) - (a.voteScore ?? 0) ||
      (b.upvotes ?? 0) - (a.upvotes ?? 0) ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

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
    <div className="absolute inset-0 z-10 overflow-y-auto bg-[#f3f4f6] px-3 pb-28 pt-36 sm:px-5 sm:pb-36 sm:pt-24 md:px-8 md:pt-28">
      <div className="z-0 mb-4 border-b border-gray-200/70 bg-[#f3f4f6] pb-3  sm:top-0 sm:z-10 sm:-mx-5 sm:bg-[#f3f4f6]/95 sm:px-5 sm:pt-1 sm:backdrop-blur md:-mx-8 md:px-8">
        <div className="mx-auto flex w-full max-w-2xl items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-black tracking-tight text-gray-950">
              Isu Terkini
            </h2>
            <p className="text-xs font-bold text-gray-400">
              {sortedReports.length} laporan warga
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

function AgencyPopupCarousel({
  agency,
  onPhotoClick,
}: {
  agency: any;
  onPhotoClick: (imgs: string[], idx: number) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!agency.photos || agency.photos.length === 0) {
    if (agency.photoUrl) {
      const url = resolvePhotoUrl(agency.photoUrl);
      return (
        <button
          type="button"
          className="w-full h-[120px] bg-gray-100 relative block"
          onClick={(e) => {
            e.stopPropagation();
            onPhotoClick([url], 0);
          }}
        >
          <img
            src={url}
            alt={agency.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ZoomIn
              size={20}
              className="text-white opacity-0 hover:opacity-100 transition-opacity drop-shadow"
            />
          </div>
        </button>
      );
    }
    return null;
  }

  const photos: string[] = agency.photos;

  return (
    <div className="w-full h-[120px] bg-gray-100 relative group overflow-hidden">
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-zoom-in z-[1]"
        onClick={(e) => {
          e.stopPropagation();
          onPhotoClick(photos.map(resolvePhotoUrl), currentIndex);
        }}
      />
      <img
        src={resolvePhotoUrl(photos[currentIndex])}
        alt={agency.name}
        className="w-full h-full object-cover transition-all"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      <ZoomIn
        size={16}
        className="absolute top-2 right-2 text-white drop-shadow opacity-70 pointer-events-none z-[2]"
      />

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) =>
                prev > 0 ? prev - 1 : photos.length - 1,
              );
            }}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-[2px] transition-all hover:bg-black/60 active:scale-95 z-10 focus:outline-none shadow-sm"
          >
            <ChevronLeft size={15} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) =>
                prev < photos.length - 1 ? prev + 1 : 0,
              );
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-[2px] transition-all hover:bg-black/60 active:scale-95 z-10 focus:outline-none shadow-sm"
          >
            <ChevronRight size={15} strokeWidth={2.5} />
          </button>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            {photos.map((_: any, idx: number) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-white w-3" : "bg-white/50 w-1.5"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function CitizenDashboard() {
  const { data: session } = authClient.useSession();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMyReportsOpen, setIsMyReportsOpen] = useState(false);
  const [mode, setMode] = useState<InteractionMode>("idle");
  const { viewMode, setViewMode, setMobileControls } = useDashboardViewMode();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [markerLocation, setMarkerLocation] = useState<[number, number] | null>(
    null,
  );
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [myReportsSearch, setMyReportsSearch] = useState("");
  const [debouncedMyReportsSearch, setDebouncedMyReportsSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState<{
    name: string;
    coords: [number, number];
  } | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [selectedMobileReport, setSelectedMobileReport] =
    useState<ReportLocation | null>(null);
  const [reportSheetHeight, setReportSheetHeight] = useState(68);
  const reportSheetResizeRef = useRef<{
    startY: number;
    startHeight: number;
  } | null>(null);
  const reportSheetResizeMovedRef = useRef(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef | null>(null);

  const openLightbox = useCallback(
    (images: string[], index: number) => setLightbox({ images, index }),
    [],
  );
  const closeLightbox = useCallback(() => setLightbox(null), []);

  // API Queries
  const { data: publicReportsData } = useGetReportLocations();
  const { data: myReportsData } = useQueryGetMyReports(
    { search: debouncedMyReportsSearch },
    { enabled: !!session?.user },
  );
  const { data: agenciesData } = useGetAgencyLocations();
  const feedSearchQuery =
    viewMode === "feed" ? debouncedSearchQuery.trim() : "";
  const feedReportsQuery = useInfiniteQueryGetReportLocations(
    {
      scope: "all",
      limit: 5,
      search: feedSearchQuery || undefined,
      sort: "top",
    },
    { enabled: !!session?.user && viewMode === "feed" },
  );
  const { data: searchResultsData, isFetching: isSearching } =
    useQuerySearchLocation(debouncedSearchQuery, {
      enabled: viewMode === "map",
    });
  const searchResults = searchResultsData ?? EMPTY_SEARCH_RESULTS;
  const queryClient = useQueryClient();

  const publicReports = publicReportsData?.data || [];
  const myReports = myReportsData?.data || [];
  const agencies = agenciesData?.data || [];
  const visibleReportIds = new Set<string>();
  const visibleReports = [...publicReports, ...myReports].filter((report) => {
    if (report.status === "rejected" || visibleReportIds.has(report.id)) {
      return false;
    }
    visibleReportIds.add(report.id);
    return true;
  });
  const feedReportIds = new Set<string>();
  const visibleFeedReports = (
    feedReportsQuery.data?.pages.flatMap((page) => page.data) ?? []
  ).filter((report) => {
    if (feedReportIds.has(report.id)) {
      return false;
    }
    feedReportIds.add(report.id);
    return true;
  });

  const refreshDashboardData = async () => {
    await Promise.allSettled([
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.MY_REPORTS],
        type: "active",
      }),
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.REPORTS_LOCATIONS],
        type: "active",
      }),
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.NOTIFICATIONS_UNREAD_COUNT],
        type: "active",
      }),
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.NOTIFICATIONS],
        type: "active",
      }),
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] }),
    ]);
  };

  const getApiErrorMessage = (error: unknown, fallback: string) =>
    axios.isAxiosError<{ error?: string; message?: string }>(error)
      ? error.response?.data?.error ||
        error.response?.data?.message ||
        error.message
      : error instanceof Error
        ? error.message
        : fallback;

  const createReport = useCreateReport({
    onSuccess: async (res) => {
      setIsFormOpen(false);
      setMode("idle");
      setTitle("");
      setDescription("");
      setPhotoPreviews([]);
      setPhotoFiles([]);
      setMarkerLocation(null);
      await refreshDashboardData();

      const aiReview = res.data?.aiReview;
      if (res.data?.status === "rejected" || aiReview?.statusAi === "ditolak") {
        toast.error("Laporan Ditolak AI", {
          description:
            aiReview?.alasanAi || "Laporan ambigu atau tidak relevan.",
          duration: 5000,
        });
      } else {
        toast.success("Laporan Berhasil Dibuat!", {
          description: "Laporan Anda telah masuk dan sedang diproses.",
        });
      }
    },
    onError: (error: unknown) => {
      console.error("Failed to create report", error);
      const errorMessage = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : "Gagal membuat laporan terbaru.";

      toast.error("Gagal", {
        description: errorMessage,
      });
    },
  });

  const submitClarification = useMutationSubmitReportClarification({
    onSuccess: async () => {
      await refreshDashboardData();
      toast.success("Klarifikasi terkirim", {
        description: "Balasan Anda sudah masuk ke riwayat laporan.",
      });
    },
    onError: (error: unknown) => {
      toast.error("Gagal mengirim klarifikasi", {
        description: getApiErrorMessage(
          error,
          "Coba kirim ulang beberapa saat lagi.",
        ),
      });
    },
  });

  const voteReport = useMutationVoteReport({
    onSuccess: async (response) => {
      setSelectedMobileReport((currentReport) =>
        currentReport?.id === response.data.id
          ? { ...currentReport, ...response.data }
          : currentReport,
      );
      await refreshDashboardData();
    },
    onError: (error: unknown) => {
      toast.error("Gagal menyimpan vote", {
        description: getApiErrorMessage(
          error,
          "Coba vote ulang beberapa saat lagi.",
        ),
      });
    },
  });

  const rateReport = useMutationRateReport({
    onSuccess: async () => {
      await refreshDashboardData();
      toast.success("Rating tersimpan", {
        description:
          "Terima kasih, penilaian Anda membantu kualitas layanan dinas.",
      });
    },
    onError: (error: unknown) => {
      toast.error("Gagal menyimpan rating", {
        description: getApiErrorMessage(
          error,
          "Coba kirim ulang beberapa saat lagi.",
        ),
      });
    },
  });

  const handleSubmitClarification = async (
    reportId: string,
    note: string,
    images: File[],
  ) => {
    await submitClarification.mutateAsync({
      id: reportId,
      payload: { note, images },
    });
  };

  const handleVoteReport = (report: ReportLocation, vote: ReportVoteValue) => {
    voteReport.mutate({
      id: report.id,
      payload: { vote },
    });
  };

  const handleRateReport = async (
    reportId: string,
    score: number,
    note: string,
  ) => {
    await rateReport.mutateAsync({
      id: reportId,
      payload: { score, note },
    });
  };

  const handleSubmitReport = () => {
    if (!title.trim() || !description.trim() || !markerLocation) return;

    createReport.mutate({
      title,
      description,
      latitude: selectedLocation[1],
      longitude: selectedLocation[0],
      address: searchedLocation?.name,
      images: photoFiles,
    });
  };

  const [viewport, setViewport] = useState({
    center: [106.8229, -6.1944] as [number, number],
    zoom: 12,
    pitch: 45,
    bearing: 0,
  });

  const selectedLocation = markerLocation || viewport.center;
  const mapFocusPadding = useMemo(
    () =>
      isDesktop
        ? { top: 32, bottom: 32, left: 32, right: 32 }
        : { top: 112, bottom: 104, left: 20, right: 20 },
    [isDesktop],
  );

  const focusMapOnCoordinates = useCallback(
    (coords: [number, number], zoom = 15) => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: coords,
          zoom,
          duration: 1200,
          padding: mapFocusPadding,
        });
        return;
      }

      setViewport((prev) => ({ ...prev, center: coords, zoom }));
    },
    [mapFocusPadding],
  );

  const startReportSheetResize = (event: ReactPointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    reportSheetResizeMovedRef.current = false;
    reportSheetResizeRef.current = {
      startY: event.clientY,
      startHeight: reportSheetHeight,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const resizeState = reportSheetResizeRef.current;
      if (!resizeState) return;

      const deltaY = resizeState.startY - moveEvent.clientY;
      if (Math.abs(deltaY) > 2) {
        reportSheetResizeMovedRef.current = true;
      }

      const nextHeight =
        resizeState.startHeight + (deltaY / window.innerHeight) * 100;
      setReportSheetHeight(Math.min(92, Math.max(44, nextHeight)));
    };

    const handlePointerUp = () => {
      reportSheetResizeRef.current = null;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.longitude, pos.coords.latitude]);
      },
      () => {}, // silently fail
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideDesktopSearch = searchRef.current?.contains(target);
      const isInsideMobileSearch = mobileSearchRef.current?.contains(target);

      if (!isInsideDesktopSearch && !isInsideMobileSearch) {
        setShowSearch(false);
      }
    };
    if (showSearch) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMyReportsSearch(myReportsSearch);
    }, 400);

    return () => clearTimeout(timer);
  }, [myReportsSearch]);

  useEffect(() => {
    setShowSearch(false);

    if (viewMode === "feed") {
      setMode("idle");
      setSelectedMobileReport(null);
    }
  }, [viewMode]);

  const handleSelectPlace = useCallback(
    (place: SearchResult) => {
      setViewMode("map");
      focusMapOnCoordinates([place.lng, place.lat], 15);
      setSearchedLocation({ name: place.name, coords: [place.lng, place.lat] });
      setSearchQuery("");
      setShowSearch(false);
    },
    [focusMapOnCoordinates, setViewMode],
  );

  const togglePinMode = useCallback(() => {
    setViewMode("map");
    if (mode === "pin_drop") {
      setMode("idle");

      setMarkerLocation(viewport.center);
    } else {
      setMode("pin_drop");
      setMarkerLocation(null);
      setIsFormOpen(false);
    }
  }, [mode, setViewMode, viewport.center]);

  const handleCreateReport = useCallback(() => {
    setViewMode("map");
    if (isFormOpen) {
      setIsFormOpen(false);
      return;
    }

    if (!markerLocation) {
      setMarkerLocation(viewport.center);
    }
    setIsFormOpen(true);
    setMode("idle");
  }, [isFormOpen, markerLocation, setViewMode, viewport.center]);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      // Check maximum 5 files
      if (photoFiles.length + newFiles.length > 5) {
        toast.error("Maksimal 5 foto per laporan");
        return;
      }
      const urls = newFiles.map((file) => URL.createObjectURL(file));
      setPhotoFiles((prev) => [...prev, ...newFiles]);
      setPhotoPreviews((prev) => [...prev, ...urls]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const mobileNavbarControls = useMemo(
    () => (
      <div ref={mobileSearchRef} className="relative">
        {viewMode === "map" && (
          <LocationSearchResultsDropdown
            isOpen={showSearch}
            query={searchQuery}
            isLoading={isSearching || searchQuery !== debouncedSearchQuery}
            results={searchResults}
            onSelectPlace={handleSelectPlace}
            className="absolute left-0 right-0 top-[46px] z-60 max-h-[220px]"
          />
        )}

        <div className="flex h-10 items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-1.5 shadow-inner">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1">
            <Search
              size={14}
              strokeWidth={2.5}
              className="shrink-0 text-[#db2744]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setShowSearch(viewMode === "map");
              }}
              onFocus={() => setShowSearch(viewMode === "map")}
              placeholder={
                viewMode === "map" ? "Cari lokasi..." : "Cari isu..."
              }
              className="min-w-0 flex-1 bg-transparent py-1.5 text-xs font-bold text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>

          <button
            type="button"
            onClick={togglePinMode}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
              mode === "pin_drop"
                ? "bg-[#db2744] text-white shadow-sm shadow-red-500/20"
                : "text-gray-500 hover:bg-white hover:text-gray-900"
            }`}
            aria-label={mode === "pin_drop" ? "Pilih lokasi" : "Tandai lokasi"}
          >
            {mode === "pin_drop" ? (
              <Check size={15} strokeWidth={2.5} />
            ) : (
              <Target size={15} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMyReportsOpen((open) => !open)}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
              isMyReportsOpen
                ? "bg-[#db2744] text-white shadow-sm shadow-red-500/20"
                : "text-gray-500 hover:bg-white hover:text-gray-900"
            }`}
            aria-label="Buka Laporanku"
          >
            <ListFilter size={15} strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={handleCreateReport}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
              isFormOpen
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-[#db2744] text-white shadow-sm shadow-red-500/20 hover:bg-rose-600"
            }`}
            aria-label={isFormOpen ? "Tutup form laporan" : "Buat laporan"}
          >
            {isFormOpen ? (
              <X size={15} strokeWidth={2.5} />
            ) : (
              <Plus size={16} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    ),
    [
      debouncedSearchQuery,
      handleCreateReport,
      handleSelectPlace,
      isFormOpen,
      isMyReportsOpen,
      isSearching,
      mode,
      searchQuery,
      searchResults,
      showSearch,
      togglePinMode,
      viewMode,
    ],
  );

  useEffect(() => {
    setMobileControls(mobileNavbarControls);
  }, [mobileNavbarControls, setMobileControls]);

  useEffect(() => () => setMobileControls(null), [setMobileControls]);

  return (
    <div className="relative w-full h-full bg-gray-100 flex overflow-hidden">
      <div className="flex-1 relative h-full rounded-r-3xl md:rounded-none overflow-hidden">
        <Map
          ref={mapRef}
          viewport={viewport}
          onViewportChange={setViewport}
          theme="light"
          className="w-full h-full"
        >
          <MapControls
            position="top-right"
            showZoom
            showLocate
            locateZoom={14}
            locatePadding={mapFocusPadding}
            onLocate={({ longitude, latitude }) => {
              setUserLocation([longitude, latitude]);
            }}
          />

          {visibleReports.map((report) => (
            <MapMarker
              key={report.id}
              longitude={report.lng}
              latitude={report.lat}
              onClick={
                !isDesktop
                  ? () => {
                      setReportSheetHeight(68);
                      setSelectedMobileReport(report);
                    }
                  : undefined
              }
            >
              {isDesktop && (
                <MarkerPopup
                  closeButton
                  className="overflow-hidden rounded-sm border border-gray-100 bg-white p-0 shadow-[0_18px_44px_rgba(15,23,42,0.18)]"
                >
                  <ReportPopup
                    report={report}
                    onPhotoClick={openLightbox}
                    onVote={handleVoteReport}
                    isVoting={
                      voteReport.isPending &&
                      voteReport.variables?.id === report.id
                    }
                  />
                </MarkerPopup>
              )}
              <MarkerContent className="[&>*]:!z-[10]">
                <div
                  className="w-10 h-10 -mt-5 -ml-5 bg-[#db2744]/20 rounded-full flex items-center justify-center"
                  style={{ zIndex: 10 }}
                >
                  <div className="w-6 h-6 bg-[#db2744] hover:bg-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 transition-colors border-2 border-white">
                    <AlertTriangle
                      size={12}
                      className="text-white"
                      strokeWidth={3}
                    />
                  </div>
                </div>
              </MarkerContent>
            </MapMarker>
          ))}

          {agencies.map((agency, idx) => (
            <MapMarker
              key={`agency-${agency.id || idx}`}
              longitude={agency.lng}
              latitude={agency.lat}
            >
              <MarkerPopup
                closeButton
                className="overflow-hidden rounded-sm border border-gray-100 bg-white p-0 shadow-[0_18px_44px_rgba(15,23,42,0.18)]"
              >
                <div className="w-[200px] flex flex-col overflow-hidden">
                  <AgencyPopupCarousel
                    agency={agency}
                    onPhotoClick={openLightbox}
                  />
                  <div className="p-3 pb-4 flex flex-col gap-1.5 relative">
                    <div
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm w-fit truncate max-w-full ${agency.photos?.length > 0 || agency.photoUrl ? "text-indigo-600 bg-indigo-50 absolute -top-8 left-3 shadow-md border border-indigo-100/50" : "text-indigo-600 bg-indigo-50"}`}
                    >
                      {agency.type?.replace(/_/g, " ") || "Dinas"}
                    </div>
                    <div className="text-xs font-bold text-gray-900 leading-tight">
                      {agency.name}
                    </div>
                  </div>
                </div>
              </MarkerPopup>
              <MarkerContent>
                <div
                  className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-indigo-200 shadow-lg flex items-center justify-center -mt-4 text-indigo-600 hover:scale-110 hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all cursor-pointer"
                  style={{ zIndex: 20 }}
                >
                  <Building2 size={14} strokeWidth={2.5} />
                </div>
              </MarkerContent>
            </MapMarker>
          ))}

          {searchedLocation && (
            <MapMarker
              longitude={searchedLocation.coords[0]}
              latitude={searchedLocation.coords[1]}
            >
              <MarkerContent>
                <div
                  className="flex flex-col items-center -mt-10 pointer-events-none"
                  style={{ zIndex: 30 }}
                >
                  <div className="bg-white text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg mb-1 border border-gray-200 max-w-[140px] truncate">
                    {searchedLocation.name}
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <Navigation
                      size={14}
                      className="text-white"
                      fill="white"
                      strokeWidth={0}
                    />
                  </div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-0.5 opacity-50" />
                </div>
              </MarkerContent>
            </MapMarker>
          )}

          {/* Layer 4: Lokasi user */}
          {userLocation && (
            <MapMarker longitude={userLocation[0]} latitude={userLocation[1]}>
              <MarkerContent>
                <div
                  className="flex flex-col items-center -mt-6 pointer-events-none"
                  style={{ zIndex: 40 }}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center animate-ping absolute inset-0" />
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-emerald-500 relative z-10 overflow-hidden">
                      {session?.user?.image ? (
                        <img
                          src={session.user.image}
                          alt="Profil Anda"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                          <User
                            size={18}
                            className="text-emerald-600"
                            strokeWidth={2.5}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-200 shadow-sm">
                    Lokasi Anda
                  </span>
                </div>
              </MarkerContent>
            </MapMarker>
          )}

          {/* Layer 5 (teratas): Pin drop mode */}
          {mode === "pin_drop" && (
            <MapMarker
              longitude={viewport.center[0]}
              latitude={viewport.center[1]}
            >
              <MarkerContent>
                <div
                  className="flex flex-col items-center -mt-8 pointer-events-none"
                  style={{ zIndex: 100 }}
                >
                  <div className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg mb-1.5 animate-bounce">
                    Geser Peta ke Lokasi
                  </div>
                  <div className="w-10 h-10 flex items-center justify-center">
                    <MapPin
                      size={38}
                      className="text-[#db2744] drop-shadow-xl"
                      fill="#db2744"
                      stroke="white"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </MarkerContent>
            </MapMarker>
          )}

          {/* Layer 5 (teratas): Marker lokasi laporan yang dipilih */}
          {markerLocation && mode === "idle" && (
            <MapMarker
              longitude={markerLocation[0]}
              latitude={markerLocation[1]}
              draggable={true}
              onDragEnd={(e: { lng: number; lat: number }) =>
                setMarkerLocation([e.lng, e.lat])
              }
            >
              <MarkerContent>
                <div
                  className="flex flex-col items-center -mt-8 cursor-grab active:cursor-grabbing"
                  style={{ zIndex: 100 }}
                >
                  <div className="bg-[#db2744] text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg mb-1 whitespace-nowrap opacity-90 hover:opacity-100">
                    Bisa digeser
                  </div>
                  <div className="w-10 h-10 flex items-center justify-center">
                    <MapPin
                      size={38}
                      className="text-[#db2744] drop-shadow-xl"
                      fill="#db2744"
                      stroke="white"
                      strokeWidth={2}
                    />
                  </div>
                </div>
              </MarkerContent>
            </MapMarker>
          )}
        </Map>

        {viewMode === "feed" && (
          <CitizenSocialFeed
            reports={visibleFeedReports}
            onPhotoClick={openLightbox}
            onVote={handleVoteReport}
            onOpenMyReports={(report) => {
              setMyReportsSearch(report.title);
              setIsMyReportsOpen(true);
            }}
            onLoadMore={() => {
              if (
                feedReportsQuery.hasNextPage &&
                !feedReportsQuery.isFetchingNextPage
              ) {
                void feedReportsQuery.fetchNextPage();
              }
            }}
            hasNextPage={feedReportsQuery.hasNextPage}
            isLoading={feedReportsQuery.isLoading}
            isFetchingNextPage={feedReportsQuery.isFetchingNextPage}
            votingReportId={
              voteReport.isPending ? voteReport.variables?.id : null
            }
          />
        )}

        <div className="absolute bottom-5 left-0 right-0 z-20 hidden flex-col items-center gap-2 px-4 pointer-events-none sm:flex">
          {/* Search Results Dropdown */}
          {viewMode === "map" && (
            <LocationSearchResultsDropdown
              isOpen={showSearch}
              query={searchQuery}
              isLoading={isSearching || searchQuery !== debouncedSearchQuery}
              results={searchResults}
              onSelectPlace={handleSelectPlace}
              className="max-w-[460px] md:max-w-[600px]"
            />
          )}

          <div
            ref={searchRef}
            className="w-full max-w-[520px] md:max-w-[700px] pointer-events-auto"
          >
            <div className="bg-white rounded-full shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)] border border-gray-100 flex items-center px-2 py-1.5 gap-1">
              <div className="flex items-center flex-1 gap-1 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 min-w-0">
                <Search
                  size={15}
                  strokeWidth={2.5}
                  className="text-[#db2744] shrink-0"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearch(viewMode === "map");
                  }}
                  onFocus={() => setShowSearch(viewMode === "map")}
                  placeholder={
                    viewMode === "map" ? "Cari lokasi..." : "Cari isu..."
                  }
                  className="bg-transparent border-none outline-none text-xs font-bold text-gray-900 placeholder:text-gray-400 w-full py-1.5"
                />
              </div>

              <div className="w-px h-5 bg-gray-200 shrink-0 mx-0.5" />

              <button
                onClick={togglePinMode}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full transition-all duration-300 font-bold shrink-0 ${
                  mode === "pin_drop"
                    ? "bg-[#db2744] text-white shadow-md shadow-red-500/20"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {mode === "pin_drop" ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : (
                  <Target size={16} />
                )}
                <span className="text-xs hidden sm:inline">
                  {mode === "pin_drop" ? "Pilih" : "Tandai"}
                </span>
              </button>

              <div className="w-px h-5 bg-gray-200 shrink-0 mx-0.5" />

              <button
                onClick={() => setIsMyReportsOpen((open) => !open)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full transition-all duration-300 font-bold shrink-0 ${
                  isMyReportsOpen
                    ? "bg-[#db2744] text-white shadow-md shadow-red-500/20"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ListFilter size={16} />
                <span className="text-xs hidden sm:inline">Laporanku</span>
              </button>

              <div className="w-px h-5 bg-gray-200 shrink-0 mx-0.5" />

              <button
                onClick={handleCreateReport}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full transition-all duration-300 font-bold shrink-0 ${
                  isFormOpen
                    ? "bg-gray-900 text-white shadow-md"
                    : "bg-[#db2744] text-white shadow-md shadow-red-500/20 hover:bg-rose-600"
                }`}
              >
                {isFormOpen ? (
                  <X size={16} />
                ) : (
                  <Plus size={16} strokeWidth={2.5} />
                )}
                <span className="text-xs hidden sm:inline">
                  {isFormOpen ? "Tutup" : "Buat Laporan"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <CitizenReportFormPanel
        isOpen={isFormOpen}
        isDesktop={isDesktop}
        title={title}
        description={description}
        photoPreviews={photoPreviews}
        selectedLocation={selectedLocation}
        userLocation={userLocation}
        isSubmitting={createReport.isPending}
        onClose={() => setIsFormOpen(false)}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onPhotoUpload={handlePhotoUpload}
        onRemovePhoto={removePhoto}
        onPhotoClick={openLightbox}
        onEditLocation={() => {
          setIsFormOpen(false);
          setMode("idle");
        }}
        onUseGpsLocation={() => {
          if (!userLocation) return;
          setMarkerLocation(userLocation);
          focusMapOnCoordinates(userLocation, 15);
        }}
        onSubmit={handleSubmitReport}
      />

      {/* My Reports Drawer/Panel */}
      <CitizenMyReportsPanel
        isOpen={isMyReportsOpen}
        isDesktop={isDesktop}
        myReports={myReports}
        myReportsSearch={myReportsSearch}
        statusMap={CITIZEN_REPORT_STATUS_MAP}
        onSearchChange={setMyReportsSearch}
        onClose={() => setIsMyReportsOpen(false)}
        onPhotoClick={openLightbox}
        onSubmitClarification={handleSubmitClarification}
        clarificationSubmittingId={
          submitClarification.isPending
            ? submitClarification.variables?.id
            : null
        }
        onSubmitRating={handleRateReport}
        ratingSubmittingId={
          rateReport.isPending ? rateReport.variables?.id : null
        }
        onFocusReport={(report) => {
          if (report.status !== "rejected") {
            focusMapOnCoordinates([report.lng, report.lat], 15);
          }
        }}
      />

      {/* Mobile report bottom sheet */}
      <AnimatePresence>
        {selectedMobileReport && !isDesktop && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-gray-950/45 backdrop-blur-[2px]"
              onClick={() => setSelectedMobileReport(null)}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                height: `${reportSheetHeight}vh`,
              }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 38 }}
              className="absolute inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_-20px_48px_rgba(15,23,42,0.24)]"
            >
              <button
                type="button"
                onClick={() => {
                  if (reportSheetResizeMovedRef.current) return;
                  setReportSheetHeight((height) => (height > 82 ? 68 : 92));
                }}
                onPointerDown={startReportSheetResize}
                className="flex w-full touch-none justify-center bg-white pt-3 pb-2 cursor-grab active:cursor-grabbing"
                aria-label={
                  reportSheetHeight > 82
                    ? "Perkecil detail laporan"
                    : "Perbesar detail laporan"
                }
              >
                <span className="h-1.5 w-12 rounded-full bg-gray-200" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedMobileReport(null)}
                className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-sm ring-1 ring-gray-200/70 backdrop-blur transition-colors hover:bg-white hover:text-gray-900"
                aria-label="Tutup detail laporan"
              >
                <X size={16} strokeWidth={2.5} />
              </button>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <ReportPopup
                  report={selectedMobileReport}
                  onPhotoClick={openLightbox}
                  onVote={handleVoteReport}
                  isVoting={
                    voteReport.isPending &&
                    voteReport.variables?.id === selectedMobileReport.id
                  }
                  fullWidth
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox && (
          <PhotoLightbox
            images={lightbox.images}
            index={lightbox.index}
            onClose={closeLightbox}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
