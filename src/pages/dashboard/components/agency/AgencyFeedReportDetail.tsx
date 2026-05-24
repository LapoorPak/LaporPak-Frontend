import {
  ArrowLeft,
  Building2,
  Clock,
  ImagePlus,
  MapPin,
  Navigation,
  Trash2,
  User,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label, RequiredMark } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resolvePhotoUrl } from "@/lib/resolve-photo-url";
import { maskCitizenName } from "@/lib/utils";
import type { AgencyFeedReportDetailProps } from "@/types/dashboard";
import {
  AGENCY_REPORT_STATUS_MAP,
  formatMachineText,
} from "@/pages/dashboard/utils";
import {
  AGENCY_STATUS_OPTIONS,
  formatAgencyDetailDate,
} from "@/pages/dashboard/config";

export function AgencyFeedReportDetail({
  report,
  draftStatus,
  agencyNote,
  resolutionNote,
  resolutionProofPreviews,
  canEdit,
  isSaving,
  isSaveDisabled,
  onBack,
  onNavigateMap,
  onDraftStatusChange,
  onAgencyNoteChange,
  onResolutionNoteChange,
  onResolutionProofUpload,
  onRemoveResolutionProof,
  onSave,
  onPhotoClick,
}: AgencyFeedReportDetailProps) {
  if (!report) return null;

  const statusMeta = AGENCY_REPORT_STATUS_MAP[report.status] || {
    label: report.status,
    color: "bg-gray-100 text-gray-700 border-gray-200",
  };
  const reportPhotos = report.images?.length
    ? report.images
    : report.aiReview?.gambarDiterimaAi?.length
      ? report.aiReview.gambarDiterimaAi
      : [];
  const resolutionPhotos = [
    ...(report.resolutionImages ?? []),
    ...resolutionProofPreviews,
  ];
  const shouldShowResolutionNote =
    draftStatus === "resolved" ||
    Boolean(report.resolutionNote) ||
    Boolean(resolutionNote.trim());
  const timelineItems = [...(report.timeline ?? [])].reverse();

  return (
    <div className="absolute inset-0 z-10 overflow-y-auto bg-[#f3f4f6] px-3 pb-32 pt-56 sm:px-5 sm:pt-24 md:px-8 md:pt-28">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/70 pb-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-transparent bg-transparent px-3 text-xs font-black text-gray-700 transition-colors hover:cursor-pointer"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
          <button
            type="button"
            onClick={onNavigateMap}
            className="hover:cursor-pointer inline-flex h-10 items-center gap-2 rounded-full bg-gray-950 px-4 text-xs font-black text-white shadow-sm transition-colors hover:bg-gray-800"
          >
            <Navigation size={16} />
            Lihat di Map
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="overflow-hidden rounded-sm border border-gray-100 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
            {reportPhotos.length > 0 ? (
              <div className="grid gap-2 bg-gray-100 p-2 sm:grid-cols-2">
                {reportPhotos.slice(0, 4).map((photo, index) => (
                  <button
                    key={`${photo}-${index}`}
                    type="button"
                    onClick={() =>
                      onPhotoClick?.(reportPhotos.map(resolvePhotoUrl), index)
                    }
                    className="group relative aspect-[16/10] overflow-hidden rounded-sm bg-gray-200"
                  >
                    <img
                      src={resolvePhotoUrl(photo)}
                      alt={`Foto laporan ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/25 group-hover:opacity-100">
                      <ZoomIn size={20} />
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-sm border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${statusMeta.color}`}
                    >
                      {statusMeta.label}
                    </span>
                    <span className="rounded-sm border border-gray-200 bg-gray-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-gray-500">
                      #TCK-{report.id.substring(0, 8)}
                    </span>
                  </div>
                  <h1 className="text-2xl font-black leading-tight tracking-tight text-gray-950">
                    {report.title}
                  </h1>
                  <p className="mt-2 text-sm font-semibold text-gray-500">
                    {report.kategori?.name || "Laporan Warga"}
                  </p>
                </div>
              </div>

              {report.description && (
                <div className="rounded-sm border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm leading-relaxed text-gray-700">
                    {report.description}
                  </p>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-sm border border-gray-100 bg-gray-50 p-4">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Pelapor
                  </p>
                  <div className="flex items-center gap-2 text-sm font-black text-gray-900">
                    <User size={15} className="text-[#db2744]" />
                    {maskCitizenName(report.createdBy?.name)}
                  </div>
                </div>
                <div className="rounded-sm border border-gray-100 bg-gray-50 p-4">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Waktu
                  </p>
                  <div className="flex items-center gap-2 text-sm font-black text-gray-900">
                    <Clock size={15} className="text-[#db2744]" />
                    {formatAgencyDetailDate(report.createdAt)}
                  </div>
                </div>
                <div className="rounded-sm border border-gray-100 bg-gray-50 p-4 sm:col-span-2">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Instansi
                  </p>
                  <div className="flex min-w-0 items-center gap-2 text-sm font-black text-gray-900">
                    <Building2 size={15} className="shrink-0 text-[#db2744]" />
                    <span className="truncate">
                      {report.cabangDinas?.name ||
                        report.dinas?.name ||
                        "Belum ditugaskan"}
                    </span>
                  </div>
                </div>
                <div className="rounded-sm border border-gray-100 bg-gray-50 p-4 sm:col-span-2">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Koordinat
                  </p>
                  <div className="flex items-center justify-between gap-3 rounded-sm border border-gray-200 bg-white px-3 py-2 text-sm font-black text-gray-900">
                    <span className="flex min-w-0 items-center gap-2 font-mono text-xs">
                      <MapPin size={14} className="shrink-0 text-blue-500" />
                      {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
                    </span>
                    <button
                      type="button"
                      onClick={onNavigateMap}
                      className="rounded-sm bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600"
                    >
                      Map
                    </button>
                  </div>
                </div>
              </div>

              {report.timeline?.length ? (
                <div className="rounded-sm border border-gray-100 bg-white p-4">
                  <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Riwayat
                  </p>
                  <div className="relative">
                    <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gray-100" />
                    <div className="space-y-3.5">
                      {timelineItems.map((item, index) => {
                        const timelineStatus =
                          AGENCY_REPORT_STATUS_MAP[item.status] || statusMeta;
                        return (
                          <div key={item.id} className="relative flex gap-3">
                            <span
                              className={`relative z-10 mt-0.5 h-3 w-3 shrink-0 rounded-full border-2 bg-white ${index === 0 ? "border-[#db2744]" : "border-gray-300"}`}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
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
                                <p className="mt-1 text-[11px] leading-relaxed text-gray-600 sm:text-xs">
                                  {formatMachineText(item.note)}
                                </p>
                              )}
                              {item.images.length > 0 && (
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
                                        aria-label={`Preview bukti riwayat ${imageIndex + 1}`}
                                      >
                                        <img
                                          src={resolvePhotoUrl(url)}
                                          alt={`Bukti riwayat ${imageIndex + 1}`}
                                          className="h-11 w-14 object-cover transition-transform duration-200 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 rounded-md bg-black/0 transition-colors group-hover:bg-black/20" />
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
                </div>
              ) : null}
            </div>
          </article>

          <aside className="h-fit rounded-sm border border-gray-100 bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
            <div className="mb-4">
              <h2 className="text-sm font-black tracking-tight text-gray-950">
                Update Penanganan
              </h2>
              <p className="mt-1 text-xs font-semibold text-gray-500">
                Kirim status dan bukti terbaru tanpa keluar dari detail tiket.
              </p>
            </div>

            {!canEdit && (
              <div className="mb-3 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-relaxed text-amber-800">
                Tiket ini hanya bisa dilihat oleh instansi Anda.
              </div>
            )}

            <div className="space-y-3">
              <div className="rounded-sm border border-gray-100 bg-gray-50 p-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Status Update <RequiredMark />
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {AGENCY_STATUS_OPTIONS.map((statusOption) => (
                    <button
                      key={statusOption.value}
                      type="button"
                      disabled={!canEdit}
                      onClick={() => onDraftStatusChange(statusOption.value)}
                      className={`hover:cursor-pointer min-h-9 rounded-sm border px-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                        draftStatus === statusOption.value
                          ? statusOption.activeClass
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      } ${!canEdit ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      {statusOption.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-sm border border-gray-100 bg-gray-50 p-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Catatan Dinas <RequiredMark />
                </Label>
                <Textarea
                  value={agencyNote}
                  disabled={!canEdit}
                  onChange={(event) => onAgencyNoteChange(event.target.value)}
                  placeholder="Contoh: Tim sudah survei lokasi, pekerjaan dijadwalkan besok pagi..."
                  className="mt-2 min-h-[96px] resize-none rounded-sm border-gray-200 bg-white text-sm shadow-none focus:border-[#db2744] focus:ring-0"
                />
                <p className="mt-1.5 text-[10px] font-semibold text-gray-400">
                  Catatan wajib diisi sebelum update dikirim.
                </p>
              </div>

              {shouldShowResolutionNote && (
                <div className="rounded-sm border border-gray-100 bg-gray-50 p-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Catatan Hasil Akhir <RequiredMark />
                  </Label>
                  <Textarea
                    value={resolutionNote}
                    disabled={!canEdit}
                    onChange={(event) =>
                      onResolutionNoteChange(event.target.value)
                    }
                    placeholder="Ringkasan hasil penanganan..."
                    className="mt-2 min-h-[86px] resize-none rounded-sm border-gray-200 bg-white text-sm shadow-none focus:border-emerald-500 focus:ring-0"
                  />
                </div>
              )}

              <div className="rounded-sm border border-gray-100 bg-gray-50 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Foto Update <RequiredMark />
                  </Label>
                  <span className="rounded-sm bg-white px-2 py-1 text-[10px] font-black text-gray-400">
                    {resolutionProofPreviews.length}/5
                  </span>
                </div>

                {resolutionPhotos.length > 0 && (
                  <div className="mb-2 grid grid-cols-3 gap-2">
                    {resolutionPhotos.map((photo, index) => (
                      <div
                        key={`${photo}-${index}`}
                        className="group relative aspect-square overflow-hidden rounded-sm bg-gray-200"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            onPhotoClick?.(
                              resolutionPhotos.map((item) =>
                                item.startsWith("blob:")
                                  ? item
                                  : resolvePhotoUrl(item),
                              ),
                              index,
                            )
                          }
                          className="h-full w-full"
                        >
                          <img
                            src={
                              photo.startsWith("blob:")
                                ? photo
                                : resolvePhotoUrl(photo)
                            }
                            alt={`Bukti update ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                        {photo.startsWith("blob:") && (
                          <button
                            type="button"
                            onClick={() =>
                              onRemoveResolutionProof(
                                index - (report.resolutionImages?.length ?? 0),
                              )
                            }
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-sm bg-black/65 text-white"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {canEdit && (
                  <label className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-gray-300 bg-white text-[11px] font-black uppercase tracking-widest text-gray-500 transition-colors hover:border-[#db2744]/40 hover:text-[#db2744]">
                    <ImagePlus size={16} />
                    Tambah Foto
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
                <p className="mt-1.5 text-[10px] font-semibold text-gray-400">
                  Upload minimal 1 foto baru untuk setiap update.
                </p>
              </div>

              <Button
                type="button"
                onClick={onSave}
                disabled={!canEdit || isSaving || isSaveDisabled}
                className="h-12 w-full rounded-sm bg-gray-950 text-sm font-black tracking-widest text-white hover:bg-gray-800"
              >
                {isSaving ? "MENGIRIM..." : "KIRIM UPDATE"}
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
