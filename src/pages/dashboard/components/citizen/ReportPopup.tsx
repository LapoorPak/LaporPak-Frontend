import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { ReportPopupProps } from "@/types/dashboard";
import { createObjectUrls, revokeObjectUrls } from "@/lib/object-url";
import { resolvePhotoUrl } from "@/lib/resolve-photo-url";
import { maskCitizenName } from "@/lib/utils";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ImagePlus,
  Navigation,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
  ZoomIn,
} from "lucide-react";
import { CITIZEN_REPORT_STATUS_MAP } from "@/pages/dashboard/utils";

export function ReportPopup({
  report,
  onPhotoClick,
  onVote,
  isVoting = false,
  fullWidth = false,
  onSubmitClarification,
  clarificationSubmittingId,
  onClarificationDraftActiveChange,
}: ReportPopupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [clarificationDraft, setClarificationDraft] = useState("");
  const [clarificationFiles, setClarificationFiles] = useState<File[]>([]);
  const [clarificationPreviews, setClarificationPreviews] = useState<string[]>(
    [],
  );
  const clarificationPreviewsRef = useRef<string[]>([]);
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
  const isOwnReport = report.ownership === "mine" || report.canEdit;
  const canReplyClarification =
    report.status === "clarification_requested" &&
    isOwnReport &&
    !!onSubmitClarification;
  const isClarificationSubmitting = clarificationSubmittingId === report.id;

  useEffect(() => {
    clarificationPreviewsRef.current = clarificationPreviews;
  }, [clarificationPreviews]);

  useEffect(() => {
    return () => {
      revokeObjectUrls(clarificationPreviewsRef.current);
    };
  }, []);

  const handleClarificationFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (nextFiles.length === 0) return;

    const availableSlots = Math.max(0, 5 - clarificationFiles.length);
    const acceptedFiles = nextFiles.slice(0, availableSlots);
    if (acceptedFiles.length === 0) return;

    setClarificationFiles((current) => [...current, ...acceptedFiles]);
    setClarificationPreviews((current) => [
      ...current,
      ...createObjectUrls(acceptedFiles),
    ]);
    event.target.value = "";
  };

  const removeClarificationFile = (index: number) => {
    setClarificationFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index),
    );
    setClarificationPreviews((current) => {
      const removed = current[index];
      if (removed) revokeObjectUrls([removed]);
      return current.filter((_, fileIndex) => fileIndex !== index);
    });
  };

  const submitClarificationReply = async () => {
    const note = clarificationDraft.trim();
    if (!note || !onSubmitClarification) return;

    await onSubmitClarification(report.id, note, clarificationFiles);
    onClarificationDraftActiveChange?.(report.id, false);
    setClarificationDraft("");
    setClarificationFiles([]);
    setClarificationPreviews((current) => {
      revokeObjectUrls(current);
      return [];
    });
  };

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
  const renderClarificationReply = () => {
    if (!canReplyClarification) return null;

    return (
      <div
        className="rounded-lg border border-violet-100 bg-violet-50/80 p-3"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-violet-700">
            Balas Klarifikasi
          </p>
          <span className="shrink-0 text-[9px] font-black text-violet-500">
            {clarificationFiles.length}/5 foto
          </span>
        </div>
        <textarea
          value={clarificationDraft}
          onFocus={() => onClarificationDraftActiveChange?.(report.id, true)}
          onBlur={(event) => {
            if (!event.currentTarget.value.trim()) {
              onClarificationDraftActiveChange?.(report.id, false);
            }
          }}
          onChange={(event) => {
            setClarificationDraft(event.target.value);
            onClarificationDraftActiveChange?.(report.id, true);
          }}
          placeholder="Tulis jawaban untuk dinas..."
          className="min-h-[78px] w-full resize-none rounded-sm border border-violet-100 bg-white px-3 py-2 text-[11px] leading-relaxed text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-violet-400"
        />

        {clarificationPreviews.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {clarificationPreviews.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative h-14 overflow-hidden rounded-sm bg-white"
              >
                <img
                  src={url}
                  alt={`Bukti klarifikasi ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeClarificationFile(index)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-sm bg-black/65 text-white"
                  aria-label="Hapus foto klarifikasi"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          <label
            className={`inline-flex h-8 items-center gap-1.5 rounded-sm border border-dashed border-violet-200 bg-white px-2.5 text-[9px] font-black uppercase tracking-widest text-violet-700 transition-colors ${
              clarificationFiles.length >= 5
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:border-violet-300"
            }`}
          >
            <ImagePlus size={13} />
            Foto
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={clarificationFiles.length >= 5}
              className="hidden"
              onChange={handleClarificationFiles}
            />
          </label>
          <button
            type="button"
            disabled={!clarificationDraft.trim() || isClarificationSubmitting}
            onClick={() => void submitClarificationReply()}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-violet-700 px-3 text-[9px] font-black uppercase tracking-widest text-white transition-colors hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={12} />
            {isClarificationSubmitting ? "Mengirim" : "Kirim"}
          </button>
        </div>
      </div>
    );
  };

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

            {renderClarificationReply()}

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

        {renderClarificationReply()}

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
