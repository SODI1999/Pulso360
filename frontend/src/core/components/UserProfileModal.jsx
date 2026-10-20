// src/core/components/UserProfileModal.jsx
// Modal de Perfil de Usuario, Gestión de Avatar Diverso y Preferencias de Bienestar Ergonómico

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import { authService, roleLabels } from '../auth/authService';
import { getRandomAvatarForRole } from '../auth/avatarPool';
import { preferences } from '../storage/preferences';
import '../../styles/profile.css';

// Catálogo institucional representativo de BPO (sin etiquetas de rol para libre elección del colaborador)
const INSTITUTIONAL_AVATARS = [
  {
    id: 'laura',
    name: 'Laura Gómez',
    src: '/assets/fotos/bpo-agent-profile.jpg'
  },
  {
    id: 'mateo',
    name: 'Mateo Ramos',
    src: '/assets/fotos/bpo-avatar-male-agent.webp'
  },
  {
    id: 'carlos',
    name: 'Carlos Mendoza',
    src: '/assets/fotos/bpo-avatar-male-supervisor.webp'
  },
  {
    id: 'sofia',
    name: 'Sofía Vega',
    src: '/assets/fotos/bpo-avatar-female-agent-2.webp'
  },
  {
    id: 'patricia',
    name: 'Patricia Silva',
    src: '/assets/fotos/bpo-sst-guardian.jpg'
  }
];

// Función para recortar y optimizar imágenes cargadas localmente a 256x256 cuadrado
function resizeImageToAvatar(file, maxDimension = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = maxDimension;
      canvas.height = maxDimension;
      const ctx = canvas.getContext('2d');
      const minSide = Math.min(img.width, img.height);
      const sx = (img.width - minSide) / 2;
      const sy = (img.height - minSide) / 2;
      ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxDimension, maxDimension);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo procesar la imagen seleccionada.'));
    };
    img.src = objectUrl;
  });
}

function getDefaultAvatarForUser(user) {
  if (user?.avatar) return user.avatar;
  return getRandomAvatarForRole(user?.role);
}

export function UserProfileModal({ isOpen, onClose, user, onProfileUpdated }) {
  const [activeTab, setActiveTab] = useState('identity'); // 'identity' | 'preferences' | 'privacy'
  const [selectedAvatar, setSelectedAvatar] = useState(() => getDefaultAvatarForUser(user));
  const [pauseSound, setPauseSound] = useState(() => preferences.readPauseSound(true));
  const [reminderCheckin, setReminderCheckin] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => preferences.readReducedMotion(false));
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: string }
  const [isSaving, setIsSaving] = useState(false);

  const modalRef = useRef(null);
  const fileInputRef = useRef(null);
  const previousActiveElement = useRef(null);
  const wasOpenRef = useRef(false);

  // Sincronizar estado únicamente al abrir el modal (evita sobreescritura accidental ante re-renders de actividad)
  useEffect(() => {
    if (isOpen && !wasOpenRef.current && user) {
      wasOpenRef.current = true;
      setActiveTab('identity');
      previousActiveElement.current = document.activeElement;
      setSelectedAvatar(user.avatar || getDefaultAvatarForUser(user));
      setPauseSound(preferences.readPauseSound(true));
      const reminderKey = `pulso360_reminder_${user.id}`;
      setReminderCheckin(preferences.readReminder(reminderKey));
      setReducedMotion(preferences.readReducedMotion(false));
      setFeedback(null);

      // Foco inicial accesible
      setTimeout(() => {
        const closeBtn = modalRef.current?.querySelector('.user-profile-close-btn');
        closeBtn?.focus();
      }, 50);
    } else if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen, user]);

  // Manejo de teclado WAI-ARIA: Trampa de foco y cierre con Escape
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  // Manejador de carga y optimización de imagen local
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tipo de archivo
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', text: 'El archivo seleccionado no es una imagen válida.' });
      return;
    }

    // Validación de tamaño máximo de entrada (5 MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFeedback({
        type: 'error',
        text: 'La imagen seleccionada supera el límite de 5 MB. Elige una imagen más liviana.'
      });
      return;
    }

    try {
      const optimizedDataUrl = await resizeImageToAvatar(file, 256);
      setSelectedAvatar(optimizedDataUrl);
      setFeedback({
        type: 'success',
        text: 'Foto personalizada cargada y optimizada. Haz clic en "Guardar cambios" para aplicarla.'
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Error al procesar la imagen seleccionada.' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Restablecer al avatar predeterminado de su rol
  const handleResetAvatar = () => {
    const defaultAvatar = getRandomAvatarForRole(user?.role);
    setSelectedAvatar(defaultAvatar);
    setFeedback({
      type: 'success',
      text: 'Avatar restablecido al valor institucional predeterminado.'
    });
  };

  // Guardar cambios en sesión, authService y preferences
  const handleSave = () => {
    setIsSaving(true);
    try {
      // 1. Guardar avatar en authService (actualiza sessionData, localData y pulsoStore)
      const updatedUser = authService.updateProfile({
        avatar: selectedAvatar,
        avatarType: selectedAvatar.startsWith('data:') ? 'custom' : 'preset'
      });

      // 2. Guardar preferencias de bienestar
      preferences.savePauseSound(pauseSound);
      const reminderKey = `pulso360_reminder_${user.id}`;
      preferences.saveReminder(reminderKey, reminderCheckin);
      preferences.saveReducedMotion(reducedMotion);

      setFeedback({ type: 'success', text: 'Perfil y preferencias guardados exitosamente.' });
      onProfileUpdated?.(updatedUser);

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 600);
    } catch {
      setIsSaving(false);
      setFeedback({ type: 'error', text: 'No se pudieron guardar las preferencias locales.' });
    }
  };

  const roleLabel = roleLabels[user.role] || user.role;
  const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div
      className="user-profile-modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="user-profile-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-profile-title"
        ref={modalRef}
      >
        {/* Cabecera */}
        <div className="user-profile-modal-header">
          <div className="user-profile-header-title-box">
            <div className="user-profile-header-icon" aria-hidden="true">
              <Icon name="User" size={18} />
            </div>
            <div>
              <h2 id="user-profile-title" className="user-profile-modal-title">
                Mi Perfil & Preferencias
              </h2>
              <p className="user-profile-modal-subtitle">
                Identidad institucional, avatar operativo y ergonomía de turno
              </p>
            </div>
          </div>
          <button
            type="button"
            className="user-profile-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal de perfil"
            title="Cerrar (Escape)"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Pestañas de Navegación WAI-ARIA */}
        <div className="user-profile-tabs" role="tablist" aria-label="Secciones de perfil y configuración">
          <button
            type="button"
            role="tab"
            id="tab-identity"
            aria-selected={activeTab === 'identity'}
            aria-controls="panel-identity"
            className={`user-profile-tab-btn ${activeTab === 'identity' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('identity')}
          >
            <Icon name="User" size={15} />
            <span>Identidad & Avatar</span>
          </button>
          <button
            type="button"
            role="tab"
            id="tab-preferences"
            aria-selected={activeTab === 'preferences'}
            aria-controls="panel-preferences"
            className={`user-profile-tab-btn ${activeTab === 'preferences' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <Icon name="Sliders" size={15} />
            <span>Preferencias de Bienestar</span>
          </button>
          <button
            type="button"
            role="tab"
            id="tab-privacy"
            aria-selected={activeTab === 'privacy'}
            aria-controls="panel-privacy"
            className={`user-profile-tab-btn ${activeTab === 'privacy' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <Icon name="ShieldCheck" size={15} />
            <span>Salvaguardas & Privacidad</span>
          </button>
        </div>

        {/* Cuerpo del Diálogo */}
        <div className="user-profile-modal-body">
          {/* Mensaje de Feedback */}
          {feedback && (
            <div
              className={`user-profile-feedback-box ${feedback.type}`}
              role="status"
              aria-live="polite"
            >
              <Icon
                name={feedback.type === 'success' ? 'CheckCircle2' : 'AlertTriangle'}
                size={16}
              />
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Panel 1: Identidad & Avatar */}
          {activeTab === 'identity' && (
            <div
              id="panel-identity"
              role="tabpanel"
              aria-labelledby="tab-identity"
              tabIndex={0}
              style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
            >
              {/* Tarjeta de Identidad Actual */}
              <div className="profile-hero-card">
                <div className="profile-avatar-display">
                  {selectedAvatar ? (
                    <img
                      key={selectedAvatar}
                      src={selectedAvatar}
                      alt={user.name}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    initialLetter
                  )}
                </div>
                <div className="profile-hero-info">
                  <div className="profile-hero-name">{user.name}</div>
                  <div className="profile-hero-role-badge">
                    <Icon name="ShieldCheck" size={12} />
                    <span>{roleLabel}</span>
                  </div>
                  <div className="profile-hero-meta">
                    <span>{user.email}</span>
                    {user.campaign && <span>• {user.campaign}</span>}
                    {user.shiftStartHour && (
                      <span>• Turno desde las {String(user.shiftStartHour).padStart(2, '0')}:00</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Selector de Catálogo Institucional BPO (Sin etiquetas de rol por UX) */}
              <div className="avatar-catalog-section">
                <div className="avatar-catalog-title">
                  <span>Catálogo de Avatares Institucionales BPO</span>
                  <span style={{ fontSize: '11px', color: 'var(--c-texto-suave)', fontWeight: 'normal' }}>
                    Diversidad de estilos disponibles
                  </span>
                </div>
                <div className="avatar-catalog-grid" role="radiogroup" aria-label="Catálogo de avatares">
                  {INSTITUTIONAL_AVATARS.map((item) => {
                    const isSelected = selectedAvatar === item.src;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`avatar-option-card ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => {
                          setSelectedAvatar(item.src);
                          setFeedback(null);
                        }}
                      >
                        <div className="avatar-option-thumb">
                          <img src={item.src} alt={`Avatar de ${item.name}`} />
                        </div>
                        <span className="avatar-option-label">{item.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Acciones de Personalización */}
                <div className="avatar-custom-actions">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    className="avatar-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon name="Upload" size={14} />
                    <span>Subir foto propia (PNG, JPG, WebP)</span>
                  </button>
                  <button
                    type="button"
                    className="avatar-reset-btn"
                    onClick={handleResetAvatar}
                  >
                    <Icon name="RefreshCw" size={13} />
                    <span>Restablecer predeterminado</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Panel 2: Preferencias de Bienestar */}
          {activeTab === 'preferences' && (
            <div
              id="panel-preferences"
              role="tabpanel"
              aria-labelledby="tab-preferences"
              tabIndex={0}
              className="preferences-list"
            >
              {/* Toggle 1: Sonido en pausas activas */}
              <div className="preference-item">
                <div className="preference-text-box">
                  <span className="preference-label">Audio ambiental en pausas activas</span>
                  <p className="preference-desc">
                    Reproduce tonos binaurales sutiles y campana suave durante los ejercicios de
                    respiración guiada para facilitar el descanso sensorial en turno.
                  </p>
                </div>
                <label className="preference-switch">
                  <input
                    type="checkbox"
                    checked={pauseSound}
                    onChange={(e) => setPauseSound(e.target.checked)}
                    aria-label="Activar audio ambiental en pausas activas"
                  />
                  <span className="preference-switch-slider" />
                </label>
              </div>

              {/* Toggle 2: Recordatorio de check-in */}
              <div className="preference-item">
                <div className="preference-text-box">
                  <span className="preference-label">Aviso discreto de registro al inicio de turno</span>
                  <p className="preference-desc">
                    Muestra un recordatorio cordial no invasivo para registrar tu estado de energía al
                    comenzar la jornada sin interrumpir la operación.
                  </p>
                </div>
                <label className="preference-switch">
                  <input
                    type="checkbox"
                    checked={reminderCheckin}
                    onChange={(e) => setReminderCheckin(e.target.checked)}
                    aria-label="Activar aviso discreto de inicio de turno"
                  />
                  <span className="preference-switch-slider" />
                </label>
              </div>

              {/* Toggle 3: Descanso visual ergonómico */}
              <div className="preference-item">
                <div className="preference-text-box">
                  <span className="preference-label">Descanso visual y reducción de movimiento</span>
                  <p className="preference-desc">
                    Minimiza transiciones y animaciones para reducir la fatiga ocular acumulada durante
                    jornadas continuas de atención en pantalla.
                  </p>
                </div>
                <label className="preference-switch">
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                    aria-label="Activar modo de descanso visual y reducción de movimiento"
                  />
                  <span className="preference-switch-slider" />
                </label>
              </div>
            </div>
          )}

          {/* Panel 3: Salvaguardas & Privacidad */}
          {activeTab === 'privacy' && (
            <div
              id="panel-privacy"
              role="tabpanel"
              aria-labelledby="tab-privacy"
              tabIndex={0}
              className="privacy-summary-card"
            >
              <div className="privacy-point">
                <Icon name="ShieldCheck" size={16} className="privacy-point-icon" />
                <div>
                  <strong>Separación estricta de evaluación:</strong> Tus registros de bienestar,
                  fatiga y bitácora personal jamás se cruzan con indicadores de productividad u objetivos
                  contractuales (AHT, adherencia, colas).
                </div>
              </div>

              <div className="privacy-point">
                <Icon name="Users" size={16} className="privacy-point-icon" />
                <div>
                  <strong>Regla de agregación colectiva (k ≥ 5):</strong> Ningún supervisor puede
                  visualizar métricas individuales; la información grupal requiere al menos 5
                  colaboradores para preservar el anonimato.
                </div>
              </div>

              <div className="privacy-point">
                <Icon name="Lock" size={16} className="privacy-point-icon" />
                <div>
                  <strong>Procesamiento local en navegador:</strong> Tu bitácora confidencial se
                  analiza de forma léxica y determinista en tu propio dispositivo sin viajar a servicios
                  externos de IA.
                </div>
              </div>

              {user.role === 'agente' && (
                <div className="privacy-habeas-link-box">
                  <Link
                    to="/agente/mis-datos"
                    className="privacy-habeas-link"
                    onClick={onClose}
                  >
                    <Icon name="FileText" size={14} />
                    <span>Ir al Centro de Datos Personales & Habeas Data (Ley 1581)</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie de Acciones */}
        <div className="user-profile-modal-footer">
          <button
            type="button"
            className="user-profile-cancel-btn"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="user-profile-save-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Icon name="RefreshCw" size={14} className="icon-spin" />
                <span>Guardando…</span>
              </>
            ) : (
              <>
                <Icon name="Check" size={14} />
                <span>Guardar cambios</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
