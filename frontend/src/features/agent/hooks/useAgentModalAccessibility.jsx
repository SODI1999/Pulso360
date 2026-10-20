import { useEffect, useRef } from 'react';
import { useBodyScrollLock } from '../../../core/hooks/useBodyScrollLock';

// Selector de elementos enfocables dentro del modal (excluye los ocultos por tabindex)
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

/**
 * Custom hook providing accessibility, focus trapping (Tab), Escape dismissal,
 * body scroll locking, and initial focus restoration for agent modals.
 *
 * @param {Object} options - Hook options.
 * @param {boolean} options.isOpen - Indicates whether the modal dialog is currently visible.
 * @param {() => void} options.onClose - Callback triggered when Escape is pressed.
 * @param {import('react').RefObject<HTMLElement>} options.dialogRef - Reference to the modal dialog DOM element.
 * @returns {{openerRef: import('react').MutableRefObject<HTMLElement|null>}} Ref holding the DOM element that triggered the modal.
 */
export function useAgentModalAccessibility({ isOpen, onClose, dialogRef }) {
  const openerRef = useRef(null);
  const hasFocusedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useBodyScrollLock(isOpen);

  // Foco inicial solo una vez al abrir el modal (evita que cada click resetee el scroll al botón superior)
  useEffect(() => {
    if (!isOpen) {
      hasFocusedRef.current = false;
      return;
    }

    if (!hasFocusedRef.current) {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

      const closeBtn = dialogRef.current?.querySelector('.modal-close-btn');
      if (closeBtn) {
        closeBtn.focus();
      } else {
        const firstFocusable = dialogRef.current?.querySelector(FOCUSABLE_SELECTOR);
        firstFocusable?.focus();
      }
      hasFocusedRef.current = true;
    }
  }, [isOpen, dialogRef]);

  // Trampa de foco (Tab) y Escape mientras está abierto
  useEffect(() => {
    if (!isOpen) return undefined;

    const getFocusables = () => {
      const dialog = dialogRef.current;
      if (!dialog) return [];
      return Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR));
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusables = getFocusables();
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement;

      // Si el foco se salió del modal por cualquier motivo, lo devolvemos
      if (!dialogRef.current?.contains(current)) {
        first.focus();
        e.preventDefault();
        return;
      }
      if (e.shiftKey && current === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && current === last) {
        first.focus();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, dialogRef]);

  // Al cerrar, el foco vuelve al elemento que abrió el modal
  useEffect(() => {
    if (!isOpen && openerRef.current) {
      openerRef.current.focus?.();
      openerRef.current = null;
    }
  }, [isOpen]);

  return { openerRef };
}
