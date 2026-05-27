import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Search, X } from "lucide-react";
import { AnimatedCount } from "@/pages/dashboard/components/shared";
import { getAgencyRoutingStatusMeta } from "@/pages/dashboard/config";
import { getDashboardStatusToneStyle } from "@/pages/dashboard/utils";
import type { AgencyReportsListPanelProps } from "@/types/dashboard";

const SIDEBAR_LIST_SKELETONS = Array.from({ length: 4 });
export function AgencyReportsSidebar({
  isOpen,
  activeTabs,
  reports,
  searchQuery,
  selectedMarkerId,
  stats,
  tabs,
  totalCount,
  isLoading,
  onTabChange,
  onSearchChange,
  onClose,
  onSelectReport,
}: AgencyReportsListPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-20 left-5 z-20 pointer-events-none"
        >
          <motion.div
            drag
            dragMomentum={false}
            className="pointer-events-auto h-[calc(100vh-120px)] min-h-[400px] w-[380px] min-w-[320px] max-w-[600px] flex flex-col bg-white shadow-2xl border border-gray-100 rounded-sm overflow-hidden resize"
          >
            <div className="px-5 pt-4 pb-3 border-b border-gray-100 cursor-move active:cursor-grabbing">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-heading font-black text-lg text-gray-900 tracking-tight">Dashboard</h3>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    <AnimatedCount value={totalCount} /> tiket aktif
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
              <div className="thin-scrollbar flex gap-1.5 overflow-x-auto pb-1">
                {stats.map((stat) => (
                  <div key={stat.label} className={`flex min-w-[92px] items-center gap-2 rounded-sm ${stat.bg} px-2 py-1.5`}>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-white/60">
                      <stat.icon size={12} className={`${stat.color} opacity-80`} />
                    </span>
                    <div className="min-w-0">
                      <AnimatedCount
                        value={stat.value}
                        className="block text-sm font-black text-[#111827] leading-none"
                      />
                      <div className="mt-0.5 truncate text-[7px] font-black text-gray-500 uppercase tracking-wide leading-none">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="thin-scrollbar px-5 py-2 flex gap-1.5 overflow-x-auto border-b border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key)}
                  className={`px-3 py-1.5 rounded-sm text-[11px] font-black whitespace-nowrap transition-all ${
                    activeTabs.includes(tab.key) ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-gray-50/80 thin-scrollbar">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari ID, kategori, atau lokasi..."
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  className="w-full rounded-sm border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-xs font-semibold text-gray-700 placeholder:text-gray-400/80 transition-all focus:border-[#db2744] focus:outline-none focus:ring-2 focus:ring-[#db2744]/10"
                />
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {SIDEBAR_LIST_SKELETONS.map((_, index) => (
                    <div
                      key={`report-skeleton-${index}`}
                      className="rounded-sm border border-gray-100 bg-white p-4 animate-pulse"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="h-5 w-24 rounded-full bg-gray-200" />
                        <div className="h-3 w-16 rounded-full bg-gray-100" />
                      </div>
                      <div className="h-4 w-4/5 rounded-full bg-gray-200 mb-2" />
                      <div className="h-3 w-3/5 rounded-full bg-gray-100 mb-4" />
                      <div className="flex items-center justify-between gap-3">
                        <div className="h-3 w-32 rounded-full bg-gray-100" />
                        <div className="h-3 w-16 rounded-full bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm font-semibold text-gray-400">Belum ada laporan untuk filter ini.</div>
              ) : (
                reports.map((report) => (
                  (() => {
                    const routingStatusMeta = getAgencyRoutingStatusMeta(
                      report.routingStatus,
                    );

                    return (
                      <button
                        key={report.id}
                        onClick={() => onSelectReport(report.id)}
                        className={`w-full text-left bg-white px-4 py-3.5 rounded-sm border transition-all duration-200 ${
                          selectedMarkerId === report.id
                            ? "border-[#C01D33]/30 shadow-md shadow-red-500/5 ring-1 ring-[#C01D33]/20"
                            : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2.5 gap-3">
                          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm ${getDashboardStatusToneStyle(report.statusTone)}`}>
                              {report.statusLabel}
                            </span>
                            {routingStatusMeta && (
                              <span className={`rounded-sm border px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${routingStatusMeta.color}`}>
                                {routingStatusMeta.label}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-gray-400 shrink-0">{report.dateLabel}</span>
                        </div>
                        <h4 className="font-extrabold text-[#111827] text-[15px] leading-snug line-clamp-2 mb-3">{report.title}</h4>
                        <div className="flex items-start gap-2.5 rounded-sm bg-gray-50 px-3 py-2.5">
                          <MapPin size={13} className="mt-0.5 shrink-0 text-[#db2744]" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-gray-600">{report.agencyName}</p>
                            <div className="mt-1 flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black text-gray-300">{report.referenceCode}</span>
                              {report.canEdit === false && (
                                <span className="rounded-sm border border-gray-200 bg-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-gray-500 shrink-0">
                                  Lihat Saja
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })()
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
