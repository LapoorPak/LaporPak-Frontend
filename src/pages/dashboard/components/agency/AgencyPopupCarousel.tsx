import { useState } from "react";
import { resolvePhotoUrl } from "@/lib/resolve-photo-url";
import {
  Activity,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Star,
  TimerReset,
  ZoomIn,
  type LucideIcon,
} from "lucide-react";
import type { AgencyPopupCarouselProps } from "@/types/dashboard";

function AgencyPhotoPlaceholder({ name }: { name: string }) {
  return (
    <div className="flex h-[170px] w-full flex-col items-center justify-center gap-2 border-b border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 sm:h-full sm:min-h-[210px] sm:border-b-0 sm:border-r">
      <div className="w-9 h-9 rounded-full bg-white/80 border border-gray-200 shadow-sm flex items-center justify-center">
        <Building2 size={17} strokeWidth={2.4} />
      </div>
      <span className="max-w-[140px] text-center text-[10px] font-black uppercase tracking-wider leading-tight">
        Foto {name} belum tersedia
      </span>
    </div>
  );
}

export function AgencyPopupCarousel({
  agency,
  onPhotoClick,
  performance,
  onOpenPerformanceDetail,
}: AgencyPopupCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedPhotos, setFailedPhotos] = useState<Set<string>>(() => new Set());
  const photos = (agency.photos?.length ? agency.photos : agency.photoUrl ? [agency.photoUrl] : [])
    .map(resolvePhotoUrl)
    .filter((url) => url && !failedPhotos.has(url));

  if (photos.length === 0) {
    return (
      <div className="grid grid-cols-1 bg-white sm:grid-cols-[42%_minmax(0,1fr)]">
        <AgencyPhotoPlaceholder name={agency.dinasShort || agency.name} />
        <AgencyPerformanceSummary
          agency={agency}
          performance={performance}
          onOpenPerformanceDetail={onOpenPerformanceDetail}
        />
      </div>
    );
  }

  const safeCurrentIndex = Math.min(currentIndex, photos.length - 1);

  return (
    <div className="grid grid-cols-1 bg-white sm:grid-cols-[42%_minmax(0,1fr)]">
      <div className="relative h-[180px] w-full overflow-hidden border-b border-gray-100 bg-gray-100 sm:h-full sm:min-h-[210px] sm:border-b-0 sm:border-r">
        <button
          type="button"
          className="absolute inset-0 w-full h-full cursor-zoom-in z-[1]"
          onClick={(e) => {
            e.stopPropagation();
            onPhotoClick(photos, safeCurrentIndex);
          }}
        />
        <img
          src={photos[safeCurrentIndex]}
          alt={agency.name}
          className="h-full w-full object-cover transition-all"
          onError={() => {
            const failedUrl = photos[safeCurrentIndex];
            setFailedPhotos((current) => {
              const next = new Set(current);
              next.add(failedUrl);
              return next;
            });
            setCurrentIndex(0);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        <ZoomIn
          size={16}
          className="absolute top-2 right-2 text-white drop-shadow opacity-70 pointer-events-none z-[2]"
        />

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) =>
                  prev > 0 ? prev - 1 : photos.length - 1,
                );
              }}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-[2px] transition-all hover:bg-black/60 active:scale-95 z-10 focus:outline-none shadow-sm"
            >
              <ChevronLeft size={15} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) =>
                  prev < photos.length - 1 ? prev + 1 : 0,
                );
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-[2px] transition-all hover:bg-black/60 active:scale-95 z-10 focus:outline-none shadow-sm"
            >
              <ChevronRight size={15} strokeWidth={2.5} />
            </button>

            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
              {photos.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === safeCurrentIndex ? "bg-white w-3" : "bg-white/50 w-1.5"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <AgencyPerformanceSummary
        agency={agency}
        performance={performance}
        onOpenPerformanceDetail={onOpenPerformanceDetail}
      />
    </div>
  );
}

function AgencyPerformanceSummary({
  agency,
  performance,
  onOpenPerformanceDetail,
}: {
  agency: AgencyPopupCarouselProps["agency"];
  performance?: AgencyPopupCarouselProps["performance"];
  onOpenPerformanceDetail?: AgencyPopupCarouselProps["onOpenPerformanceDetail"];
}) {
  const metrics = performance ?? {
    total: 0,
    resolved: 0,
    active: 0,
    overdue: 0,
    stale: 0,
    averageRating: null,
    ratingCount: 0,
    completionRate: 0,
    averageResolutionHours: null,
    longestOpenHours: null,
  };

  const averageResolutionLabel =
    metrics.averageResolutionHours === null
      ? "0 jam"
      : formatDuration(metrics.averageResolutionHours);
  const longestOpenLabel =
    metrics.longestOpenHours === null
      ? "0 jam"
      : formatDuration(metrics.longestOpenHours);
  const ratingLabel =
    metrics.averageRating === null
      ? "0/5"
      : `${metrics.averageRating.toFixed(1)}/5`;

  return (
    <div className="min-w-0 bg-white px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
          Performa Dinas
        </p>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-gray-500">
            {metrics.completionRate}%
          </span>
          {onOpenPerformanceDetail && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenPerformanceDetail(agency);
              }}
              className="flex h-6 items-center gap-1 rounded-full bg-indigo-50 px-2 text-[8px] font-black uppercase tracking-wider text-indigo-600 transition hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              title="Detail performa"
              aria-label="Detail performa dinas"
            >
              <BarChart3 size={13} strokeWidth={2.5} />
              <span>Detail</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <MetricTile
          icon={Star}
          label="Rating"
          value={ratingLabel}
          helper={`${metrics.ratingCount} rating`}
          tooltip="Nilai rata-rata dari warga untuk laporan selesai yang sudah diberi rating."
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <MetricTile
          icon={CheckCircle2}
          label="Selesai"
          value={metrics.resolved}
          helper={`${metrics.total} total`}
          tooltip="Jumlah laporan yang sudah selesai dibanding seluruh laporan dinas ini."
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <MetricTile
          icon={Activity}
          label="Proses"
          value={metrics.active}
          helper={`${metrics.overdue} terlambat`}
          tooltip="Jumlah laporan aktif yang masih ditangani. Terlambat berarti sudah melewati estimasi SLA."
          color="text-sky-600"
          bg="bg-sky-50"
        />
        <MetricTile
          icon={TimerReset}
          label="Terlama"
          value={longestOpenLabel}
          helper={`${metrics.stale} mandek`}
          tooltip="Durasi laporan aktif tertua yang belum selesai. Mandek berarti aktif lebih dari 14 hari."
          color="text-rose-600"
          bg="bg-rose-50"
        />
      </div>

      <div className="mt-2 flex min-w-0 items-center gap-2 rounded-sm bg-gray-50 px-2.5 py-2">
        <Clock size={13} className="shrink-0 text-gray-400" />
        <span className="truncate text-[10px] font-bold text-gray-600">
          Rata-rata selesai {averageResolutionLabel}
        </span>
      </div>
    </div>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
  helper,
  tooltip,
  color,
  bg,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  helper: string;
  tooltip: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      className="relative min-w-0 rounded-sm border border-gray-100 bg-gray-50 px-2 py-2 focus-within:border-indigo-200"
    >
      <div className="mb-1 flex items-center gap-1.5">
        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}>
          <Icon size={11} strokeWidth={2.5} />
        </span>
        <span className="truncate text-[8px] font-black uppercase tracking-wider text-gray-400">
          {label}
        </span>
        <span
          className="group/tooltip ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-gray-300 transition hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          tabIndex={0}
          role="button"
          aria-label={`${label}: ${tooltip}`}
        >
          <Info size={10} strokeWidth={2.5} />
          <span className="pointer-events-none absolute left-2 right-2 top-8 z-30 rounded-sm bg-gray-950 px-2 py-1.5 text-[9px] font-bold leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus/tooltip:opacity-100">
            {tooltip}
          </span>
        </span>
      </div>
      <p className="truncate text-[13px] font-black text-gray-900">{value}</p>
      <p className="truncate text-[9px] font-bold text-gray-400">{helper}</p>
    </div>
  );
}

function formatDuration(hours: number) {
  if (hours < 24) {
    return `${Math.max(1, Math.round(hours))} jam`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);

  if (remainingHours === 0) {
    return `${days} hari`;
  }

  return `${days}h ${remainingHours}j`;
}
