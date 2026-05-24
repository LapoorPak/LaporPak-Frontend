import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

type UseMobileSheetResizeOptions = {
  enabled?: boolean;
  resetWhen?: boolean;
  initialHeight?: number;
  minHeight?: number;
  maxHeight?: number;
};

export function useMobileSheetResize({
  enabled = true,
  resetWhen = false,
  initialHeight = 72,
  minHeight = 44,
  maxHeight = 92,
}: UseMobileSheetResizeOptions = {}) {
  const [height, setHeight] = useState(initialHeight);
  const resizeStateRef = useRef<{ startY: number; startHeight: number } | null>(
    null,
  );
  const resizeMovedRef = useRef(false);

  useEffect(() => {
    if (!resetWhen) return;

    const frame = window.requestAnimationFrame(() => {
      setHeight(initialHeight);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [initialHeight, resetWhen]);

  const startResize = useCallback(
    (event: ReactPointerEvent) => {
      if (!enabled) return;

      event.preventDefault();
      event.stopPropagation();
      resizeMovedRef.current = false;
      resizeStateRef.current = {
        startY: event.clientY,
        startHeight: height,
      };

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const resizeState = resizeStateRef.current;
        if (!resizeState) return;

        const deltaY = resizeState.startY - moveEvent.clientY;
        if (Math.abs(deltaY) > 2) {
          resizeMovedRef.current = true;
        }

        const nextHeight =
          resizeState.startHeight + (deltaY / window.innerHeight) * 100;

        setHeight(Math.min(maxHeight, Math.max(minHeight, nextHeight)));
      };

      const handlePointerUp = () => {
        resizeStateRef.current = null;
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
    },
    [enabled, height, maxHeight, minHeight],
  );

  const resetHeight = useCallback(() => {
    setHeight(initialHeight);
  }, [initialHeight]);

  return {
    height,
    resizeMovedRef,
    resetHeight,
    setHeight,
    startResize,
  };
}
