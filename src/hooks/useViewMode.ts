import { useState, useEffect } from "react";

type ViewMode = "normal" | "table";

const STORAGE_KEY = "finance-categorizer-view-mode";

export const useViewMode = (): [ViewMode, (mode: ViewMode) => void] => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "table" || saved === "normal" ? saved : "normal";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, viewMode);
  }, [viewMode]);

  return [viewMode, setViewMode];
};

