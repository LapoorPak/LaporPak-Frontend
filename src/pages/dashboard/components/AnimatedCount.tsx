import { useEffect, useRef, useState } from "react";

interface AnimatedCountProps {
  value: number;
  durationMs?: number;
  className?: string;
}

export function AnimatedCount({
  value,
  durationMs = 650,
  className,
}: AnimatedCountProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const currentValueRef = useRef(value);

  useEffect(() => {
    const startValue = currentValueRef.current;
    const endValue = value;

    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    let frameId = 0;
    const startTime = performance.now();
    const delta = endValue - startValue;

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      const nextValue = Math.round(startValue + delta * easedProgress);

      currentValueRef.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
        return;
      }

      currentValueRef.current = endValue;
      setDisplayValue(endValue);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, [durationMs, value]);

  return <span className={className}>{displayValue}</span>;
}
