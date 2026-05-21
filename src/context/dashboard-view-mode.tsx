import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

export type DashboardViewMode = "map" | "feed";

const STORAGE_KEY = "laporpak.dashboard.viewMode";

type DashboardViewModeContextValue = {
  viewMode: DashboardViewMode;
  setViewMode: Dispatch<SetStateAction<DashboardViewMode>>;
  mobileControls: ReactNode | null;
  setMobileControls: Dispatch<SetStateAction<ReactNode | null>>;
};

const DashboardViewModeContext = createContext<DashboardViewModeContextValue | null>(null);

const isDashboardViewMode = (value: string | null): value is DashboardViewMode =>
  value === "map" || value === "feed";

export function DashboardViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<DashboardViewMode>(() => {
    if (typeof window === "undefined") {
      return "map";
    }

    const storedViewMode = window.localStorage.getItem(STORAGE_KEY);
    return isDashboardViewMode(storedViewMode) ? storedViewMode : "map";
  });
  const [mobileControls, setMobileControls] = useState<ReactNode | null>(null);
  const value = useMemo(
    () => ({ viewMode, setViewMode, mobileControls, setMobileControls }),
    [mobileControls, viewMode],
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, viewMode);
  }, [viewMode]);

  return (
    <DashboardViewModeContext.Provider value={value}>
      {children}
    </DashboardViewModeContext.Provider>
  );
}

export function useDashboardViewMode() {
  const context = useContext(DashboardViewModeContext);

  if (!context) {
    throw new Error("useDashboardViewMode must be used within DashboardViewModeProvider");
  }

  return context;
}
