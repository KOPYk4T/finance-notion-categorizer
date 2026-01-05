import { useEffect } from "react";

interface KeyboardShortcutsConfig {
  onSearch?: () => void;
  onToggleView?: () => void;
  isSearchOpen?: boolean;
}

export const useKeyboardShortcuts = ({
  onSearch,
  onToggleView,
  isSearchOpen = false,
}: KeyboardShortcutsConfig) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "k" && onSearch) {
        e.preventDefault();
        onSearch();
        return;
      }

      if (e.key === "/" && !isSearchOpen && onSearch) {
        e.preventDefault();
        onSearch();
        return;
      }

      if ((e.key === "v" || e.key === "V") && !e.metaKey && !e.ctrlKey && onToggleView) {
        e.preventDefault();
        onToggleView();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSearch, onToggleView, isSearchOpen]);
};

