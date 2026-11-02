import { useEffect, useRef } from 'react';
import { useModalA11y } from '../../../core/hooks/useModalA11y';

/**
 * Conserva el contrato de los modales del agente usando la gestión modal compartida.
 * @param {object} options Estado, cierre y referencia del diálogo.
 * @param {boolean} options.isOpen Indica si el diálogo está abierto.
 * @param {Function} options.onClose Resuelve la acción de cierre del consumidor.
 * @param {object} options.dialogRef Referencia al diálogo del agente.
 * @returns {{openerRef: object}} Disparador conservado para restaurar el foco.
 */
export function useAgentModalAccessibility({ isOpen, onClose, dialogRef }) {
  const openerRef = useRef(null);
  useEffect(() => {
    if (isOpen) openerRef.current = document.activeElement;
    else openerRef.current = null;
  }, [isOpen]);
  useModalA11y({ isOpen, onClose, modalRef: dialogRef, returnFocusRef: openerRef });
  return { openerRef };
}