import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Building2, Search, X } from "lucide-react";
import type { ReportLocation } from "@/api/reports/reports-queries";
import { Input } from "@/components/ui/input";

interface CitizenMyReportsPanelProps {
  isOpen: boolean;
  isDesktop: boolean;
  myReports: ReportLocation[];
  myReportsSearch: string;
  statusMap: Record<string, { label: string; color: string }>;
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onFocusReport: (report: ReportLocation) => void;
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
}: CitizenMyReportsPanelProps) {
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
            className={`bg-white flex flex-col overflow-hidden resize pointer-events-auto ${
              isDesktop
                ? "h-[calc(100vh-120px)] min-h-[400px] w-[380px] min-w-[320px] max-w-[600px] shadow-2xl rounded-xl border border-gray-100"
                : "w-full rounded-t-3xl h-[85vh] shadow-[0_-20px_40px_rgba(0,0,0,0.1)]"
            }`}
          >
            <div className="px-7 py-6 flex justify-between items-center bg-white border-b border-gray-100 relative z-10 cursor-move active:cursor-grabbing">
              <div>
                <h3 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
                  Laporanku
                </h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wide">
                  {myReports.length} Laporan Anda
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-900 transition-colors p-2 -mr-2"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-gray-100 bg-white">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  value={myReportsSearch}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Cari laporan saya..."
                  className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-[#db2744] focus:ring-[#db2744] pl-10 h-10 rounded-lg text-sm transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-3">
              {myReports.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 pb-20">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-[#db2744] mb-4">
                    <AlertTriangle size={32} />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Belum Ada Laporan</h4>
                  <p className="text-sm text-gray-500">Anda belum membuat laporan apapun.</p>
                </div>
              ) : (
                myReports.map((report) => {
                  const status = statusMap[report.status] || { label: report.status, color: "bg-gray-100 text-gray-700" };
                  const agencyNote = report.agencyNote?.trim();
                  const resolutionNote = report.resolutionNote?.trim();

                  return (
                    <div
                      key={report.id}
                      className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm ${
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
                        <div className="mb-3 p-2.5 bg-red-50/80 rounded-lg border border-red-100/50">
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
                            <div className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2.5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-sky-700 mb-1">
                                Update Dinas
                              </p>
                              <p className="text-[11px] leading-relaxed text-sky-950">
                                {agencyNote}
                              </p>
                            </div>
                          )}

                          {resolutionNote && (
                            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
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
