import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Building2, Circle, Search, X } from "lucide-react";
import type { ReportLocation } from "@/api/reports/reports-queries";
import { Input } from "@/components/ui/input";
import { resolvePhotoUrl } from "@/lib/resolve-photo-url";

interface CitizenMyReportsPanelProps {
  isOpen: boolean;
  isDesktop: boolean;
  myReports: ReportLocation[];
  myReportsSearch: string;
  statusMap: Record<string, { label: string; color: string }>;
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onFocusReport: (report: ReportLocation) => void;
  onPhotoClick: (images: string[], index: number) => void;
}

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
}: CitizenMyReportsPanelProps) {
  const isEmpty = myReports.length === 0;
  const [mobileSheetHeight, setMobileSheetHeight] = useState(72);
  const mobileResizeRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const mobileResizeMovedRef = useRef(false);

  useEffect(() => {
    if (isOpen && !isDesktop) {
      setMobileSheetHeight(72);
    }
  }, [isDesktop, isOpen]);

  const startMobileResize = (event: ReactPointerEvent) => {
    if (isDesktop) return;

    event.preventDefault();
    event.stopPropagation();
    mobileResizeMovedRef.current = false;
    mobileResizeRef.current = {
      startY: event.clientY,
      startHeight: mobileSheetHeight,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const resizeState = mobileResizeRef.current;
      if (!resizeState) return;

      const deltaY = resizeState.startY - moveEvent.clientY;
      if (Math.abs(deltaY) > 2) {
        mobileResizeMovedRef.current = true;
      }

      const nextHeight = resizeState.startHeight + (deltaY / window.innerHeight) * 100;
      setMobileSheetHeight(Math.min(92, Math.max(44, nextHeight)));
    };

    const handlePointerUp = () => {
      mobileResizeRef.current = null;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
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
                  setMobileSheetHeight((height) => (height > 82 ? 72 : 92));
                }}
                onPointerDown={startMobileResize}
                className={`flex w-full touch-none justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing ${
                  isEmpty ? "bg-gray-100" : "bg-white"
                }`}
                aria-label={mobileSheetHeight > 82 ? "Perkecil panel Laporanku" : "Perbesar panel Laporanku"}
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
                onClick={onClose}
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
                      ? "bg-gray-200 border-gray-200 text-gray-400 placeholder:text-gray-400 focus:bg-gray-200 focus:border-gray-300 focus:ring-gray-300"
                      : "bg-gray-50 border-transparent focus:bg-white focus:border-[#db2744] focus:ring-[#db2744]"
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

                      {report.status === "rejected" && report.aiReview && (
                        <div className="mb-3 rounded-sm border border-red-100/50 bg-red-50/80 p-2.5">
                          <p className="text-[11px] font-bold text-[#db2744] mb-1">Feedback AI:</p>
                          <p className="text-[10px] text-gray-600 leading-relaxed mb-1">{report.aiReview.alasanAi}</p>
                          {report.aiReview.saranPerbaikanAi && (
                            <p className="text-[10px] text-gray-600 leading-relaxed">
                              Saran: <span className="font-medium text-gray-800">{report.aiReview.saranPerbaikanAi}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {(agencyNote || resolutionNote) && (
                        <div className="mb-3 space-y-2">
                          {agencyNote && (
                            <div className="rounded-sm border border-sky-100 bg-sky-50 px-3 py-2.5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-sky-700 mb-1">
                                Update Dinas
                              </p>
                              <p className="text-[11px] leading-relaxed text-sky-950">
                                {agencyNote}
                              </p>
                            </div>
                          )}

                          {resolutionNote && (
                            <div className="rounded-sm border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1">
                                Hasil Penanganan
                              </p>
                              <p className="text-[11px] leading-relaxed text-emerald-950">
                                {resolutionNote}
                              </p>
                            </div>
                          )}
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
                                      <p className="mt-1 line-clamp-2 leading-relaxed text-gray-600">{item.note}</p>
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
