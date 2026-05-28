import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpTooltip } from "@/components/ui/help-tooltip";

type CitizenRatingControlProps = {
  title: string;
  currentScore?: number | null;
  averageScore?: number | null;
  ratingCount?: number;
  score: number;
  isSubmitting?: boolean;
  tooltip?: string;
  onScoreChange: (score: number) => void;
  onSubmit: () => void;
};

function RatingStar({
  index,
  score,
  disabled,
  onScoreChange,
}: {
  index: number;
  score: number;
  disabled?: boolean;
  onScoreChange: (score: number) => void;
}) {
  const starValue = index + 1;
  const fillPercent =
    score >= starValue ? 100 : score >= starValue - 0.5 ? 50 : 0;

  return (
    <span className="relative inline-flex h-8 w-8 items-center justify-center">
      <Star
        size={26}
        className="absolute inset-1 text-gray-300"
        strokeWidth={2.2}
      />
      <Star
        size={26}
        className="absolute inset-1 fill-amber-400 text-amber-400"
        strokeWidth={2.2}
        style={{ clipPath: `inset(0 ${100 - fillPercent}% 0 0)` }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => onScoreChange(starValue - 0.5)}
        className="absolute left-0 top-0 h-full w-1/2 rounded-l-sm disabled:cursor-default"
        aria-label={`Beri rating ${starValue - 0.5}`}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => onScoreChange(starValue)}
        className="absolute right-0 top-0 h-full w-1/2 rounded-r-sm disabled:cursor-default"
        aria-label={`Beri rating ${starValue}`}
      />
    </span>
  );
}

function formatRating(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function CitizenRatingControl({
  title,
  currentScore,
  averageScore,
  ratingCount,
  score,
  isSubmitting,
  tooltip = "Rating hanya bisa diberikan setelah laporan selesai. Nilai ini dipakai untuk menghitung performa dinas.",
  onScoreChange,
  onSubmit,
}: CitizenRatingControlProps) {
  const hasCurrentScore = typeof currentScore === "number";
  const hasAverageScore = typeof averageScore === "number";
  const displayScore = hasCurrentScore
    ? averageScore ?? currentScore
    : score;
  const ratingLabel = hasCurrentScore
    ? "Rata-rata"
    : "Pilihan Anda";

  return (
    <div
      className="rounded-sm border border-emerald-100 bg-emerald-50/80 p-3"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-[10px] font-black uppercase tracking-widest text-emerald-700">
            {title}
          </p>
          <HelpTooltip content={tooltip} />
        </div>
        {hasCurrentScore && (
          <span className="shrink-0 text-right text-[9px] font-bold uppercase tracking-wide text-emerald-700">
            Rating Anda {formatRating(currentScore)}/5
          </span>
        )}
      </div>
      <div className="mb-2 flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <RatingStar
            key={index}
            index={index}
            score={displayScore}
            disabled={hasCurrentScore}
            onScoreChange={onScoreChange}
          />
        ))}
      {displayScore > 0 && (
        <span className="ml-2 flex min-w-0 flex-col leading-none">
          <span className="text-xs font-black text-amber-600">
            {formatRating(displayScore)}/5
          </span>
          <span className="mt-1 truncate text-[8px] font-black uppercase tracking-wider text-amber-600/70">
            {ratingLabel}
            {hasCurrentScore && hasAverageScore && ratingCount
              ? ` (${ratingCount})`
              : ""}
          </span>
        </span>
      )}
      </div>
      {!hasCurrentScore && (
        <Button
          type="button"
          size="sm"
          disabled={!score || isSubmitting}
          onClick={onSubmit}
          className="mt-2 h-9 w-full rounded-sm bg-emerald-700 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-800"
        >
          {isSubmitting ? "Menyimpan..." : "Kirim Rating"}
        </Button>
      )}
    </div>
  );
}
