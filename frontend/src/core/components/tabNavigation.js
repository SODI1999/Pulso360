/**
 * Activa y enfoca una pestaña horizontal con flechas, Home o End.
 * @param {KeyboardEvent|import('react').KeyboardEvent} event Tecla recibida por un botón role=tab.
 * @param {Function} onActivate Recibe el data-tab-value de la pestaña de destino.
 * @returns {void} No altera otras teclas ni los atajos del navegador.
 */
export function handleTabNavigation(event, onActivate) {
  if (event.altKey || event.ctrlKey || event.metaKey ||
    !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const tablist = event.currentTarget.closest('[role="tablist"]');
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll('[role="tab"]')].filter(tab =>
    tab.closest('[role="tablist"]') === tablist && !tab.matches(':disabled') &&
    tab.getAttribute('aria-disabled') !== 'true' && tab.getClientRects().length);
  const index = tabs.indexOf(event.currentTarget);
  if (index === -1) return;
  let next = index;
  if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
  else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
  else if (event.key === 'Home') next = 0;
  else next = tabs.length - 1;
  event.preventDefault();
  onActivate(tabs[next].dataset.tabValue);
  tabs[next].focus();
}
