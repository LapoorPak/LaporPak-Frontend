import type {
  ChangeEvent,
} from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  Circle,
  ImagePlus,
  Search,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import type { ReportLocation } from "@/api/reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMobileSheetResize } from "@/hooks/common";
import { createObjectUrls, revokeObjectUrls } from "@/lib/object-url";
import { resolvePhotoUrl } from "@/lib/resolve-photo-url";
import type {
  CitizenMyReportsPanelProps,
  ClarificationDraft,
} from "@/types/dashboard";
import { formatMachineText } from "@/pages/dashboard/utils";
import { CitizenRatingControl } from "@/pages/dashboard/components/citizen/CitizenRatingControl";

export function CitizenMyReportsPanel({
  isOpen,
  isDesktop,
  myReports,
  myReportsSearch,
  statusMap,
  onSearchChange,
  onClose,
  onFocusReport,
  onPhotoClick,
  onSubmitClarification,
  onClarificationDraftActiveChange,
  clarificationSubmittingId,
  onSubmitRating,
  ratingSubmittingId,
}: CitizenMyReportsPanelProps) {
  const isEmpty = myReports.length === 0;
  const {
    height: mobileSheetHeight,
    resizeMovedRef: mobileResizeMovedRef,
    setHeight: setMobileSheetHeight,
    startResize: startMobileResize,
  } = useMobileSheetResize({
    enabled: !isDesktop,
    maxHeight: 82,
    resetWhen: isOpen && !isDesktop,
  });
  const [ratingDrafts, setRatingDrafts] = useState<Record<string, { score: number }>>({});
  const [clarificationDrafts, setClarificationDrafts] = useState<Record<string, ClarificationDraft>>({});
  const clarificationDraftsRef = useRef<Record<string, ClarificationDraft>>({});

  useEffect(() => {
    clarificationDraftsRef.current = clarificationDrafts;
  }, [clarificationDrafts]);

  useEffect(() => {
    return () => {
      Object.values(clarificationDraftsRef.current).forEach((draft) => {
        revokeObjectUrls(draft.previews);
      });
    };
  }, []);

  const setRatingScore = (report: ReportLocation, score: number) => {
    const current = ratingDrafts[report.id] ?? {
      score: report.rating?.score ?? 0,
    };
    setRatingDrafts((drafts) => ({ ...drafts, [report.id]: { ...current, score } }));
  };

  const submitRating = async (report: ReportLocation) => {
    const draft = ratingDrafts[report.id] ?? {
      score: report.rating?.score ?? 0,
    };
    if (!draft.score) return;

    await onSubmitRating(report.id, draft.score);
  };

  const getClarificationDraft = (reportId: string) =>
    clarificationDrafts[reportId] ?? { note: "", files: [], previews: [] };

  const setClarificationNote = (report: ReportLocation, note: string) => {
    setClarificationDrafts((drafts) => ({
      ...drafts,
      [report.id]: {
        ...(drafts[report.id] ?? { note: "", files: [], previews: [] }),
        note,
      },
    }));
    onClarificationDraftActiveChange?.(report.id, true);
  };

  const addClarificationFiles = (
    report: ReportLocation,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const nextFiles = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (nextFiles.length === 0) return;

    setClarificationDrafts((drafts) => {
      const current = drafts[report.id] ?? { note: "", files: [], previews: [] };
      const acceptedFiles = nextFiles.slice(0, Math.max(0, 5 - current.files.length));
      if (acceptedFiles.length === 0) return drafts;

      return {
        ...drafts,
        [report.id]: {
          ...current,
          files: [...current.files, ...acceptedFiles],
          previews: [...current.previews, ...createObjectUrls(acceptedFiles)],
        },
      };
    });
    onClarificationDraftActiveChange?.(report.id, true);
    event.target.value = "";
  };

  const removeClarificationFile = (report: ReportLocation, index: number) => {
    setClarificationDrafts((drafts) => {
      const current = drafts[report.id];
      if (!current) return drafts;

      const removed = current.previews[index];
      if (removed) revokeObjectUrls([removed]);

      return {
        ...drafts,
        [report.id]: {
          ...current,
          files: current.files.filter((_, fileIndex) => fileIndex !== index),
          previews: current.previews.filter((_, fileIndex) => fileIndex !== index),
        },
      };
    });
  };

  const submitClarification = async (report: ReportLocation) => {
    const draft = getClarificationDraft(report.id);
    const note = draft.note.trim();
    if (!note) return;

    await onSubmitClarification(report.id, note, draft.files);
    revokeObjectUrls(draft.previews);
    setClarificationDrafts((drafts) => {
      const nextDrafts = { ...drafts };
      delete nextDrafts[report.id];
      return nextDrafts;
    });
    onClarificationDraftActiveChange?.(report.id, false);
  };

  const closePanel = () => {
    if (!isDesktop) {
      setMobileSheetHeight(72);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={isDesktop ? { x: "-100%", opacity: 0 } : { y: "100%", opacity: 0 }}
          animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
          exit={isDesktop ? { x: "-100%", opacity: 0 } : { y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`absolute z-30 pointer-events-none ${isDesktop ? "top-24 left-6" : "bottom-0 left-0 w-full"}`}
        >
          <motion.div
            drag={isDesktop}
            dragMomentum={false}
            animate={
              isDesktop
                ? undefined
                : { height: `${mobileSheetHeight}vh` }
            }
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className={`flex flex-col overflow-hidden pointer-events-auto ${
              isDesktop
                ? `resize h-[calc(100vh-120px)] min-h-[400px] w-[380px] min-w-[320px] max-w-[600px] shadow-2xl rounded-sm border ${
                    isEmpty ? "bg-gray-100 border-gray-200" : "bg-white border-gray-100"
                  }`
                : `w-full rounded-t-2xl shadow-[0_-20px_40px_rgba(15,23,42,0.16)] ${
                    isEmpty ? "bg-gray-100" : "bg-white"
                  }`
            }`}
          >
            {!isDesktop && (
              <button
                type="button"
                onClick={() => {
                  if (mobileResizeMovedRef.current) return;
                  setMobileSheetHeight((height) => (height > 78 ? 72 : 82));
                }}
                onPointerDown={startMobileResize}
                className={`flex w-full touch-none justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing ${
                  isEmpty ? "bg-gray-100" : "bg-white"
                }`}
                aria-label={mobileSheetHeight > 78 ? "Perkecil panel Laporanku" : "Perbesar panel Laporanku"}
              >
                <span className="h-1.5 w-12 rounded-full bg-gray-200" />
              </button>
            )}

            <div
              onPointerDown={!isDesktop ? startMobileResize : undefined}
              className={`px-7 flex touch-none justify-between items-center border-b relative z-10 ${
                isDesktop ? "py-6 cursor-move active:cursor-grabbing" : "pt-3 pb-4 cursor-grab active:cursor-grabbing"
              } ${
                isEmpty ? "bg-gray-100 border-gray-200" : "bg-white border-gray-100"
              }`}
            >
              <div>
                <h3
                  className={`font-heading font-black text-2xl tracking-tight ${
                    isEmpty ? "text-gray-600" : "text-gray-900"
                  }`}
                >
                  Laporanku
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wide">
                  {myReports.length} Laporan Anda
                </p>
              </div>
              <button
                onClick={closePanel}
                onPointerDown={(event) => event.stopPropagation()}
                className={`transition-colors p-2 -mr-2 ${
                  isEmpty ? "text-gray-400 hover:text-gray-500" : "text-gray-400 hover:text-gray-900"
                }`}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div
              className={`px-5 py-3 border-b ${
                isEmpty ? "border-gray-200 bg-gray-100" : "border-gray-100 bg-white"
              }`}
            >
              <div className="relative">
                <Search
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isEmpty ? "text-gray-300" : "text-gray-400"
                  }`}
                  size={16}
                />
                <Input
                  value={myReportsSearch}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Cari laporan saya..."
                  className={`w-full pl-10 h-10 rounded-sm text-sm transition-all ${
                    isEmpty
                      ? "bg-gray-200 border-gray-200 text-gray-400 placeholder:text-gray-400 focus:bg-white focus:border-[#db2744] focus:ring-[#db2744]/10"
                      : "bg-gray-50 border-transparent focus:bg-white focus:border-[#db2744] focus:ring-[#db2744]/10"
                  }`}
                />
              </div>
            </div>

            <div
              className={`flex-1 overflow-y-auto p-4 space-y-3 ${
                isEmpty ? "bg-gray-100" : "bg-gray-50"
              }`}
            >
              {isEmpty ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 pb-20">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mb-4">
                    <AlertTriangle size={32} />
                  </div>
                  <h4 className="font-bold text-gray-600 mb-1">Belum Ada Laporan</h4>
                  <p className="text-sm text-gray-400">Anda belum membuat laporan apapun.</p>
                </div>
              ) : (
                myReports.map((report) => {
                  const status = statusMap[report.status] || { label: report.status, color: "bg-gray-100 text-gray-700" };
                  const agencyNote = report.agencyNote?.trim();
                  const resolutionNote = report.resolutionNote?.trim();
                  const visibleAgencyNote =
                    agencyNote &&
                    !(resolutionNote && (report.status === "resolved" || agencyNote === resolutionNote))
                      ? agencyNote
                      : null;
                  const ratingDraft = ratingDrafts[report.id] ?? {
                    score: report.rating?.score ?? 0,
                  };
                  const isRatingSubmitting = ratingSubmittingId === report.id;
                  const clarificationDraft = getClarificationDraft(report.id);
                  const isClarificationSubmitting = clarificationSubmittingId === report.id;
                  const canReplyClarification = report.status === "clarification_requested";

                  return (
                    <div
                      key={report.id}
                      className={`bg-white p-4 rounded-sm border border-gray-100 shadow-sm ${
                        report.status !== "rejected" ? "cursor-pointer hover:border-gray-200" : ""
                      } transition-colors`}
                      onClick={() => onFocusReport(report)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-bold text-[#111827] text-sm leading-snug line-clamp-1 mb-1.5">{report.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{report.description || report.kategori?.name}</p>

                      <div className="mb-3 flex items-center gap-2 text-[10px] font-black text-gray-500">
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-emerald-700">
                          <ThumbsUp size={11} />
                          {report.upvotes ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2 py-1 text-red-700">
                          <ThumbsDown size={11} />
                          {report.downvotes ?? 0}
                        </span>
                        <span className="text-gray-400">
                          Skor {(report.voteScore ?? 0) > 0 ? `+${report.voteScore}` : report.voteScore ?? 0}
                        </span>
                      </div>

                      {report.status === "rejected" && report.aiReview && (
                        <div className="mb-3 rounded-sm border border-red-100/50 bg-red-50/80 p-2.5">
                          <p className="text-[11px] font-bold text-[#db2744] mb-1">Feedback AI:</p>
                          <p className="text-[10px] text-gray-600 leading-relaxed mb-1">{formatMachineText(report.aiReview.alasanAi)}</p>
                          {report.aiReview.saranPerbaikanAi && (
                            <p className="text-[10px] text-gray-600 leading-relaxed">
                              Saran: <span className="font-medium text-gray-800">{formatMachineText(report.aiReview.saranPerbaikanAi)}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {(visibleAgencyNote || resolutionNote) && (
                        <div className="mb-3 space-y-2">
                          {visibleAgencyNote && (
                            <div className="rounded-sm border border-sky-100 bg-sky-50 px-3 py-2.5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-sky-700 mb-1">
                                Update Dinas
                              </p>
                              <p className="text-[11px] leading-relaxed text-sky-950">
                                {formatMachineText(visibleAgencyNote)}
                              </p>
                            </div>
                          )}

                          {resolutionNote && (
                            <div className="rounded-sm border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1">
                                Hasil Penanganan
                              </p>
                              <p className="text-[11px] leading-relaxed text-emerald-950">
                                {formatMachineText(resolutionNote)}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {canReplyClarification && (
                        <div
                          className="mb-3 rounded-sm border border-violet-100 bg-violet-50/80 p-3"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-violet-700">
                              Balas Klarifikasi
                            </p>
                            <span className="shrink-0 text-[9px] font-black text-violet-500">
                              {clarificationDraft.files.length}/5 foto
                            </span>
                          </div>
                          <Textarea
                            value={clarificationDraft.note}
                            onFocus={() =>
                              onClarificationDraftActiveChange?.(report.id, true)
                            }
                            onBlur={() => {
                              if (
                                !clarificationDraft.note.trim() &&
                                clarificationDraft.files.length === 0
                              ) {
                                onClarificationDraftActiveChange?.(report.id, false);
                              }
                            }}
                            onChange={(event) =>
                              setClarificationNote(report, event.target.value)
                            }
                            placeholder="Tulis jawaban untuk dinas..."
                            className="min-h-[92px] resize-none rounded-sm border-gray-200 bg-white text-xs leading-relaxed focus:border-[#db2744] focus:ring-[#db2744]/10"
                          />

                          {clarificationDraft.previews.length > 0 && (
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {clarificationDraft.previews.map((url, imageIndex) => (
                                <div
                                  key={`${url}-${imageIndex}`}
                                  className="relative h-14 overflow-hidden rounded-sm bg-white"
                                >
                                  <img
                                    src={url}
                                    alt={`Bukti klarifikasi ${imageIndex + 1}`}
                                    className="h-full w-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeClarificationFile(report, imageIndex)
                                    }
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
                              className={`inline-flex h-9 items-center gap-1.5 rounded-sm border border-dashed border-violet-200 bg-white px-3 text-[10px] font-black uppercase tracking-widest text-violet-700 transition-colors ${
                                clarificationDraft.files.length >= 5
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
                                disabled={clarificationDraft.files.length >= 5}
                                className="hidden"
                                onChange={(event) =>
                                  addClarificationFiles(report, event)
                                }
                              />
                            </label>
                            <Button
                              type="button"
                              size="sm"
                              disabled={
                                !clarificationDraft.note.trim() ||
                                isClarificationSubmitting
                              }
                              onClick={() => void submitClarification(report)}
                              className="h-9 rounded-sm bg-violet-700 px-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-violet-800"
                            >
                              <Send size={12} />
                              {isClarificationSubmitting ? "Mengirim..." : "Kirim"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {report.timeline && report.timeline.length > 0 && (
                        <div className="mb-3 rounded-sm border border-gray-100 bg-gray-50 px-3 py-2.5">
                          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Riwayat
                          </p>
                          <div className="space-y-2">
                            {report.timeline.slice(-4).map((item) => {
                              const timelineStatus = statusMap[item.status] || { label: item.status, color: "bg-gray-100 text-gray-700" };
                              return (
                                <div key={item.id} className="relative flex gap-2 text-[11px]">
                                  <Circle size={10} className="mt-1 shrink-0 fill-white text-gray-300" />
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${timelineStatus.color}`}>
                                        {timelineStatus.label}
                                      </span>
                                      <span className="text-[9px] font-semibold text-gray-400">
                                        {new Date(item.createdAt).toLocaleString()}
                                      </span>
                                    </div>
                                    {item.note && (
                                      <p className="mt-1 line-clamp-2 leading-relaxed text-gray-600">{formatMachineText(item.note)}</p>
                                    )}
                                    {item.images.length > 0 && (
                                      <div className="mt-2 flex gap-1.5 overflow-hidden">
                                        {item.images.slice(0, 3).map((url, imageIndex) => (
                                          <button
                                            key={`${url}-${imageIndex}`}
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              onPhotoClick(item.images.map(resolvePhotoUrl), imageIndex);
                                            }}
                                            className="group relative h-12 w-14 overflow-hidden rounded-sm"
                                          >
                                            <img
                                              src={resolvePhotoUrl(url)}
                                              alt={`Bukti timeline ${imageIndex + 1}`}
                                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
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
                      )}

                      {report.status === "resolved" && (
                        <div className="mb-3">
                          <CitizenRatingControl
                            title={report.rating ? "Rating Dinas" : "Beri Rating Dinas"}
                            currentScore={report.rating?.score}
                            averageScore={report.averageRating}
                            ratingCount={report.ratingCount}
                            score={ratingDraft.score}
                            isSubmitting={isRatingSubmitting}
                            onScoreChange={(score) =>
                              setRatingScore(report, score)
                            }
                            onSubmit={() => void submitRating(report)}
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-gray-50 mt-2 pt-2">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={11} className={report.dinas ? "text-[#db2744]" : "text-gray-400"} />
                          <span className={`text-[10px] uppercase tracking-wide font-black ${report.dinas ? "text-[#db2744]" : "text-gray-400"}`}>
                            {report.dinas ? report.dinas.name : "Menunggu Instansi"}
                          </span>
                        </div>
                        {report.routingStatus === "auto_assigned" && (
                          <span className="text-[9px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                            AI Assigned
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
