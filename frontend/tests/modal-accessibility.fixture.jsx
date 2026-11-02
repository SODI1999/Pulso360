import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { useModalA11y } from '../src/core/hooks/useModalA11y';
import { RouteAccessibility } from '../src/core/components/RouteAccessibility';
import { handleTabNavigation } from '../src/core/components/tabNavigation';
import '../src/styles/tokens.css';
import '../src/styles/layout.css';
import '../src/styles/landing/base.css';

export function ChildDialog({ onClose }) {
  const ref = useRef(null);
  useModalA11y({ isOpen: true, onClose, modalRef: ref });
  return <section ref={ref} role="dialog" aria-modal="true" aria-label="Diálogo hijo">
    <button id="child-close" onClick={onClose}>Cerrar hijo</button>
  </section>;
}

export function ModalFixture() {
  const [open, setOpen] = useState(false);
  const [back, setBack] = useState(false);
  const [child, setChild] = useState(false);
  const [backgroundKeys, setBackgroundKeys] = useState(0);
  const [modalKeys, setModalKeys] = useState(0);
  const [closed, setClosed] = useState(0);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const close = () => {
    if (back) setBack(false);
    else { setOpen(false); setClosed(value => value + 1); }
  };
  useModalA11y({ isOpen: open, onClose: close, modalRef: back ? backRef : frontRef });
  useEffect(() => {
    const listener = event => { if (event.key === '1') setBackgroundKeys(value => value + 1); };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  return <>
    <main>
      <button id="opener" onClick={() => setOpen(true)}>Abrir muestra técnica</button>
      <output id="background-keys">{backgroundKeys}</output>
      <output id="modal-keys">{modalKeys}</output>
      <output id="closed-count">{closed}</output>
    </main>
    <section id="original-inert" inert="preserved"><button>Inactivo de origen</button></section>
    {open && <aside role="dialog" aria-modal="true" aria-label="Diálogo principal">
      <section ref={frontRef} hidden={back} onKeyDown={event => {
        if (event.key === '1') setModalKeys(value => value + 1);
      }}>
        <button id="front-first" onClick={close}>Cerrar muestra</button>
        <button id="hidden-control" style={{ display: 'none' }}>Oculto</button>
        <button id="disabled-control" disabled>No disponible</button>
        <input id="editor" aria-label="Texto de muestra" />
        <button id="swap" onClick={() => setBack(true)}>Confirmación alternativa</button>
        <button id="child-opener" onClick={() => setChild(true)}>Abrir hijo</button>
        <button id="front-last">Último control</button>
      </section>
      <section ref={backRef} hidden={!back}>
        <button id="back-first" onClick={() => setBack(false)}>Volver a muestra</button>
      </section>
      {child && <ChildDialog onClose={() => setChild(false)} />}
    </aside>}
  </>;
}

const check = (condition, message) => { if (!condition) throw new Error(message); };
const settle = () => new Promise(resolve => setTimeout(resolve, 40));
const key = value => {
  const event = new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true });
  document.activeElement.dispatchEvent(event);
  return event;
};
const click = id => { const element = document.getElementById(id); element.focus(); element.click(); };

async function runChecks() {
  const passed = [];
  await settle();
  click('opener');
  await settle();
  check(document.activeElement.id === 'front-first', 'El diálogo debe recibir foco inicial');
  document.getElementById('opener').focus();
  check(document.activeElement.id === 'front-first', 'inert debe bloquear el foco en el fondo');
  passed.push('foco inicial y aislamiento nativo del fondo');

  const previous = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
  document.activeElement.dispatchEvent(previous);
  check(previous.defaultPrevented && document.activeElement.id === 'front-last', 'Shift+Tab debe saltar ocultos/deshabilitados');
  const next = key('Tab');
  check(next.defaultPrevented && document.activeElement.id === 'front-first', 'Tab debe envolver dentro del diálogo');
  passed.push('límites de Tab con controles ocultos y deshabilitados');

  const late = document.createElement('button');
  late.id = 'late-background';
  late.textContent = 'Contenido de fondo tardío';
  document.body.append(late);
  await settle();
  check(late.inert, 'Un hermano de fondo añadido durante el diálogo también debe quedar inert');
  passed.push('aislamiento de hermanos añadidos durante la apertura');

  document.getElementById('editor').focus();
  key('1');
  await settle();
  check(document.getElementById('modal-keys').textContent === '1', 'El handler React del diálogo debe conservar su tecla');
  check(document.getElementById('background-keys').textContent === '0', 'La tecla del diálogo no debe ejecutar atajos del fondo');
  check(document.activeElement.id === 'editor', 'Una actualización de estado no debe robar el foco del editor');
  passed.push('teclado propio, atajos de fondo aislados y foco estable');

  click('child-opener');
  await settle();
  check(document.activeElement.id === 'child-close', 'El diálogo superior debe recibir foco');
  document.getElementById('front-first').focus();
  check(document.activeElement.id === 'child-close', 'El diálogo inferior debe quedar aislado');
  key('Escape');
  await settle();
  check(document.querySelectorAll('[role="dialog"]').length === 1, 'Escape debe cerrar solo el diálogo superior');
  check(document.activeElement.id === 'child-opener', 'El hijo debe devolver el foco al diálogo inferior');
  check(document.getElementById('closed-count').textContent === '0', 'Escape no debe cerrar también el padre');
  passed.push('apilamiento, Escape único y restauración al diálogo inferior');

  click('swap');
  await settle();
  check(document.activeElement.id === 'back-first', 'La superficie alternativa debe recibir foco');
  key('Escape');
  await settle();
  check(document.querySelectorAll('[role="dialog"]').length === 1 && document.activeElement.id === 'front-first', 'Cancelar debe volver a la superficie original');
  key('Escape');
  await settle();
  check(document.activeElement.id === 'opener', 'El disparador original debe sobrevivir al cambio de superficie');
  check(document.getElementById('original-inert').getAttribute('inert') === 'preserved', 'Debe conservar inert de origen');
  check(!late.hasAttribute('inert'), 'Debe restaurar un hermano inicialmente activo');
  check(document.body.style.overflow === '', 'Debe liberar el bloqueo de scroll al cerrar el último diálogo');
  passed.push('cambio de superficie, retorno original y restauración de inert/scroll');

  key('1');
  await settle();
  check(document.getElementById('background-keys').textContent === '1', 'Los atajos de fondo deben recuperarse al cerrar');
  passed.push('limpieza de los listeners modales');
  return passed;
}

export function LoadingRoute({ label }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 180);
    return () => clearTimeout(timer);
  }, []);
  return <main id={`loading-${label}`}>
    {loaded ? <h1 id={`heading-${label}`}>Ruta de muestra {label}</h1> : <p role="status">Cargando muestra</p>}
    <button id="manual-target">Acción de muestra</button>
  </main>;
}

export function RouteFixture() {
  const navigate = useNavigate();
  return <>
    <RouteAccessibility />
    <nav aria-label="Rutas de prueba">
      <button id="navigate-auto" onClick={() => navigate('/test-auto')}>Abrir carga automática</button>
      <button id="navigate-manual" onClick={() => navigate('/test-manual')}>Abrir carga con interacción</button>
      <button id="navigate-keyboard" onClick={() => navigate('/test-keyboard')}>Abrir con teclado</button>
      <button id="navigate-first" onClick={() => navigate('/test-first')}>Volver a primera ruta</button>
    </nav>
    <Routes>
      <Route path="/test-first" element={<main id="contenido"><h1 id="first-heading">Primera ruta de muestra</h1></main>} />
      <Route path="/test-auto" element={<LoadingRoute key="auto" label="auto" />} />
      <Route path="/test-manual" element={<LoadingRoute key="manual" label="manual" />} />
      <Route path="/test-keyboard" element={<main><h1 id="keyboard-heading">Ruta activada con teclado</h1></main>} />
    </Routes>
  </>;
}

async function runRouteChecks(root) {
  const passed = [];
  const before = document.createElement('div');
  const after = document.createElement('div');
  before.style.height = '600px';
  after.style.height = '1600px';
  document.body.prepend(before);
  document.body.append(after);
  window.scrollTo({ top: 200, behavior: 'instant' });
  const nativeScroll = window.scrollY;
  root.render(<StrictMode><MemoryRouter initialEntries={['/test-first']}><RouteFixture /></MemoryRouter></StrictMode>);
  await settle();
  check(Math.abs(window.scrollY - nativeScroll) < 1, 'El primer montaje, incluso en StrictMode, debe conservar el scroll nativo');
  check(document.activeElement.id === 'first-heading', 'La ruta debe enfocar su encabezado principal');
  check(document.title === 'Primera ruta de muestra · Pulso360', 'El título debe describir la ruta');
  const initialHeading = document.activeElement;
  check(getComputedStyle(initialHeading).outlineStyle === 'none', 'La entrada inicial no debe dibujar un marco en el encabezado');
  document.getElementById('navigate-auto').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  click('navigate-auto');
  check(!initialHeading.hasAttribute('data-route-focus'), 'Al salir debe limpiar el marcador de foco programático');
  await settle();
  check(document.activeElement.id === 'loading-auto', 'Durante la carga debe enfocar el contenido disponible');
  check(Math.abs(window.scrollY - nativeScroll) > 1 && document.activeElement.getBoundingClientRect().top >= 0,
    'Una navegación SPA debe seguir revelando el contenido de destino');
  await new Promise(resolve => setTimeout(resolve, 220));
  check(document.activeElement.id === 'heading-auto', 'Al llegar el encabezado puede completar el foco pendiente');
  check(getComputedStyle(document.activeElement).outlineStyle === 'none', 'La navegación con puntero no debe dibujar un marco en el encabezado');
  document.querySelector('.app-skip-link').click();
  check(document.activeElement.id === 'loading-auto', 'El enlace de salto debe enfocar el contenido');
  passed.push('título, foco de ruta, encabezado asíncrono y enlace de salto');

  click('navigate-manual');
  await settle();
  document.getElementById('manual-target').focus();
  key('x');
  await new Promise(resolve => setTimeout(resolve, 220));
  check(document.activeElement.id === 'manual-target', 'La carga no debe robar el foco después de una interacción');
  check(document.title === 'Ruta de muestra manual · Pulso360', 'El título debe completarse aunque el foco se conserve');
  passed.push('encabezado tardío sin robar foco tras interacción');

  document.getElementById('navigate-keyboard').focus();
  key('Enter');
  document.getElementById('navigate-keyboard').click();
  await settle();
  check(document.activeElement.id === 'keyboard-heading', 'La navegación SPA con teclado debe conservar el foco anunciado');
  check(getComputedStyle(document.activeElement).outlineStyle === 'solid', 'El destino de navegación con teclado debe conservar indicador visible');
  document.getElementById('navigate-first').focus();
  key('Enter');
  document.getElementById('navigate-first').click();
  await settle();
  const skip = document.querySelector('.app-skip-link');
  skip.focus();
  check(getComputedStyle(skip).outlineStyle === 'solid', 'El enlace de salto debe conservar foco visible');
  key('Enter');
  skip.click();
  check(document.activeElement.id === 'contenido', 'El salto debe seguir enfocando el contenido');
  check(getComputedStyle(document.activeElement).outlineStyle === 'solid', 'La regla heredada de landing no debe ocultar el salto explícito de teclado');
  document.getElementById('navigate-auto').focus();
  check(getComputedStyle(document.activeElement).outlineStyle === 'solid', 'Los controles con teclado deben conservar su indicador global');
  passed.push('entrada y puntero discretos, teclado/controles/salto visibles y marcador limpiado');
  passed.push('montaje StrictMode conserva scroll nativo; navegación SPA revela el destino');
  before.remove();
  after.remove();
  return passed;
}

export function TabsFixture() {
  const [active, setActive] = useState('first');
  return <>
    <div role="tablist" aria-label="Pestañas técnicas">
      {['first', 'disabled', 'second', 'third'].map(value => <button key={value}
        id={`fixture-tab-${value}`} role="tab" type="button" disabled={value === 'disabled'}
        data-tab-value={value} aria-selected={active === value}
        aria-controls="fixture-tab-panel" tabIndex={active === value ? 0 : -1}
        onClick={() => setActive(value)} onKeyDown={event => handleTabNavigation(event, setActive)}>
        {value}
      </button>)}
    </div>
    <section role="tabpanel" id="fixture-tab-panel" aria-labelledby={`fixture-tab-${active}`}>
      Panel {active}
    </section>
  </>;
}

async function runTabChecks(root) {
  root.render(<TabsFixture />);
  await settle();
  document.getElementById('fixture-tab-first').focus();
  for (const [pressed, expected] of [
    ['ArrowLeft', 'third'], ['ArrowRight', 'first'], ['ArrowRight', 'second'],
    ['Home', 'first'], ['End', 'third']
  ]) {
    const event = key(pressed);
    await settle();
    check(event.defaultPrevented && document.activeElement.id === `fixture-tab-${expected}`, `${pressed} debe activar/enfocar ${expected}`);
    check(document.querySelectorAll('[role="tab"][tabindex="0"]').length === 1, 'Solo la pestaña activa debe estar en el orden de Tab');
    check(document.querySelector('[role="tab"][aria-selected="true"]').id === document.activeElement.id, 'La selección anunciada debe corresponder al foco');
    check(document.getElementById('fixture-tab-panel').getAttribute('aria-labelledby') === document.activeElement.id, 'El panel debe quedar asociado a la pestaña activa');
  }
  const shortcut = new KeyboardEvent('keydown', { key: 'ArrowLeft', ctrlKey: true, bubbles: true, cancelable: true });
  document.activeElement.dispatchEvent(shortcut);
  check(!shortcut.defaultPrevented, 'El helper no debe bloquear atajos de navegador');
  return ['pestañas: flechas con wrap/disabled, Home/End, foco itinerante y panel asociado'];
}

export function PendingDialogFixture() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const surfaceRef = useRef(null);
  useModalA11y({ isOpen: open, onClose: () => { if (!pending) setOpen(false); }, modalRef: surfaceRef });
  useEffect(() => {
    if (!pending) return undefined;
    const timer = setTimeout(() => setPending(false), 220);
    return () => clearTimeout(timer);
  }, [pending]);
  return <>
    <button id="pending-opener" onClick={() => setOpen(true)}>Abrir muestra pendiente</button>
    {open && <section ref={surfaceRef} id="pending-surface" role="dialog" aria-modal="true"
      aria-label="Muestra de guardado" aria-busy={pending}>
      <fieldset disabled={pending}>
        <button id="pending-submit" onClick={() => setPending(true)}>Guardar muestra</button>
        <input aria-label="Nota de muestra" />
        <button id="pending-cancel" onClick={() => setOpen(false)}>Cancelar muestra</button>
      </fieldset>
      <p role="status">{pending ? 'Esperando confirmación de muestra' : ''}</p>
    </section>}
  </>;
}

async function runPendingCheck(root) {
  root.render(<PendingDialogFixture />);
  await settle();
  click('pending-opener');
  await settle();
  click('pending-submit');
  await settle();
  check(document.activeElement.id === 'pending-surface', 'Al deshabilitar todos los controles el foco debe quedar en la superficie');
  check(document.activeElement.getAttribute('aria-busy') === 'true', 'La superficie debe conservar el estado pendiente');
  key('Escape');
  await settle();
  check(Boolean(document.getElementById('pending-surface')), 'Escape debe conservar la decisión pendiente del consumidor');
  await new Promise(resolve => setTimeout(resolve, 220));
  check(document.activeElement.id === 'pending-surface', 'Al recuperar controles no debe robar el foco de la superficie');
  key('Escape');
  await settle();
  check(document.activeElement.id === 'pending-opener', 'Al finalizar debe recuperar el disparador original');
  return ['guardado pendiente sin controles: foco en superficie, Escape y recuperación'];
}

const fixtureRoot = createRoot(document.getElementById('root'));
fixtureRoot.render(<ModalFixture />);
(async () => [...await runChecks(), ...await runRouteChecks(fixtureRoot), ...await runTabChecks(fixtureRoot), ...await runPendingCheck(fixtureRoot)])().then(checks => {
  document.body.dataset.modalTestResult = encodeURIComponent(JSON.stringify({ passed: true, checks }));
}).catch(error => {
  document.body.dataset.modalTestResult = encodeURIComponent(JSON.stringify({ passed: false, error: error.message }));
});
