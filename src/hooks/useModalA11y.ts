import { useEffect, useRef } from 'react';

// Minimal ESC-to-close hook — for callers that don't need a focus trap
// (e.g. inline confirm dialogs whose only focusable child is a single
// action button that already receives focus naturally).
export function useEscapeKey(isOpen: boolean, onClose?: () => void): void {
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);
}

// Reusable modal a11y hook:
//  - ESC closes the modal (if `onClose` given)
//  - Focus is moved into the modal on open, restored to the prior element on close
//  - Tab key cycles focus inside the modal (trap), so keyboard users can't
//    accidentally land on page content hidden behind the backdrop
//
// Usage:
//   const ref = useModalA11y(isOpen, () => setOpen(false));
//   return <div ref={ref} role="dialog" aria-modal="true">…</div>
export function useModalA11y<T extends HTMLElement = HTMLDivElement>(
  isOpen: boolean,
  onClose?: () => void,
) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusableSelector =
      'a[href],area[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (el) => !el.hasAttribute('aria-hidden'),
      );

    // Move initial focus into the modal
    const first = getFocusable()[0];
    if (first) {
      first.focus();
    } else {
      // No focusable child — focus the container itself so ESC/TAB still work
      container.setAttribute('tabindex', '-1');
      container.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusables = getFocusable();
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === firstEl || !container.contains(active)) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (active === lastEl || !container.contains(active)) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      // Restore focus to whatever opened the modal
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose]);

  return containerRef;
}
