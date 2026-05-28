import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    right: "auto" as number | "auto",
  });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const tooltipWidth = 224;
    const gap = 8;
    const viewportPadding = 12;
    const left =
      align === "right"
        ? Math.max(viewportPadding, rect.right - tooltipWidth)
        : Math.min(
            Math.max(viewportPadding, rect.left),
            window.innerWidth - tooltipWidth - viewportPadding,
          );

    setPosition({
      top: rect.bottom + gap,
      left,
      right: "auto",
    });
  }, [align]);

  const openTooltip = () => {
    updatePosition();
    setIsOpen(true);
  };

  const closeTooltip = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  return (
    <span
      className={`group/help relative inline-flex shrink-0 items-center ${className}`}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}
      onFocus={openTooltip}
      onBlur={closeTooltip}
    >
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        aria-label={`${label}: ${content}`}
        title={content}
      >
        <Info size={11} strokeWidth={2.4} />
      </button>
      {isOpen &&
        createPortal(
          <span
            className="pointer-events-none fixed z-[10000] w-56 rounded-sm bg-gray-950 px-2.5 py-2 text-[10px] font-bold leading-snug text-white shadow-lg"
            style={position}
          >
            {content}
          </span>,
          document.body,
        )}
    </span>
  );
}
