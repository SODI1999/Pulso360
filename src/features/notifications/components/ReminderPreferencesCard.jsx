// src/features/notifications/components/ReminderPreferencesCard.jsx
// Ajuste editorial continuo de recordatorio de inicio de turno (RF-17 / pulso360-ui-craft Caso 1)

export function ReminderPreferencesCard({
  reminderActive = false,
  onToggleReminder = () => {}
}) {
  const handleSwitchClick = () => {
    onToggleReminder(!reminderActive);
  };

  return (
    <section className="notif-pref-editorial-row" aria-label="Ajustes de avisos de turno">
      <div className="notif-pref-editorial-info">
        <h2 className="notif-pref-editorial-title">Recordatorio diario de inicio de turno</h2>
        <p className="notif-pref-editorial-desc">
          Presenta un aviso al iniciar tu jornada operativa para diligenciar el check-in de bienestar diario. Al pausar, no se emitirán avisos al comenzar.
        </p>
      </div>

      <div className="notif-pref-editorial-action">
        <button
          type="button"
          role="switch"
          aria-checked={reminderActive}
          aria-label="Recordatorio diario de check-in"
          className={`editorial-switch ${reminderActive ? 'is-active' : ''}`}
          onClick={handleSwitchClick}
        >
          <span className="editorial-switch-track" aria-hidden="true">
            <span className="editorial-switch-thumb" />
          </span>
          <span className="editorial-switch-text">
            {reminderActive ? 'Activo' : 'Pausado'}
          </span>
        </button>
      </div>
    </section>
  );
}
