import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const routeTitles = {
  '/': 'Inicio', '/login': 'Iniciar sesión', '/recuperar-clave': 'Recuperar acceso',
  '/nueva-clave': 'Crear nueva contraseña', '/403': 'Acceso no autorizado',
  '/contactenos': 'Contacto', '/fundamentacion': 'Fundamentación',
  '/consentimiento': 'Consentimiento y preferencias',
  '/agente/panel': 'Mi panel', '/agente/checkin': 'Check-in diario',
  '/agente/bitacora': 'Bitácora', '/agente/mi-bienestar': 'Mi bienestar',
  '/agente/apoyo': 'Acompañamiento con SST', '/agente/mis-datos': 'Mis datos y privacidad',
  '/supervisor/panel': 'Panel de supervisión', '/supervisor/acciones': 'Acciones del equipo',
  '/sst/panel': 'Panorama preventivo', '/sst/alertas': 'Bandeja de alertas',
  '/sst/reglas-alertas': 'Reglas de alertas', '/sst/intervenciones': 'Intervenciones',
  '/sst/buzon': 'Buzón de acompañamiento', '/auditor/auditoria': 'Auditoría',
  '/admin/organizacion': 'Organización', '/admin/usuarios-roles': 'Usuarios y roles',
  '/admin/parametros': 'Parámetros del sistema', '/admin/importar': 'Importar CSV',
  '/admin/solicitudes': 'Solicitudes de titulares', '/reportes': 'Reportes',
  '/notificaciones': 'Avisos', '/apoyo-crisis': 'Apoyo inmediato'
};

function focusContent(element, showIndicator = true, reveal = true) {
  if (!element?.isConnected) return;
  if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1');
  element.dataset.routeFocus = showIndicator ? 'keyboard' : 'quiet';
  element.addEventListener('blur', () => element.removeAttribute('data-route-focus'), { once: true });
  element.focus({ preventScroll: true });
  if (reveal) element.scrollIntoView({ block: 'start', behavior: 'instant' });
}

function isRendered(element) {
  return Boolean(element.getClientRects().length &&
    !['hidden', 'collapse'].includes(getComputedStyle(element).visibility));
}

function getVisibleMain() {
  return [...document.querySelectorAll('main')].find(isRendered);
}

/**
 * Anuncia cada cambio de ruta mediante título y foco, y permite saltar la navegación.
 * Espera de forma acotada un encabezado asíncrono; una interacción cancela ese foco pendiente.
 * El foco de entrada o puntero es discreto; la navegación por teclado conserva su indicador.
 * El montaje conserva el scroll nativo; una navegación SPA o salto explícito revela su destino.
 * @returns {JSX.Element|null} Enlace de salto global; la portada conserva su enlace existente.
 */
export function RouteAccessibility() {
  const { pathname } = useLocation();
  const [contentId, setContentId] = useState('app-main-content');
  const modalityRef = useRef('initial');
  const initialPathRef = useRef(pathname);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = event => {
      if (!['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) modalityRef.current = 'keyboard';
    };
    const handlePointerDown = () => { modalityRef.current = 'pointer'; };
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, []);

  useEffect(() => {
    if (pathname !== initialPathRef.current) hasNavigatedRef.current = true;
    const revealContent = hasNavigatedRef.current;
    const showIndicator = modalityRef.current === 'keyboard';
    let initialTarget = null;
    let pendingFocus = true;
    let observer;
    let timer;
    const cancelPendingFocus = () => { pendingFocus = false; };
    const stopWaiting = () => {
      observer?.disconnect();
      clearTimeout(timer);
      document.removeEventListener('keydown', cancelPendingFocus, true);
      document.removeEventListener('pointerdown', cancelPendingFocus, true);
    };
    const updateContent = (initial = false) => {
      const main = getVisibleMain();
      const heading = [...(main || document).querySelectorAll('h1')].find(isRendered) ||
        (main ? [...main.querySelectorAll('h2')].find(isRendered) : null);
      const content = main || heading;
      const title = heading?.textContent.trim() || routeTitles[pathname] || 'Pulso360';
      document.title = title === 'Pulso360' ? title : `${title} · Pulso360`;
      if (content) {
        if (!content.id) content.id = 'route-main-content';
        setContentId(content.id);
      }
      const hasModal = Boolean(document.querySelector('[role="dialog"][aria-modal="true"]'));
      if (initial) {
        initialTarget = heading || content;
        if (!hasModal) focusContent(initialTarget, showIndicator, revealContent);
      } else if (heading && pendingFocus && !hasModal &&
        (document.activeElement === initialTarget || document.activeElement === document.body)) {
        focusContent(heading, showIndicator, revealContent);
      }
      return Boolean(heading);
    };

    if (updateContent(true)) return undefined;
    const main = getVisibleMain();
    const container = main?.dataset.pageBoundary === 'loading'
      ? main.parentElement : main || document.getElementById('root');
    if (!container) return undefined;
    observer = new MutationObserver(() => {
      if (updateContent()) stopWaiting();
    });
    observer.observe(container, { childList: true, subtree: true });
    timer = setTimeout(stopWaiting, 5000);
    document.addEventListener('keydown', cancelPendingFocus, true);
    document.addEventListener('pointerdown', cancelPendingFocus, true);
    return stopWaiting;
  }, [pathname]);

  if (pathname === '/') return null;
  return (
    <a className="app-skip-link" href={`#${contentId}`} onClick={event => {
      const content = document.getElementById(contentId);
      if (!content) return;
      event.preventDefault();
      focusContent(content);
    }}>
      Saltar al contenido principal
    </a>
  );
}
