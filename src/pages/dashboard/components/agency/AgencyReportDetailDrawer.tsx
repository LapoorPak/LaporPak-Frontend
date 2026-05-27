import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Clock,
  ImagePlus,
  Hand,
  MapPin,
  Settings,
  Star,
  Trash2,
  User,
  X,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label, RequiredMark } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMobileSheetResize } from "@/hooks/common";
import {
  AGENCY_REPORT_STATUS_MAP,
  formatMachineText,
} from "@/pages/dashboard/utils";
import { resolvePhotoUrl } from "@/lib/resolve-photo-url";
import { maskCitizenName } from "@/lib/utils";
import type { AgencyReportDetailDrawerProps } from "@/types/dashboard";
import {
  AGENCY_STATUS_OPTIONS,
  getAgencyRoutingStatusMeta,
} from "@/pages/dashboard/config";

export function AgencyReportDetailDrawer({
  isOpen,
  isDesktop,
  report,
  draftStatus,
  agencyNote,
  resolutionNote,
  resolutionProofPreviews,
  canEdit,
  canClaim,
  isClaiming,
  isSaving,
  isSaveDisabled,
  onClose,
  onClaim,
  onDraftStatusChange,
  onAgencyNoteChange,
  onResolutionNoteChange,
  onResolutionProofUpload,
  onRemoveResolutionProof,
  onSave,
  onPhotoClick,
}: AgencyReportDetailDrawerProps) {
  const {
    height: mobileSheetHeight,
    resizeMovedRef: mobileResizeMovedRef,
    resetHeight: resetMobileSheetHeight,
    setHeight: setMobileSheetHeight,
    startResize: startMobileResize,
  } = useMobileSheetResize({
    enabled: !isDesktop,
    initialHeight: 76,
    maxHeight: 82,
    minHeight: 50,
  });
  const currentStatusMeta = report
    ? AGENCY_REPORT_STATUS_MAP[report.status] || {
        label: report.status,
        color: "bg-gray-100 text-gray-700 border-gray-200",
      }
    : null;
  const isResolvedDraft = draftStatus === "resolved";
  const routingStatusMeta = getAgencyRoutingStatusMeta(report?.routingStatus);
  const resolutionPhotos = [
    ...(report?.resolutionImages ?? []),
    ...resolutionProofPreviews,
  ];
  const uploadedProofCount = resolutionProofPreviews.length;
  const timelineItems = report?.timeline ? [...report.timeline].reverse() : [];

  const closeDrawer = () => {
    if (!isDesktop) {
      resetMobileSheetHeight();
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && report && (
        <motion.div
          initial={
            isDesktop ? { x: "100%", opacity: 0 } : { y: "100%", opacity: 0 }
          }
          animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
          exit={
            isDesktop ? { x: "100%", opacity: 0 } : { y: "100%", opacity: 0 }
          }
          transition={{ type: "spring", stiffness: 350, damping: 35 }}
          className={`absolute z-30 pointer-events-none ${isDesktop ? "top-20 right-5" : "bottom-0 left-0 right-0"}`}
        >
          <motion.div
            drag={isDesktop}
            dragMomentum={false}
            animate={
              isDesktop ? undefined : { height: `${mobileSheetHeight}vh` }
            }
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className={`bg-white flex flex-col pointer-events-auto ${
              isDesktop
                ? "resize h-[calc(100vh-100px)] min-h-[400px] w-[420px] min-w-[320px] max-w-[600px] shadow-2xl rounded-sm border border-gray-100 overflow-hidden"
                : "w-full rounded-t-2xl shadow-[0_-20px_40px_rgba(15,23,42,0.16)] overflow-hidden"
            }`}
          >
            {!isDesktop && (
              <button
                type="button"
                onClick={() => {
                  if (mobileResizeMovedRef.current) return;
                  setMobileSheetHeight((height) => (height > 78 ? 76 : 82));
                }}
                onPointerDown={startMobileResize}
                className="flex w-full touch-none items-center justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing"
                aria-label={
                  mobileSheetHeight > 78
                    ? "Perkecil tinjauan tiket"
                    : "Perbesar tinjauan tiket"
                }
              >
                <span className="w-11 h-1.5 rounded-full bg-gray-200" />
              </button>
            )}

            <div
              onPointerDown={!isDesktop ? startMobileResize : undefined}
              className={`px-5 sm:px-6 py-3.5 flex touch-none justify-between items-center bg-white border-b border-gray-100 shrink-0 ${isDesktop ? "rounded-t-sm cursor-move active:cursor-grabbing" : ""}`}
            >
              <div>
                <h3 className="font-heading font-black text-base text-gray-900 tracking-tight leading-tight">
                  Update Tiket
                </h3>
                <p className="text-[10px] font-black text-gray-400 mt-0.5 uppercase tracking-widest">
                  #TCK-{report.id.substring(0, 8)}
                </p>
              </div>
              <button
                onPointerDown={(event) => event.stopPropagation()}
                onClick={closeDrawer}
                className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 z-10"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col thin-scrollbar">
              <div className="bg-white px-5 sm:px-6 pt-4 pb-4 space-y-3.5">
                {(() => {
                  const photos = report.images?.length
                    ? report.images
                    : report.aiReview?.gambarDiterimaAi?.length
                      ? report.aiReview.gambarDiterimaAi
                      : null;
                  if (!photos || photos.length === 0) {
                    return (
                      <div className="w-full h-[84px] bg-gray-50 border border-dashed border-gray-200 rounded-sm flex flex-col items-center justify-center text-gray-400">
                        <AlertCircle size={20} className="mb-1.5 opacity-50" />
                        <span className="text-[10px] uppercase font-black tracking-widest">
                          Tidak Ada Foto
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-2 gap-2">
                      {photos.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPhotoClick?.(photos.map(resolvePhotoUrl), i);
                          }}
                          className="relative w-full h-[78px] rounded-sm overflow-hidden group bg-gray-100"
                        >
                          <img
                            src={resolvePhotoUrl(url)}
                            alt={`Foto ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <ZoomIn
                              size={16}
                              className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })()}

                <div>
                  <h2 className="text-[15px] font-extrabold text-gray-900 leading-snug mb-2">
                    {report.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    {currentStatusMeta && (
                      <span
                        className={`text-[9px] font-black px-2.5 py-1 rounded-sm border uppercase tracking-widest ${currentStatusMeta.color}`}
                      >
                        {currentStatusMeta.label}
                      </span>
                    )}
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-sm border uppercase tracking-widest bg-gray-100 text-gray-500 border-gray-200">
                      {canEdit ? "Bisa Diedit" : "Lihat Saja"}
                    </span>
                    {report.rating && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-sm border uppercase tracking-widest bg-emerald-50 text-emerald-700 border-emerald-100">
                        <Star size={10} className="fill-emerald-600" />
                        {report.rating.score}/5
                      </span>
                    )}
                    {routingStatusMeta && (
                      <span
                        className={`text-[9px] font-black px-2.5 py-1 rounded-sm border uppercase tracking-widest ${routingStatusMeta.color}`}
                      >
                        {routingStatusMeta.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-500 leading-relaxed mb-3">
                    {report.kategori?.name || "Laporan Warga"}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-sm border border-gray-100">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        Pelapor
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                        <User size={11} className="text-[#C01D33]" />{" "}
                        {maskCitizenName(report.createdBy?.name)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        Waktu
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                        <Clock size={11} className="text-[#C01D33]" />{" "}
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5 col-span-2 pt-2 border-t border-gray-200/50">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        Koordinat
                      </span>
                      <div className="flex items-center justify-between text-xs font-bold text-gray-900 bg-white px-2.5 py-1.5 border border-gray-200 rounded-sm">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={11} className="text-blue-500" />
                          <span className="font-mono text-[11px]">
                            {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                          </span>
                        </div>
                        <button className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-100">
                          Nav
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/70 border-t border-gray-100 px-5 sm:px-6 py-4 flex-1">
                <h4 className="text-[10px] font-black text-[#111827] uppercase tracking-widest flex items-center gap-2 mb-3">
                  <Settings size={13} className="text-gray-400" /> Kirim Update
                </h4>

                <div className="space-y-3">
                  {!canEdit && (
                    <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-relaxed text-amber-800">
                      Tiket ini tetap bisa dilihat, tapi hanya laporan milik
                      instansi Anda yang dapat diubah.
                    </div>
                  )}

                  {canClaim && (
                    <div className="rounded-sm border border-sky-200 bg-sky-50 px-4 py-3">
                      <p className="text-xs font-semibold leading-relaxed text-sky-800">
                        Tiket ini masuk review manual dan belum bisa di-update
                        sampai Anda mengambil penanganannya.
                      </p>
                      <Button
                        type="button"
                        onClick={onClaim}
                        disabled={isClaiming}
                        className="mt-3 h-10 w-full rounded-sm bg-sky-700 text-xs font-black uppercase tracking-widest text-white hover:bg-sky-800"
                      >
                        <Hand size={15} />
                        {isClaiming ? "Mengambil..." : "Ambil Laporan"}
                      </Button>
                    </div>
                  )}

                  <div className="rounded-sm border border-gray-100 bg-white p-3.5 space-y-2.5">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Status Update <RequiredMark />
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {AGENCY_STATUS_OPTIONS.map((statusOption) => (
                        <button
                          key={statusOption.value}
                          type="button"
                          disabled={!canEdit}
                          onClick={() =>
                            onDraftStatusChange(statusOption.value)
                          }
                          className={`min-h-[36px] px-2 py-1.5 rounded-sm border text-[10px] font-black uppercase tracking-wider transition-all ${
                            draftStatus === statusOption.value
                              ? statusOption.activeClass
                              : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                          } ${!canEdit ? "cursor-not-allowed opacity-60 hover:border-gray-100" : ""}`}
                        >
                          {statusOption.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!isResolvedDraft && (
                    <div className="rounded-sm border border-gray-100 bg-white p-3.5 space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Catatan Dinas <RequiredMark />
                      </Label>
                      <Textarea
                        value={agencyNote}
                        disabled={!canEdit}
                        onChange={(event) =>
                          onAgencyNoteChange(event.target.value)
                        }
                        placeholder="Contoh: Tim sudah survei lokasi, pekerjaan dijadwalkan besok pagi..."
                        className="rounded-sm min-h-[84px] bg-gray-50 border border-gray-200 focus:border-[#db2744] focus:bg-white focus:ring-2 focus:ring-[#db2744]/10 text-gray-900 text-sm resize-none p-3 shadow-none leading-relaxed"
                      />
                      <p className="text-[10px] font-semibold text-gray-400">
                        Catatan wajib diisi sebelum update dikirim.
                      </p>
                    </div>
                  )}

                  {isResolvedDraft && (
                    <div className="rounded-sm border border-gray-100 bg-white p-3.5 space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Catatan Hasil Akhir <RequiredMark />
                      </Label>
                      <Textarea
                        value={resolutionNote}
                        disabled={!canEdit}
                        onChange={(event) =>
                          onResolutionNoteChange(event.target.value)
                        }
                        placeholder="Ringkasan pekerjaan akhir, kondisi setelah ditangani, atau tindak lanjut berikutnya..."
                        className="rounded-sm min-h-[84px] bg-gray-50 border border-gray-200 focus:border-[#db2744] focus:bg-white focus:ring-2 focus:ring-[#db2744]/10 text-gray-900 text-sm resize-none p-3 shadow-none leading-relaxed"
                      />
                    </div>
                  )}

                  <div className="rounded-sm border border-gray-100 bg-white p-3.5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Foto Update <RequiredMark />
                        </Label>
                        <p className="mt-1 text-xs font-semibold leading-relaxed text-gray-500">
                          Bukti kondisi lapangan wajib untuk setiap update.
                        </p>
                      </div>
                      {uploadedProofCount > 0 && (
                        <span className="rounded-sm bg-gray-100 px-2 py-1 text-[10px] font-black text-gray-500">
                          {uploadedProofCount}/5
                        </span>
                      )}
                    </div>

                    {resolutionPhotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {resolutionPhotos.map((url, index) => (
                          <div
                            key={`${url}-${index}`}
                            className="group relative h-16 overflow-hidden rounded-sm border border-gray-100 bg-gray-50"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                onPhotoClick?.(
                                  resolutionPhotos.map((photo) =>
                                    photo.startsWith("blob:")
                                      ? photo
                                      : resolvePhotoUrl(photo),
                                  ),
                                  index,
                                )
                              }
                              className="block h-full w-full cursor-zoom-in"
                              aria-label={`Preview bukti update ${index + 1}`}
                            >
                              <img
                                src={
                                  url.startsWith("blob:")
                                    ? url
                                    : resolvePhotoUrl(url)
                                }
                                alt={`Bukti update ${index + 1}`}
                                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                              />
                              <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100">
                                <ZoomIn size={16} />
                              </span>
                            </button>
                            {url.startsWith("blob:") && (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onRemoveResolutionProof(
                                    index -
                                      (report.resolutionImages?.length ?? 0),
                                  );
                                }}
                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-sm bg-black/65 text-white"
                                aria-label={`Hapus bukti update ${index + 1}`}
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {canEdit && (
                      <label className="flex h-16 cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-gray-300 bg-gray-50 px-3 text-gray-500 transition-colors hover:border-[#C01D33]/40 hover:bg-white hover:text-[#C01D33]">
                        <ImagePlus size={18} />
                        <span className="text-[11px] font-black uppercase tracking-widest">
                          Tambah Foto
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(event) => {
                            onResolutionProofUpload(event.target.files);
                            event.target.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {timelineItems.length > 0 && (
                    <div className="rounded-sm border border-gray-100 bg-white p-3.5 space-y-3">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Riwayat
                      </Label>
                      <div className="relative">
                        <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gray-100" />
                        <div className="space-y-3.5">
                          {timelineItems.map((item, index) => {
                            const statusMeta =
                              AGENCY_REPORT_STATUS_MAP[item.status] || {
                              label: item.status,
                              color:
                                "bg-gray-100 text-gray-700 border-gray-200",
                            };

                            return (
                              <div
                                key={item.id}
                                className="relative flex gap-3"
                              >
                                <div
                                  className={`relative z-10 mt-0.5 h-3 w-3 shrink-0 rounded-full border-2 bg-white ${index === 0 ? "border-[#db2744]" : "border-gray-300"}`}
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span
                                      className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${
                                        statusMeta.color
                                      }`}
                                    >
                                      {statusMeta.label}
                                    </span>
                                    <span className="text-[9px] font-medium text-gray-400">
                                      {new Date(item.createdAt).toLocaleDateString("id-ID")}
                                    </span>
                                  </div>
                                  {item.note ? (
                                    <p className="mt-1 text-[11px] leading-relaxed text-gray-600">
                                      {formatMachineText(item.note)}
                                    </p>
                                  ) : null}
                                  {item.images.length ? (
                                    <div className="mt-2 flex gap-1.5">
                                      {item.images
                                        .slice(0, 3)
                                        .map((url, imageIndex) => (
                                          <button
                                            key={`${url}-${imageIndex}`}
                                            type="button"
                                            onClick={() =>
                                              onPhotoClick?.(
                                                item.images.map(resolvePhotoUrl),
                                                imageIndex,
                                              )
                                            }
                                            className="group relative overflow-hidden rounded-md bg-gray-50"
                                            aria-label={`Preview bukti timeline ${imageIndex + 1}`}
                                          >
                                            <img
                                              src={
                                                url.startsWith("blob:")
                                                  ? url
                                                  : resolvePhotoUrl(url)
                                              }
                                              alt={`Bukti timeline ${imageIndex + 1}`}
                                              className="h-11 w-14 object-cover transition-transform duration-200 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 rounded-md bg-black/0 transition-colors group-hover:bg-black/20" />
                                          </button>
                                        ))}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <Button
                onClick={canClaim ? onClaim : onSave}
                disabled={
                  canClaim
                    ? isClaiming
                    : !canEdit || isSaving || isSaveDisabled
                }
                className="w-full bg-[#111827] hover:bg-gray-800 rounded-sm h-12 text-white font-black tracking-widest text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {canClaim
                  ? isClaiming
                    ? "MENGAMBIL..."
                    : "AMBIL LAPORAN"
                  : canEdit
                    ? isSaving
                      ? "MENGIRIM..."
                      : "KIRIM UPDATE"
                    : "LIHAT SAJA"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
