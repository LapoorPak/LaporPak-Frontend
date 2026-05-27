import { Info } from "lucide-react";

type HelpTooltipProps = {
  content: string;
  label?: string;
  align?: "left" | "right";
  className?: string;
};

export function HelpTooltip({
  content,
  label = "Penjelasan",
  align = "left",
  className = "",
}: HelpTooltipProps) {
  return (
    <span
      className={`group/help relative inline-flex shrink-0 items-center ${className}`}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        aria-label={`${label}: ${content}`}
        title={content}
      >
        <Info size={11} strokeWidth={2.4} />
      </button>
      <span
        className={`pointer-events-none absolute top-5 z-50 w-56 rounded-sm bg-gray-950 px-2.5 py-2 text-[10px] font-bold leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/help:opacity-100 group-focus-within/help:opacity-100 ${
          align === "right" ? "right-0" : "left-0"
        }`}
      >
        {content}
      </span>
    </span>
  );
}
