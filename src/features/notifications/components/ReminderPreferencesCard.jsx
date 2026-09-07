// src/features/notifications/components/ReminderPreferencesCard.jsx
// Panel modular de configuración de recordatorio diario de check-in para agentes (RF-17)

export function ReminderPreferencesCard({
  reminderActive = false,
  onToggleReminder = () => {}
}) {
  return (
    <div className="notif-preferences-card">
      <div className="notif-toggle-row">
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--c-texto)' }}>
            Recordatorio diario de Check-in
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--c-texto-suave)' }}>
            Recibir un aviso en la plataforma al inicio de tu jornada para diligenciar la encuesta de bienestar.
          </p>
        </div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13.5px' }}>
          <input
            type="checkbox"
            checked={reminderActive}
            onChange={onToggleReminder}
          />
          <span>{reminderActive ? 'Recordatorio activo' : 'Recordatorio desactivado'}</span>
        </label>
      </div>
    </div>
  );
}
