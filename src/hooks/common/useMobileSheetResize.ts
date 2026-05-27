import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

type UseMobileSheetResizeOptions = {
  enabled?: boolean;
  resetWhen?: boolean;
  initialHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  snapPoints?: number[];
  closeHeight?: number;
  closeVelocity?: number;
  onClose?: () => void;
};

export function useMobileSheetResize({
  enabled = true,
  resetWhen = false,
  initialHeight = 72,
  minHeight = 44,
  maxHeight = 92,
  snapPoints,
  closeHeight,
  closeVelocity = 0.65,
  onClose,
}: UseMobileSheetResizeOptions = {}) {
  const [height, setHeight] = useState(initialHeight);
  const resizeStateRef = useRef<{
    startY: number;
    startHeight: number;
    lastY: number;
    lastTime: number;
    velocityY: number;
  } | null>(null);
  const resizeMovedRef = useRef(false);
  const latestHeightRef = useRef(initialHeight);

  useEffect(() => {
    latestHeightRef.current = height;
  }, [height]);

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
        lastY: event.clientY,
        lastTime: performance.now(),
        velocityY: 0,
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
        const now = performance.now();
        const elapsed = Math.max(1, now - resizeState.lastTime);

        resizeState.velocityY = (moveEvent.clientY - resizeState.lastY) / elapsed;
        resizeState.lastY = moveEvent.clientY;
        resizeState.lastTime = now;

        setHeight(Math.min(maxHeight, Math.max(minHeight, nextHeight)));
      };

      const handlePointerUp = () => {
        const resizeState = resizeStateRef.current;
        const currentHeight = latestHeightRef.current;

        resizeStateRef.current = null;
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);

        if (
          resizeState &&
          onClose &&
          closeHeight !== undefined &&
          (currentHeight <= closeHeight ||
            (resizeState.velocityY > closeVelocity &&
              currentHeight < initialHeight))
        ) {
          onClose();
          return;
        }

        if (snapPoints?.length) {
          const nearest = snapPoints.reduce((currentNearest, point) =>
            Math.abs(point - currentHeight) < Math.abs(currentNearest - currentHeight)
              ? point
              : currentNearest,
          );
          setHeight(nearest);
        }
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
    },
    [
      closeHeight,
      closeVelocity,
      enabled,
      height,
      initialHeight,
      maxHeight,
      minHeight,
      onClose,
      snapPoints,
    ],
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
