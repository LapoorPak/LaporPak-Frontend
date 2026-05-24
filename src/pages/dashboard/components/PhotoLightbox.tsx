import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion } from "framer-motion";
import { resolvePhotoUrl } from "@/lib/resolve-photo-url";

export type PhotoLightboxState = { images: string[]; index: number } | null;

export function PhotoLightbox({
  images,
  index,
  onClose,
}: {
  images: string[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);

  const prev = useCallback(
    () => setCurrent((i) => (i > 0 ? i - 1 : images.length - 1)),
    [images.length],
  );
  const next = useCallback(
    () => setCurrent((i) => (i < images.length - 1 ? i + 1 : 0)),
    [images.length],
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/92 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
        onClick={onClose}
      >
        <X size={18} />
      </button>

      {images.length > 1 && (
        <span className="hidden md:inline absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-xs font-bold tracking-widest">
          {current + 1} / {images.length}
        </span>
      )}

      {images.length > 1 && (
        <>
          <button
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition-colors z-10"
            onClick={(event) => {
              event.stopPropagation();
              prev();
            }}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition-colors z-10"
            onClick={(event) => {
              event.stopPropagation();
              next();
            }}
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      <motion.img
        key={current}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        src={resolvePhotoUrl(images[current])}
        alt={`Foto ${current + 1}`}
        className="max-w-[92vw] max-h-[75vh] md:max-h-[88vh] object-contain rounded-sm shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      />

      {images.length > 1 && (
        <div className="md:hidden absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6 z-10">
          <button
            className="w-12 h-12 rounded-full bg-white/15 active:bg-white/30 text-white flex items-center justify-center transition-colors"
            onClick={(event) => {
              event.stopPropagation();
              prev();
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-white/60 text-sm font-bold tracking-widest min-w-[48px] text-center">
            {current + 1} / {images.length}
          </span>
          <button
            className="w-12 h-12 rounded-full bg-white/15 active:bg-white/30 text-white flex items-center justify-center transition-colors"
            onClick={(event) => {
              event.stopPropagation();
              next();
            }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </motion.div>
  );
}
