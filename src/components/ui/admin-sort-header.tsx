import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

type SortDir = "asc" | "desc";

type AdminSortHeaderProps = {
  label: string;
  sortKey?: string;
  sortBy?: string;
  sortDir?: SortDir;
  align?: "left" | "center" | "right";
  className?: string;
  onSort?: (sortKey: string) => void;
};

export function AdminSortHeader({
  label,
  sortKey,
  sortBy,
  sortDir,
  align = "left",
  className = "",
  onSort,
}: AdminSortHeaderProps) {
  const isActive = Boolean(sortKey && sortBy === sortKey && sortDir);
  const alignClass =
    align === "right"
      ? "justify-end text-right"
      : align === "center"
        ? "justify-center text-center"
        : "justify-start text-left";

  return (
    <th
      className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 ${className}`}
    >
      {sortKey ? (
        <button
          type="button"
          onClick={() => onSort?.(sortKey)}
          className={`inline-flex w-full items-center gap-1.5 transition-colors hover:text-gray-900 ${alignClass} ${
            isActive ? "text-gray-900" : ""
          }`}
        >
          <span>{label}</span>
          {isActive ? (
            sortDir === "asc" ? (
              <ArrowUp size={12} className="text-[#db2744]" strokeWidth={3} />
            ) : (
              <ArrowDown size={12} className="text-[#db2744]" strokeWidth={3} />
            )
          ) : (
            <ChevronsUpDown size={12} className="text-gray-300" />
          )}
        </button>
      ) : (
        <span className={`inline-flex w-full ${alignClass}`}>{label}</span>
      )}
    </th>
  );
}
