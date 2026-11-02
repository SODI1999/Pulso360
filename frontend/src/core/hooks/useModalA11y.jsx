import { useEffect, useLayoutEffect, useRef } from 'react';
import { useBodyScrollLock } from './useBodyScrollLock';

const modalStack = [];
const inertSiblings = new Map();
let backgroundObserver;
const focusableSelector = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [tabindex]';
const useSurfaceEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

function isAvailable(element) {
  return Boolean(element?.isConnected && !element.matches(':disabled') &&
    !element.closest('[hidden], [inert]') && element.getClientRects().length &&
    !['hidden', 'collapse'].includes(getComputedStyle(element).visibility));
}

function getFocusableElements(surface) {
  return [...surface.querySelectorAll(focusableSelector)].filter(element =>
    element.tabIndex >= 0 && isAvailable(element));
}

function restoreBackground() {
  inertSiblings.forEach((original, element) => {
    if (original === null) element.removeAttribute('inert');
    else element.setAttribute('inert', original);
  });
  inertSiblings.clear();
}

function isolateTopModal() {
  backgroundObserver?.disconnect();
  restoreBackground();
  let branch = modalStack.at(-1)?.surface;
  if (!branch?.isConnected) return;
  backgroundObserver ||= new MutationObserver(isolateTopModal);

  // Aislar hermanos en cada nivel conserva activo el camino entre el diálogo y body.
  while (branch.parentElement) {
    const parent = branch.parentElement;
    [...parent.children].forEach(sibling => {
      if (sibling === branch || ['SCRIPT', 'STYLE', 'LINK'].includes(sibling.tagName)) return;
      inertSiblings.set(sibling, sibling.getAttribute('inert'));
      sibling.setAttribute('inert', '');
    });
    backgroundObserver.observe(parent, { childList: true });
    if (parent === document.body) break;
    branch = parent;
  }
}

function focusSurface(entry) {
  if (!entry.surface?.isConnected) return;
  const preferred = entry.initialFocusRef?.current;
  const firstControl = isAvailable(preferred) && entry.surface.contains(preferred)
    ? preferred : getFocusableElements(entry.surface)[0];
  if (firstControl) firstControl.focus();
  else {
    if (!entry.surface.hasAttribute('tabindex')) {
      entry.fallbackSurfaces.add(entry.surface);
      entry.surface.setAttribute('tabindex', '-1');
    }
    entry.surface.focus();
  }
}

function handleModalKeyDown(event) {
  const entry = modalStack.at(-1);
  if (!entry?.surface?.isConnected) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopImmediatePropagation();
    entry.closeRef.current?.();
  } else if (event.key === 'Tab') {
    event.stopImmediatePropagation();
    const controls = getFocusableElements(entry.surface);
    const first = controls[0];
    const last = controls.at(-1);
    const active = document.activeElement;
    if (!controls.length) {
      event.preventDefault();
      focusSurface(entry);
    } else if (!entry.surface.contains(active) ||
      (event.shiftKey ? active === first : active === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  }
}

function stopBackgroundShortcuts(event) {
  // Los handlers React del diálogo ya se ejecutaron; sus teclas no pertenecen a la página de fondo.
  if (modalStack.length) event.stopImmediatePropagation();
}

/**
 * Contiene el teclado y aísla el fondo del diálogo activo, incluso si otro se apila.
 * Cambiar modalRef sustituye la superficie sin perder el disparador original.
 * @param {object} options Estado del diálogo y referencias a sus controles.
 * @param {boolean} options.isOpen Indica si el diálogo está montado y abierto.
 * @param {Function} options.onClose Resuelve Escape; puede conservar abierto un guardado pendiente.
 * @param {object} options.modalRef Referencia a la superficie activa del diálogo.
 * @param {object} [options.returnFocusRef] Disparador estable si la acción que abre se desmonta.
 * @param {object} [options.initialFocusRef] Acción segura que debe recibir el foco inicial.
 * @returns {void} Restaura inert y foco al cerrar; no gestiona persistencia ni estado de dominio.
 */
export function useModalA11y({ isOpen, onClose, modalRef, returnFocusRef, initialFocusRef }) {
  useBodyScrollLock(isOpen);
  const closeRef = useRef(onClose);
  const entryRef = useRef(null);
  const surfaceRef = useRef(modalRef);
  const returnRef = useRef(returnFocusRef);
  const initialRef = useRef(initialFocusRef);
  useSurfaceEffect(() => { closeRef.current = onClose; }, [onClose]);
  useSurfaceEffect(() => {
    surfaceRef.current = modalRef;
    returnRef.current = returnFocusRef;
    initialRef.current = initialFocusRef;
  });

  useEffect(() => {
    if (!isOpen || !surfaceRef.current.current) return undefined;
    const entry = {
      surface: surfaceRef.current.current,
      closeRef,
      initialFocusRef: initialRef.current,
      restoreTarget: returnRef.current?.current || document.activeElement,
      fallbackSurfaces: new Set()
    };
    entryRef.current = entry;
    if (!modalStack.length) {
      document.addEventListener('keydown', handleModalKeyDown, true);
      document.addEventListener('keydown', stopBackgroundShortcuts);
    }
    modalStack.push(entry);
    isolateTopModal();
    focusSurface(entry);

    return () => {
      const wasTop = modalStack.at(-1) === entry;
      const index = modalStack.indexOf(entry);
      if (index !== -1) modalStack.splice(index, 1);
      entryRef.current = null;
      isolateTopModal();
      entry.fallbackSurfaces.forEach(surface => {
        if (surface.getAttribute('tabindex') === '-1') surface.removeAttribute('tabindex');
      });
      if (!modalStack.length) {
        document.removeEventListener('keydown', handleModalKeyDown, true);
        document.removeEventListener('keydown', stopBackgroundShortcuts);
      }
      if (wasTop) {
        const remaining = modalStack.at(-1);
        const target = returnRef.current?.current || entry.restoreTarget;
        if (isAvailable(target) && (!remaining || remaining.surface.contains(target))) target.focus();
        else if (remaining) focusSurface(remaining);
      }
    };
  }, [isOpen]);

  useSurfaceEffect(() => {
    const entry = entryRef.current;
    const surface = modalRef.current;
    if (!isOpen || !entry || !surface || entry.surface === surface) return;
    entry.surface = surface;
    isolateTopModal();
    if (modalStack.at(-1) === entry) focusSurface(entry);
  }, [isOpen, modalRef]);

  useSurfaceEffect(() => {
    const entry = entryRef.current;
    if (!entry || modalStack.at(-1) !== entry || !entry.surface?.isConnected) return;
    const active = document.activeElement;
    if (!getFocusableElements(entry.surface).length &&
      (!entry.surface.contains(active) || !isAvailable(active))) focusSurface(entry);
  });
}
