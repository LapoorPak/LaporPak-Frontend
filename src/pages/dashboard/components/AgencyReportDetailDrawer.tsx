import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, Clock, MapPin, Settings, User, X } from "lucide-react";
import type { ReportLocation } from "@/api/reports/reports-queries";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AGENCY_REPORT_STATUS_MAP } from "../utils/reportStatus";

const STATUS_OPTIONS = [
  {
    value: "verified",
    label: "Verifikasi",
    activeClass: "border-blue-500 bg-blue-50 text-blue-600",
  },
  {
    value: "in_progress",
    label: "Proses",
    activeClass: "border-orange-500 bg-orange-50 text-orange-600",
  },
  {
    value: "resolved",
    label: "Selesai",
    activeClass: "border-emerald-500 bg-emerald-50 text-emerald-600",
  },
] as const;

interface AgencyReportDetailDrawerProps {
  isOpen: boolean;
  isDesktop: boolean;
  report: ReportLocation | null;
  draftStatus: string | null;
  agencyNote: string;
  resolutionNote: string;
  canEdit: boolean;
  isSaving: boolean;
  isSaveDisabled: boolean;
  onClose: () => void;
  onDraftStatusChange: (status: string) => void;
  onAgencyNoteChange: (value: string) => void;
  onResolutionNoteChange: (value: string) => void;
  onSave: () => void;
}

export function AgencyReportDetailDrawer({
  isOpen,
  isDesktop,
  report,
  draftStatus,
  agencyNote,
  resolutionNote,
  canEdit,
  isSaving,
  isSaveDisabled,
  onClose,
  onDraftStatusChange,
  onAgencyNoteChange,
  onResolutionNoteChange,
  onSave,
}: AgencyReportDetailDrawerProps) {
  const currentStatusMeta = report
    ? AGENCY_REPORT_STATUS_MAP[report.status] || {
        label: report.status,
        color: "bg-gray-100 text-gray-700 border-gray-200",
      }
    : null;
  const shouldShowResolutionNote =
    draftStatus === "resolved" ||
    Boolean(report?.resolutionNote) ||
    Boolean(resolutionNote.trim());

  return (
    <AnimatePresence>
      {isOpen && report && (
        <motion.div
          initial={isDesktop ? { x: "100%", opacity: 0 } : { y: "100%", opacity: 0 }}
          animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
          exit={isDesktop ? { x: "100%", opacity: 0 } : { y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 35 }}
          className={`absolute z-30 pointer-events-none ${isDesktop ? "top-20 right-5" : "bottom-0 left-0 right-0 h-[88vh]"}`}
        >
          <motion.div
            drag={isDesktop}
            dragMomentum={false}
            className={`bg-white flex flex-col resize pointer-events-auto ${
              isDesktop
                ? "h-[calc(100vh-100px)] min-h-[400px] w-[420px] min-w-[320px] max-w-[600px] shadow-2xl rounded-2xl border border-gray-100 overflow-hidden"
                : "w-full h-full rounded-t-3xl shadow-2xl overflow-hidden"
            }`}
          >
            {!isDesktop && (
              <div className="flex items-center justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>
            )}

            <div className={`px-6 py-4 flex justify-between items-center bg-white border-b border-gray-100 shrink-0 ${isDesktop ? "rounded-t-2xl cursor-move active:cursor-grabbing" : ""}`}>
              <div>
                <h3 className="font-heading font-black text-lg text-gray-900 tracking-tight leading-none">
                  Tinjauan Tiket
                </h3>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
                  #TCK-{report.id.substring(0, 8)}
                </p>
              </div>
              <button
                onPointerDown={(event) => event.stopPropagation()}
                onClick={onClose}
                className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 z-10"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col">
              <div className="bg-white px-6 pt-5 pb-5 space-y-5">
                <div className="w-full h-[100px] bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400">
                  <AlertCircle size={22} className="mb-1.5 opacity-50" />
                  <span className="text-[10px] uppercase font-black tracking-widest">Tidak Ada Foto</span>
                </div>

                <div>
                  <h2 className="text-base font-black text-gray-900 leading-tight mb-1.5">{report.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {currentStatusMeta && (
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest ${currentStatusMeta.color}`}
                      >
                        {currentStatusMeta.label}
                      </span>
                    )}
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest bg-gray-100 text-gray-500 border-gray-200">
                      {canEdit ? "Bisa Diedit" : "Lihat Saja"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    {report.kategori?.name || "Laporan Warga"}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pelapor</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                        <User size={11} className="text-[#C01D33]" /> Anonim
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Waktu</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                        <Clock size={11} className="text-[#C01D33]" /> {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5 col-span-2 pt-2 border-t border-gray-200/50">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Koordinat</span>
                      <div className="flex items-center justify-between text-xs font-bold text-gray-900 bg-white px-2.5 py-1.5 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={11} className="text-blue-500" />
                          <span className="font-mono text-[11px]">{report.lat.toFixed(4)}, {report.lng.toFixed(4)}</span>
                        </div>
                        <button className="text-[9px] uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          Nav
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-5 flex-1">
                <h4 className="text-[11px] font-black text-[#111827] uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Settings size={13} className="text-gray-400" /> Kontrol Resolusi
                </h4>

                <div className="space-y-4">
                  {!canEdit && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      Tiket ini tetap bisa dilihat, tapi hanya laporan milik instansi Anda yang dapat diubah.
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ubah Status</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {STATUS_OPTIONS.map((statusOption) => (
                        <button
                          key={statusOption.value}
                          type="button"
                          disabled={!canEdit}
                          onClick={() => onDraftStatusChange(statusOption.value)}
                          className={`py-2.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${
                            draftStatus === statusOption.value
                              ? statusOption.activeClass
                              : "border-gray-100 text-gray-400 hover:border-gray-200 bg-white"
                          } ${!canEdit ? "cursor-not-allowed opacity-60 hover:border-gray-100" : ""}`}
                        >
                          {statusOption.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Catatan Dinas</Label>
                    <Textarea
                      value={agencyNote}
                      disabled={!canEdit}
                      onChange={(event) => onAgencyNoteChange(event.target.value)}
                      placeholder="Langkah penanganan yang sudah/akan diambil..."
                      className="rounded-xl min-h-[80px] bg-white border-2 border-gray-100 focus:border-[#C01D33] focus:ring-0 text-gray-900 text-sm resize-none p-3 shadow-none"
                    />
                  </div>

                  {shouldShowResolutionNote && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Catatan Penyelesaian</Label>
                      <Textarea
                        value={resolutionNote}
                        disabled={!canEdit}
                        onChange={(event) => onResolutionNoteChange(event.target.value)}
                        placeholder="Ringkasan penanganan akhir atau hasil penyelesaian..."
                        className="rounded-xl min-h-[80px] bg-white border-2 border-gray-100 focus:border-emerald-500 focus:ring-0 text-gray-900 text-sm resize-none p-3 shadow-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <Button
                onClick={onSave}
                disabled={!canEdit || isSaving || isSaveDisabled}
                className="w-full bg-[#111827] hover:bg-gray-800 rounded-xl h-12 text-white font-black tracking-widest text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {canEdit ? (isSaving ? "MENYIMPAN..." : "SIMPAN") : "LIHAT SAJA"}
                <ArrowRight size={15} strokeWidth={3} className="opacity-60" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
