import { useState } from "react";
import { resolvePhotoUrl } from "@/lib/resolve-photo-url";
import { Building2, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import type { AgencyPopupCarouselProps } from "@/types/dashboard";

function AgencyPhotoPlaceholder({ name }: { name: string }) {
  return (
    <div className="w-full h-[120px] bg-gradient-to-br from-gray-100 to-gray-200 border-b border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-500">
      <div className="w-9 h-9 rounded-full bg-white/80 border border-gray-200 shadow-sm flex items-center justify-center">
        <Building2 size={17} strokeWidth={2.4} />
      </div>
      <span className="max-w-[180px] text-center text-[10px] font-black uppercase tracking-wider leading-tight">
        Foto {name} belum tersedia
      </span>
    </div>
  );
}

export function AgencyPopupCarousel({
  agency,
  onPhotoClick,
}: AgencyPopupCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedPhotos, setFailedPhotos] = useState<Set<string>>(() => new Set());
  const photos = (agency.photos?.length ? agency.photos : agency.photoUrl ? [agency.photoUrl] : [])
    .map(resolvePhotoUrl)
    .filter((url) => url && !failedPhotos.has(url));

  if (photos.length === 0) {
    return <AgencyPhotoPlaceholder name={agency.dinasShort || agency.name} />;
  }

  const safeCurrentIndex = Math.min(currentIndex, photos.length - 1);

  return (
    <div className="w-full h-[120px] bg-gray-100 relative group overflow-hidden">
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
        className="w-full h-full object-cover transition-all"
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

          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
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
  );
}
