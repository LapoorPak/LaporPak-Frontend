import { useEffect, useRef, useState } from "react";
import { Building2, Check, Filter } from "lucide-react";
import type {
  CitizenDashboardFiltersProps,
  CitizenReportFilterStatus,
} from "@/types/dashboard";
import { cn } from "@/lib/utils";

const FILTER_OPTIONS: Array<{
  value: CitizenReportFilterStatus | "all";
  label: string;
}> = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "verified", label: "Terverifikasi" },
  { value: "in_progress", label: "Diproses" },
  { value: "clarification_requested", label: "Klarifikasi" },
  { value: "resolved", label: "Selesai" },
];

export function CitizenDashboardFilters({
  value,
  onChange,
  showAgencies = true,
  onToggleAgencies,
  showAgencyToggle = false,
  className,
}: CitizenDashboardFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const statusOptions = FILTER_OPTIONS.filter(
    (option): option is { value: CitizenReportFilterStatus; label: string } =>
      option.value !== "all",
  );
  const isAllSelected = statusOptions.every((option) =>
    value.includes(option.value),
  );
  const selectedStatusCount = statusOptions.filter((option) =>
    value.includes(option.value),
  ).length;
  const isFilterActive = !isAllSelected || (showAgencyToggle && !showAgencies);
  const activeLabel = isAllSelected
    ? "Semua"
    : selectedStatusCount === 1
      ? statusOptions.find((option) => value.includes(option.value))?.label ||
        "1 status"
      : `${selectedStatusCount} status`;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (filterRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  return (
    <div
      ref={filterRef}
      className={cn(
        "relative shrink-0",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`flex h-9 w-full min-w-0 shrink-0 items-center justify-center gap-1.5 rounded-full px-2 text-[10px] font-black transition-colors md:h-8 md:w-auto md:justify-start md:px-3 ${
          isFilterActive
            ? "bg-gray-900 text-white shadow-sm"
            : "border border-gray-100 bg-white text-gray-600 hover:bg-gray-100"
        }`}
      >
        <Filter size={14} strokeWidth={2.5} />
        <span className="shrink-0">Filter</span>
        <span
          className={`min-w-0 max-w-[120px] truncate ${
            isFilterActive ? "text-white/70" : "text-gray-400"
          }`}
        >
          {activeLabel}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[min(240px,calc(100vw-2rem))] rounded-xl border border-gray-100 bg-white p-2 text-left shadow-[0_18px_44px_rgba(15,23,42,0.16)] md:bottom-[calc(100%+10px)] md:top-auto">
          <p className="px-2 pb-2 pt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
            Status laporan
          </p>
          <div className="space-y-1">
            {FILTER_OPTIONS.map((option) => {
              const isActive =
                option.value === "all"
                  ? isAllSelected
                  : value.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange(option.value)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      isActive
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 bg-white text-transparent"
                    }`}
                  >
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          {showAgencyToggle && (
            <div className="mt-2 border-t border-gray-100 pt-2">
              <button
                type="button"
                onClick={onToggleAgencies}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    showAgencies
                      ? "border-[#db2744] bg-[#db2744] text-white"
                      : "border-gray-300 bg-white text-transparent"
                  }`}
                >
                  <Check size={11} strokeWidth={3} />
                </span>
                <Building2 size={14} className="text-[#db2744]" />
                <span>Tampilkan dinas</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
