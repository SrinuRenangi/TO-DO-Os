import { useEffect } from 'react';
import { useAppStore, MODULE_REGISTRY } from '@/stores/useAppStore';

export function useKeyboardShortcuts() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    quickCaptureOpen,
    setQuickCaptureOpen,
    setActiveModule,
  } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable;

      // Command Palette (Cmd+K / Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
        return;
      }

      // Quick Capture (Cmd+N / Ctrl+N)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setQuickCaptureOpen(!quickCaptureOpen);
        return;
      }

      // Escape closes open overlays
      if (e.key === 'Escape') {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
          return;
        }
        if (quickCaptureOpen) {
          setQuickCaptureOpen(false);
          return;
        }
      }

      // Module navigation hotkeys (1-9) when not typing in an input
      if (!isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 9) {
          const targetModule = MODULE_REGISTRY.find((m) => m.hotkey === String(num));
          if (targetModule) {
            e.preventDefault();
            setActiveModule(targetModule.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    commandPaletteOpen,
    setCommandPaletteOpen,
    quickCaptureOpen,
    setQuickCaptureOpen,
    setActiveModule,
  ]);
}
