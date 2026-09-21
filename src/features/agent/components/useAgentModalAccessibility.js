// src/features/agent/components/useAgentModalAccessibility.js
// Comportamiento de accesibilidad compartido por los modales del módulo de
// agente: foco inicial, trampa de foco (Tab), cierre con Escape, bloqueo de
// scroll del turno y devolución del foco al elemento que abrió el modal.
// BpoResetModal no lo usa: es un flujo fullscreen con foco por fase propia.

import { useEffect, useRef } from 'react';

// Selector de elementos enfocables dentro del modal (excluye los ocultos por tabindex)
const FOCUSABLE_SELECTOR = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(', ');

export function useAgentModalAccessibility({ isOpen, onClose, dialogRef }) {
    const openerRef = useRef(null);

    // Foco inicial, trampa de foco, Escape y bloqueo de scroll mientras está abierto
    useEffect(() => {
        if (!isOpen) return undefined;

        openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        const getFocusables = () => {
            const dialog = dialogRef.current;
            if (!dialog) return [];
            return Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR));
        };

        // El foco inicial va al botón de cierre cuando existe: garantiza una
        // salida visible por teclado sin depender de recordar el Escape.
        const closeBtn = dialogRef.current?.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.focus();
        } else {
            getFocusables()[0]?.focus();
        }

        const handleKey = (e) => {
            if (e.key === 'Escape') {
                onClose();
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
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen, onClose, dialogRef]);

    // Al cerrar, el foco vuelve al elemento que abrió el modal
    useEffect(() => {
        if (!isOpen && openerRef.current) {
            openerRef.current.focus?.();
            openerRef.current = null;
        }
    }, [isOpen]);

    return { openerRef };
}