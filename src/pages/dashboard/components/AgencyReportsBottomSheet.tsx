import { AnimatePresence, motion } from "framer-motion";
import { MapPin, X, type LucideIcon } from "lucide-react";
import type {
  DashboardReportItem,
  ReportsDashboardTab,
  ReportsDashboardTabKey,
} from "@/api/reports/reports-queries";
import { getDashboardStatusToneStyle } from "../utils/reportStatus";

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
  selectedMarkerId: string | null;
  stats: SummaryStat[];
  tabs: ReportsDashboardTab[];
  totalCount: number;
  isLoading: boolean;
  onTabChange: (tab: ReportsDashboardTabKey) => void;
  onClose: () => void;
  onSelectReport: (reportId: string) => void;
}

export function AgencyReportsBottomSheet({
  isOpen,
  activeTab,
  reports,
  selectedMarkerId,
  stats,
  tabs,
  totalCount,
  isLoading,
  onTabChange,
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
                  <p className="text-xs text-gray-400 font-medium">{totalCount} tiket aktif</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-1.5">
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {stats.map((stat) => (
                  <div key={stat.label} className={`p-2.5 rounded-xl ${stat.bg} text-center`}>
                    <div className="text-lg font-black text-[#111827] leading-none">{stat.value}</div>
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

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5">
              {isLoading ? (
                <div className="px-4 py-10 text-center text-sm font-semibold text-gray-400">Memuat laporan...</div>
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
                      <div className="flex items-center gap-1 text-gray-400 text-[11px] min-w-0">
                        <MapPin size={10} className="shrink-0" />
                        <span className="truncate">{report.agencyName}</span>
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
