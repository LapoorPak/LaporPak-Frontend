import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function maskCitizenName(name?: string | null, fallback = "Warga") {
  const trimmedName = name?.trim();
  if (!trimmedName) return fallback;

  return trimmedName
    .split(/(\s+)/)
    .map((part) => {
      if (/^\s+$/.test(part)) return part;
      if (part.length <= 1) return part;
      if (part.length === 2) return `${part[0]}*`;
      if (part.length === 3) return `${part[0]}*${part[2]}`;

      const visibleSuffix = part.slice(-2);
      const hiddenLength = Math.max(1, part.length - 3);
      return `${part[0]}${"*".repeat(hiddenLength)}${visibleSuffix}`;
    })
    .join("");
}
