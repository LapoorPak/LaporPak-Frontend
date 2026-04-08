import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Search, X, type LucideIcon } from "lucide-react";
import type {
  DashboardReportItem,
  ReportsDashboardTab,
  ReportsDashboardTabKey,
} from "@/api/reports/reports-queries";
import { getDashboardStatusToneStyle } from "../utils/reportStatus";
import { AnimatedCount } from "./AnimatedCount";

interface SummaryStat {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
}

interface AgencyReportsBottomSheetProps {
  isOpen: boolean;
  activeTab: ReportsDashboardTabKey;
  reports: DashboardReportItem[];
  searchQuery: string;
  selectedMarkerId: string | null;
  stats: SummaryStat[];
  tabs: ReportsDashboardTab[];
  totalCount: number;
  isLoading: boolean;
  onTabChange: (tab: ReportsDashboardTabKey) => void;
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onSelectReport: (reportId: string) => void;
}

const BOTTOM_SHEET_LIST_SKELETONS = Array.from({ length: 4 });

export function AgencyReportsBottomSheet({
  isOpen,
  activeTab,
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
}: AgencyReportsBottomSheetProps) {
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
            className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: "75vh" }}
          >
            <div className="flex items-center justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="px-5 pb-4 border-b border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-heading font-black text-lg text-gray-900">Daftar Laporan</h3>
                  <p className="text-xs text-gray-400 font-medium">
                    <AnimatedCount value={totalCount} /> tiket aktif
                  </p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-1.5">
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {stats.map((stat) => (
                  <div key={stat.label} className={`p-2.5 rounded-xl ${stat.bg} text-center`}>
                    <AnimatedCount
                      value={stat.value}
                      className="text-lg font-black text-[#111827] leading-none"
                    />
                    <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mt-0.5 leading-tight">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-2.5 flex gap-2 overflow-x-auto border-b border-gray-100 shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="px-5 py-3 border-b border-gray-100 shrink-0">
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
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[11px] focus:outline-none focus:border-gray-300 transition-all font-medium text-gray-700 placeholder:text-gray-400/70"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5">
              {isLoading ? (
                <div className="space-y-3">
                  {BOTTOM_SHEET_LIST_SKELETONS.map((_, index) => (
                    <div
                      key={`report-skeleton-${index}`}
                      className="rounded-xl border border-gray-100 bg-white p-4 animate-pulse"
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
                    className={`w-full text-left bg-white p-4 rounded-xl border transition-all duration-200 ${
                      selectedMarkerId === report.id
                        ? "border-[#C01D33]/30 ring-1 ring-[#C01D33]/20 shadow-sm"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getDashboardStatusToneStyle(report.statusTone)}`}>
                        {report.statusLabel}
                      </span>
                      <span className="text-[10px] font-medium text-gray-400 shrink-0">{report.dateLabel}</span>
                    </div>
                    <h4 className="font-bold text-[#111827] text-sm leading-snug line-clamp-1 mb-1.5">{report.title}</h4>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-gray-400 text-[11px] min-w-0">
                        <MapPin size={10} className="shrink-0" />
                        <span className="truncate">{report.agencyName}</span>
                        {report.canEdit === false && (
                          <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-gray-500 shrink-0">
                            Lihat Saja
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-black text-gray-300 shrink-0">{report.referenceCode}</span>
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
