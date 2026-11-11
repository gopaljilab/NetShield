import { useEffect } from 'react';

export interface ShortcutHandlers {
  onOpenCommandPalette?: () => void;
  onOpenShortcutsModal?: () => void;
  onNavigatePage?: (index: number) => void;
  onRefresh?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // Cmd+K or Ctrl+K - always accessible, even from inputs
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handlers.onOpenCommandPalette?.();
        return;
      }

      // Escape - always closes open modals/palettes
      if (e.key === 'Escape') {
        handlers.onEscape?.();
        return;
      }

      // Other single-key shortcuts are ignored when typing inside inputs
      if (isInput) return;

      // ? or Shift+/ -> Open shortcuts cheatsheet
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        handlers.onOpenShortcutsModal?.();
        return;
      }

      // R or r -> Refresh telemetry
      if (e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handlers.onRefresh?.();
        return;
      }

      // Number keys 1-6 -> Navigate tabs
      if (['1', '2', '3', '4', '5', '6', '7'].includes(e.key) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const pageIdx = parseInt(e.key, 10);
        handlers.onNavigatePage?.(pageIdx);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
