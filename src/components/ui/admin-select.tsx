import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type AdminSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
  placeholder?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
};

type AdminMultiSelectProps = {
  values: string[];
  onChange: (values: string[]) => void;
  options: AdminSelectOption[];
  placeholder?: string;
  allLabel?: string;
  countLabel?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
};

type AdminDateInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
};

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const WEEKDAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function parseDateKey(value?: string | null) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthDays(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

function isSameDay(a: Date | null, b: Date) {
  return (
    !!a &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function AdminSelect({
  value,
  onChange,
  options,
  placeholder = "Pilih opsi",
  className,
  contentClassName,
  disabled,
}: AdminSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | null>(null);
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );
  const shouldFillWidth = className?.includes("w-full");

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;

      setMenuStyle({
        left: rect.left,
        top: rect.bottom + 4,
        width: Math.max(rect.width, 150),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-block min-w-[138px]", shouldFillWidth && "w-full")}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-2 rounded-sm border border-gray-200 bg-white px-3 text-left text-xs font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            !selectedOption && "text-gray-400",
          )}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2.5}
          className={cn(
            "shrink-0 text-gray-400 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && menuStyle && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={menuStyle}
          className={cn(
            "fixed z-[9999] max-h-72 overflow-y-auto rounded-sm border border-gray-200 bg-white p-1 shadow-xl",
            contentClassName,
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950 focus:bg-gray-100 focus:text-gray-950 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                  isSelected && "bg-gray-100 text-gray-950",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {isSelected && (
                  <Check size={13} strokeWidth={2.7} className="text-primary" />
                )}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}

export function AdminDateInput({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  className,
  disabled,
  min,
  max,
}: AdminDateInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | null>(null);
  const selectedDate = parseDateKey(value);
  const minDate = parseDateKey(min);
  const maxDate = parseDateKey(max);
  const [draftDate, setDraftDate] = useState<Date | null>(selectedDate);
  const [visibleMonth, setVisibleMonth] = useState(() => selectedDate ?? new Date());
  const shouldFillWidth = className?.includes("w-full");

  useEffect(() => {
    setDraftDate(selectedDate);
    if (selectedDate) setVisibleMonth(selectedDate);
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;

      setMenuStyle({
        left: rect.left,
        top: rect.bottom + 4,
        width: Math.max(rect.width, 264),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);
  const label = selectedDate ? DATE_LABEL_FORMATTER.format(selectedDate) : placeholder;

  const changeMonth = (direction: -1 | 1) => {
    setVisibleMonth((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + direction);
      return next;
    });
  };

  const isDateDisabled = (date: Date) =>
    Boolean((minDate && date < minDate) || (maxDate && date > maxDate));

  const openCalendar = () => {
    const nextDraftDate = selectedDate ?? new Date();
    setDraftDate(selectedDate);
    setVisibleMonth(nextDraftDate);
    setIsOpen((open) => !open);
  };

  const applyDate = () => {
    if (!draftDate) return;

    onChange(formatDateKey(draftDate));
    setIsOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-block min-w-[138px]", shouldFillWidth && "w-full")}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={openCalendar}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-2 rounded-sm border border-gray-200 bg-white px-3 text-left text-xs font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Calendar size={13} strokeWidth={2.4} className="shrink-0 text-gray-400" />
        <span className={cn("min-w-0 flex-1 truncate", !selectedDate && "text-gray-400")}>
          {label}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2.5}
          className={cn(
            "shrink-0 text-gray-400 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && menuStyle && createPortal(
        <div
          ref={menuRef}
          style={menuStyle}
          className="fixed z-[9999] rounded-sm border border-gray-200 bg-white p-2 shadow-xl"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-950"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft size={15} />
            </button>
            <p className="text-xs font-black text-gray-900">
              {MONTH_LABEL_FORMATTER.format(visibleMonth)}
            </p>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="flex h-7 w-7 items-center justify-center rounded-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-950"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((day) => (
              <div
                key={day}
                className="flex h-6 items-center justify-center text-[10px] font-black text-gray-400"
              >
                {day}
              </div>
            ))}
            {monthDays.map((date) => {
              const dateKey = formatDateKey(date);
              const isOutsideMonth = date.getMonth() !== visibleMonth.getMonth();
              const isSelected = isSameDay(draftDate, date);
              const isToday = isSameDay(new Date(), date);
              const dateDisabled = isDateDisabled(date);

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={dateDisabled}
                  onClick={() => {
                    setDraftDate(date);
                  }}
                  className={cn(
                    "flex h-7 items-center justify-center rounded-sm text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#db2744]/10",
                    isSelected
                      ? "bg-[#db2744] text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-950",
                    isOutsideMonth && !isSelected && "text-gray-300",
                    isToday && !isSelected && "border border-gray-300",
                    dateDisabled && "cursor-not-allowed opacity-30 hover:bg-transparent",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-end gap-2 border-t border-gray-100 pt-2">
            <button
              type="button"
              onClick={() => {
                setDraftDate(selectedDate);
                setIsOpen(false);
              }}
              className="h-7 rounded-sm px-2.5 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={!draftDate}
              onClick={applyDate}
              className="h-7 rounded-sm bg-gray-900 px-3 text-xs font-bold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Apply
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

export function AdminMultiSelect({
  values,
  onChange,
  options,
  placeholder = "Pilih opsi",
  allLabel = placeholder,
  countLabel = "Opsi",
  className,
  contentClassName,
  disabled,
}: AdminMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | null>(null);
  const shouldFillWidth = className?.includes("w-full");
  const selectedOptions = useMemo(
    () => options.filter((option) => values.includes(option.value)),
    [options, values],
  );
  const selectableOptions = useMemo(
    () => options.filter((option) => !option.disabled),
    [options],
  );
  const isAllSelected =
    selectableOptions.length > 0 &&
    selectableOptions.every((option) => values.includes(option.value));
  const label = isAllSelected
    ? allLabel
    : selectedOptions.length === 0
    ? placeholder
    : selectedOptions.length === 1
      ? selectedOptions[0].label
      : `${selectedOptions.length} ${countLabel}`;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;

      setMenuStyle({
        left: rect.left,
        top: rect.bottom + 4,
        width: Math.max(rect.width, 190),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  const toggleValue = (value: string) => {
    onChange(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
  };

  const toggleAll = () => {
    onChange(isAllSelected ? [] : selectableOptions.map((option) => option.value));
  };

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-block min-w-[150px]", shouldFillWidth && "w-full")}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-2 rounded-sm border border-gray-200 bg-white px-3 text-left text-xs font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:border-[#db2744] focus:ring-2 focus:ring-[#db2744]/10 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            selectedOptions.length === 0 && "text-gray-400",
          )}
        >
          {label}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2.5}
          className={cn(
            "shrink-0 text-gray-400 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && menuStyle && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={menuStyle}
          className={cn(
            "fixed z-[9999] max-h-72 overflow-y-auto rounded-sm border border-gray-200 bg-white p-1 shadow-xl",
            contentClassName,
          )}
        >
          <button
            type="button"
            onClick={toggleAll}
            className={cn(
              "mb-1 flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950 focus:bg-gray-100 focus:text-gray-950 focus:outline-none",
              isAllSelected && "bg-gray-100 text-gray-950",
            )}
          >
            <span
              className={cn(
                "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border",
                isAllSelected
                  ? "border-[#db2744] bg-[#db2744] text-white"
                  : "border-gray-300 bg-white",
              )}
            >
              {isAllSelected && <Check size={10} strokeWidth={3} />}
            </span>
            <span className="min-w-0 flex-1 truncate">{allLabel}</span>
          </button>

          {options.map((option) => {
            const isSelected = values.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                onClick={() => toggleValue(option.value)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950 focus:bg-gray-100 focus:text-gray-950 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                  isSelected && "bg-gray-100 text-gray-950",
                )}
              >
                <span
                  className={cn(
                    "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border",
                    isSelected
                      ? "border-[#db2744] bg-[#db2744] text-white"
                      : "border-gray-300 bg-white",
                  )}
                >
                  {isSelected && <Check size={10} strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}
