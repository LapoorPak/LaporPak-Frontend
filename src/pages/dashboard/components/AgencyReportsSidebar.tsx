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

interface AgencyReportsSidebarProps {
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

const SIDEBAR_LIST_SKELETONS = Array.from({ length: 4 });
export function AgencyReportsSidebar({
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
}: AgencyReportsSidebarProps) {
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
            className="pointer-events-auto h-[calc(100vh-120px)] min-h-[400px] w-[380px] min-w-[320px] max-w-[600px] flex flex-col bg-white shadow-2xl border border-gray-100 rounded-2xl overflow-hidden resize"
          >
            <div className="p-5 border-b border-gray-100 cursor-move active:cursor-grabbing">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-heading font-black text-xl text-gray-900 tracking-tight">Dashboard</h3>
                <button
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 z-10"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {stats.map((stat) => (
                  <div key={stat.label} className={`p-3.5 rounded-xl ${stat.bg} relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-125 transition-transform duration-500">
                      <stat.icon size={40} className={stat.color} />
                    </div>
                    <div className="relative z-10">
                      <AnimatedCount
                        value={stat.value}
                        className="text-2xl font-black text-[#111827] mb-0.5 leading-none"
                      />
                      <div className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-3 flex gap-2 overflow-x-auto border-b border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-gray-50/50">
              <div className="px-1 mb-2">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  Tickets
                  <span className="bg-white text-gray-900 px-2 py-0.5 rounded-full text-[10px] border border-gray-200">
                    <AnimatedCount value={totalCount} />
                  </span>
                </h3>
              </div>

              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari ID, kategori, atau lokasi..."
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-[11px] focus:outline-none focus:border-gray-300 transition-all font-medium text-gray-700 placeholder:text-gray-400/70"
                />
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {SIDEBAR_LIST_SKELETONS.map((_, index) => (
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
                        ? "border-[#C01D33]/30 shadow-md shadow-red-500/5 ring-1 ring-[#C01D33]/20"
                        : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
