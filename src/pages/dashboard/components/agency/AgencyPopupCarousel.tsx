import { useState } from "react";
import { resolvePhotoUrl } from "@/lib/resolve-photo-url";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import type { AgencyPopupCarouselProps } from "@/types/dashboard";

export function AgencyPopupCarousel({
  agency,
  onPhotoClick,
}: AgencyPopupCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!agency.photos || agency.photos.length === 0) {
    if (agency.photoUrl) {
      const url = resolvePhotoUrl(agency.photoUrl);
      return (
        <button
          type="button"
          className="w-full h-[120px] bg-gray-100 relative block"
          onClick={(e) => {
            e.stopPropagation();
            onPhotoClick([url], 0);
          }}
        >
          <img
            src={url}
            alt={agency.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ZoomIn
              size={20}
              className="text-white opacity-0 hover:opacity-100 transition-opacity drop-shadow"
            />
          </div>
        </button>
      );
    }
    return null;
  }

  const photos: string[] = agency.photos;

  return (
    <div className="w-full h-[120px] bg-gray-100 relative group overflow-hidden">
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-zoom-in z-[1]"
        onClick={(e) => {
          e.stopPropagation();
          onPhotoClick(photos.map(resolvePhotoUrl), currentIndex);
        }}
      />
      <img
        src={resolvePhotoUrl(photos[currentIndex])}
        alt={agency.name}
        className="w-full h-full object-cover transition-all"
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
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-white w-3" : "bg-white/50 w-1.5"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
