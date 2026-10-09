// src/core/components/InactivityModal.jsx
// Control de inactividad de sesión (30 min) y advertencia visual preventiva (60 seg)

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../auth/authService';

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutos de tiempo máximo de inactividad
const WARNING_MS = 60 * 1000; // 60 segundos de advertencia previa

export function InactivityModal() {
  const navigate = useNavigate();
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  const isWarningVisibleRef = useRef(false);
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Cierre seguro de sesión
  const handleLogout = useCallback(() => {
    clearInterval(countdownIntervalRef.current);
    clearTimeout(warningTimerRef.current);
    clearTimeout(inactivityTimerRef.current);
    authService.logout();
    navigate('/login', { replace: true });
  }, [navigate]);

  // Reinicio de temporizadores ante actividad válida
  const resetTimer = useCallback(() => {
    clearTimeout(inactivityTimerRef.current);
    clearTimeout(warningTimerRef.current);
    clearInterval(countdownIntervalRef.current);

    setIsWarningVisible(false);
    isWarningVisibleRef.current = false;
    setSecondsLeft(60);

    const user = authService.getCurrentUser();
    if (!user) return;

    // Actualizar marca de tiempo de sesión
    authService.touchSession(user);

    // Programar advertencia preventiva a los 29 minutos
    warningTimerRef.current = setTimeout(() => {
      setIsWarningVisible(true);
      isWarningVisibleRef.current = true;
      let countdown = 60;
      setSecondsLeft(countdown);

      countdownIntervalRef.current = setInterval(() => {
        countdown -= 1;
        setSecondsLeft(countdown);
        if (countdown <= 0) {
          clearInterval(countdownIntervalRef.current);
          handleLogout();
        }
      }, 1000);
    }, INACTIVITY_MS - WARNING_MS);

    // Programar desconexión automática a los 30 minutos
    inactivityTimerRef.current = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_MS);
  }, [handleLogout]);

  useEffect(() => {
    const events = ['click', 'keydown', 'mousemove', 'touchstart'];

    const onUserActivity = () => {
      // Si el modal ya se desplegó, requerimos clic explícito en los botones de acción
      if (!isWarningVisibleRef.current) {
        resetTimer();
      }
    };

    events.forEach((evt) => window.addEventListener(evt, onUserActivity, { passive: true }));
    resetTimer();

    // Limpieza de suscripciones al desmontar para evitar memory leaks
    return () => {
      events.forEach((evt) => window.removeEventListener(evt, onUserActivity));
      clearTimeout(inactivityTimerRef.current);
      clearTimeout(warningTimerRef.current);
      clearInterval(countdownIntervalRef.current);
    };
  }, [resetTimer]);

  if (!isWarningVisible) return null;

  return (
    <div
      className="modal-overlay active"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sessionWarningTitle"
    >
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <h2 id="sessionWarningTitle" className="modal-title">
              Tu sesión está por expirar
            </h2>
            <p className="modal-subtitle">
              Por seguridad y confidencialidad en la operación, el sistema cerrará tu sesión tras 30 minutos de inactividad.
            </p>
          </div>
        </div>

        <div className="session-countdown-display">
          00:{String(Math.max(0, secondsLeft)).padStart(2, '0')}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleLogout}>
            Cerrar sesión
          </button>
          <button className="btn btn-primary" onClick={resetTimer}>
            Seguir conectado
          </button>
        </div>
      </div>
    </div>
  );
}
