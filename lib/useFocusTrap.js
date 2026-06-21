'use client';

import { useEffect } from 'react';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Traps Tab/Shift+Tab focus within the given ref while a modal is mounted.
// Pass onEscape to also close the modal on Escape.
export function useFocusTrap(containerRef, { onEscape } = {}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }
      if (e.key !== 'Tab' || !containerRef.current) return;

      const focusable = containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, onEscape]);
}
