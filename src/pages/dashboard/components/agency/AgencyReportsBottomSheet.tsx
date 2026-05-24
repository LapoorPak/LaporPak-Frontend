import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Search, TicketCheck, X } from "lucide-react";
import { useMobileSheetResize } from "@/hooks/common";
import { AnimatedCount } from "@/pages/dashboard/components/shared";
import { getDashboardStatusToneStyle } from "@/pages/dashboard/utils";
import type { AgencyReportsListPanelProps } from "@/types/dashboard";

const BOTTOM_SHEET_LIST_SKELETONS = Array.from({ length: 4 });

export function AgencyReportsBottomSheet({
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
  const {
    height: mobileSheetHeight,
    resizeMovedRef: mobileResizeMovedRef,
    setHeight: setMobileSheetHeight,
    startResize: startMobileResize,
  } = useMobileSheetResize({
    maxHeight: 82,
    minHeight: 48,
    resetWhen: isOpen,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: `${mobileSheetHeight}vh` }}
          >
            <button
              type="button"
              onClick={() => {
                if (mobileResizeMovedRef.current) return;
                setMobileSheetHeight((height) => (height > 78 ? 72 : 82));
              }}
              onPointerDown={startMobileResize}
              className="flex w-full touch-none items-center justify-center pt-3 pb-1.5 cursor-grab active:cursor-grabbing"
              aria-label={mobileSheetHeight > 78 ? "Perkecil daftar tiket" : "Perbesar daftar tiket"}
            >
              <span className="w-11 h-1.5 rounded-full bg-gray-200" />
            </button>

            <div
              onPointerDown={startMobileResize}
              className="px-5 pb-2.5 border-b border-gray-100 touch-none"
            >
              <div className="flex justify-between items-start gap-3 mb-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#db2744]/10 text-[#db2744]">
                      <TicketCheck size={16} strokeWidth={2.5} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-heading font-black text-lg leading-tight text-gray-900">Dashboard</h3>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">
                        <AnimatedCount value={totalCount} /> tiket aktif
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-900 p-1.5 -mr-1"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div
                onPointerDown={(event) => event.stopPropagation()}
                className="flex gap-1.5 overflow-x-auto thin-scrollbar"
              >
                {stats.map((stat) => (
                  <div key={stat.label} className={`flex min-w-[88px] items-center gap-2 rounded-sm ${stat.bg} px-2 py-1.5`}>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-white/60">
                      <stat.icon size={12} className={`${stat.color} opacity-80`} />
                    </span>
                    <div className="min-w-0">
                      <AnimatedCount
                        value={stat.value}
                        className="block text-sm font-black text-[#111827] leading-none"
                      />
                      <div className="mt-0.5 truncate text-[7.5px] font-black text-gray-500 uppercase tracking-wide leading-none">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-2.5 border-b border-gray-100 shrink-0">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Cari ID, kategori, atau lokasi..."
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  className="w-full rounded-sm border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-xs font-semibold text-gray-700 placeholder:text-gray-400/80 transition-all focus:border-[#db2744] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#db2744]/10"
                />
              </div>
            </div>

            <div className="px-5 py-2 flex gap-1.5 overflow-x-auto border-b border-gray-100 shrink-0 thin-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key)}
                  className={`px-3 py-1.5 rounded-sm text-[11px] font-black whitespace-nowrap transition-all ${
                    activeTabs.includes(tab.key) ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50/80 px-4 py-3.5 space-y-2.5 thin-scrollbar">
              {isLoading ? (
                <div className="space-y-3">
                  {BOTTOM_SHEET_LIST_SKELETONS.map((_, index) => (
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
                  <button
                    key={report.id}
                    onClick={() => onSelectReport(report.id)}
                    className={`w-full text-left bg-white px-4 py-3.5 rounded-sm border transition-all duration-200 ${
                      selectedMarkerId === report.id
                        ? "border-[#C01D33]/30 ring-1 ring-[#C01D33]/20 shadow-md shadow-red-500/5"
                        : "border-gray-100 hover:border-gray-200 shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2.5 gap-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm ${getDashboardStatusToneStyle(report.statusTone)}`}>
                        {report.statusLabel}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 shrink-0">{report.dateLabel}</span>
                    </div>
                    <h4 className="font-extrabold text-[#111827] text-[15px] leading-snug mb-3 line-clamp-2">{report.title}</h4>
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
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
