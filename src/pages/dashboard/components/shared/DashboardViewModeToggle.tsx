import { ListFilter, MapPin } from "lucide-react";
import type {
  DashboardViewModeOption,
  DashboardViewModeToggleProps,
} from "@/types/dashboard";

const DASHBOARD_VIEW_OPTIONS: DashboardViewModeOption[] = [
  { key: "map", label: "Map", icon: MapPin },
  { key: "feed", label: "Feed", icon: ListFilter },
];

export function DashboardViewModeToggle({
  value,
  onChange,
}: DashboardViewModeToggleProps) {
  return (
    <div className="flex rounded-full border border-gray-100 bg-gray-50 p-0.5 shadow-inner sm:p-1">
      {DASHBOARD_VIEW_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.key;

        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.key)}
            className={`flex h-8 min-w-[52px] items-center justify-center gap-1 rounded-full px-2 text-[10px] font-black transition-colors sm:min-w-[74px] sm:gap-1.5 sm:px-3 sm:text-[11px] ${
              isActive
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:bg-white hover:text-gray-900"
            }`}
          >
            <Icon size={14} strokeWidth={2.5} />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
