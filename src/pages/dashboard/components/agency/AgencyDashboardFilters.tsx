import { useEffect, useRef, useState } from "react";
import { Check, Filter } from "lucide-react";
import type { AgencyDashboardFiltersProps } from "@/types/dashboard";
import { cn } from "@/lib/utils";

export function AgencyDashboardFilters({
  activeTabs,
  tabs,
  onTabChange,
  className,
}: AgencyDashboardFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const statusTabs = tabs.filter((tab) => tab.key !== "semua");
  const isAllSelected = statusTabs.every((tab) => activeTabs.includes(tab.key));
  const selectedStatusCount = statusTabs.filter((tab) =>
    activeTabs.includes(tab.key),
  ).length;
  const isFilterActive = !isAllSelected;
  const activeLabel = isAllSelected
    ? "Semua"
    : selectedStatusCount === 1
      ? tabs.find((tab) => tab.key === activeTabs[0])?.label || "1 status"
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
        className={`flex h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-[10px] font-black transition-colors md:h-8 md:w-auto md:justify-start ${
          isFilterActive
            ? "bg-gray-900 text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <Filter size={14} strokeWidth={2.5} />
        <span>Filter</span>
        <span
          className={`max-w-[120px] truncate ${
            isFilterActive ? "text-white/70" : "text-gray-400"
          }`}
        >
          {activeLabel}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-1/2 top-[calc(100%+8px)] z-50 w-[min(230px,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-gray-100 bg-white p-2 text-left shadow-[0_18px_44px_rgba(15,23,42,0.16)] md:bottom-[calc(100%+10px)] md:left-0 md:top-auto md:translate-x-0">
          <p className="px-2 pb-2 pt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
            Status tiket
          </p>
          <div className="space-y-1">
            {tabs.map((tab) => {
              const isActive =
                tab.key === "semua" ? isAllSelected : activeTabs.includes(tab.key);

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange(tab.key)}
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
                  <span className="min-w-0 flex-1">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
