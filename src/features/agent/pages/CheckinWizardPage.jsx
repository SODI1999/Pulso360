// src/features/agent/pages/CheckinWizardPage.jsx
// Formulario de Check-in diario por pasos (RF-03) con escala 1 a 5, opción de omitir y atajos de teclado

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { ScaleSelector } from '../components/ScaleSelector';

const QUESTIONS = [
    { key: 'energia', title: '¿Cómo sientes tu energía hoy?', labels: ['Muy baja', 'Baja', 'Media', 'Alta', 'Muy alta'] },
    { key: 'cargaEmocional', title: '¿Qué nivel de carga emocional percibes hoy?', labels: ['Muy baja', 'Baja', 'Media', 'Alta', 'Muy alta'] },
    { key: 'recuperacion', title: '¿Qué tan recuperado te sientes después de la jornada anterior?', labels: ['Nada', 'Poco', 'Parcial', 'Bien', 'Muy bien'] },
    { key: 'apoyo', title: '¿Qué nivel de apoyo percibes hoy en tu entorno de trabajo?', labels: ['Muy bajo', 'Bajo', 'Medio', 'Alto', 'Muy alto'] },
    { key: 'distanciamiento', title: '¿Qué tan distante o desconectado te sientes de tu trabajo hoy?', labels: ['Nada', 'Poco', 'Algo', 'Bastante', 'Mucho'] },
    { key: 'ineficacia', title: '¿Qué tanta sensación de ineficacia percibes hoy?', labels: ['Ninguna', 'Baja', 'Media', 'Alta', 'Muy alta'] }
];

export function CheckinWizardPage() {
    const user = authService.getCurrentUser();
    const data = pulsoStore.get();
    const consent = data.consents?.[user?.id];

    // 1. Calcular la jornada laboral según la hora de inicio de turno y zona horaria
    const calculateJourneyKey = useCallback(() => {
        const now = new Date();
        const dateParts = Object.fromEntries(
            new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/Bogota',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                hourCycle: 'h23'
            })
                .formatToParts(now)
                .filter(item => item.type !== 'literal')
                .map(item => [item.type, item.value])
        );

        const shiftStartHour = Number(user?.shiftStartHour ?? 8);
        let key = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;

        if (Number(dateParts.hour) < shiftStartHour) {
            const previousDate = new Date(`${key}T12:00:00Z`);
            previousDate.setUTCDate(previousDate.getUTCDate() - 1);
            key = previousDate.toISOString().slice(0, 10);
        }

        return { journeyKey: key, shiftStartHour };
    }, [user]);

    const { journeyKey, shiftStartHour } = calculateJourneyKey();
    const draftKey = `pulso360_checkin_draft_${user?.id}_${journeyKey}`;

    // Estados del flujo
    const [currentStep, setCurrentStep] = useState(0);
    const [draft, setDraft] = useState({});
    const [existingCheckin, setExistingCheckin] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [submittedSuccess, setSubmittedSuccess] = useState(false);
    const [draftNotice, setDraftNotice] = useState('');

    const stepTimerRef = useRef(null);

    // Cargar registro existente o borrador
    useEffect(() => {
        const storeData = pulsoStore.get();
        const found = (storeData.checkins || []).find(c => c.userId === user?.id && c.journeyKey === journeyKey);
        if (found) {
            setExistingCheckin(found);
        } else {
            try {
                const savedDraft = JSON.parse(localStorage.getItem(draftKey) || '{}');
                setDraft(savedDraft);
            } catch {
                setDraft({});
            }
        }
    }, [user?.id, journeyKey, draftKey]);

    // Limpiar temporizador al desmontar
    useEffect(() => {
        return () => {
            if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
        };
    }, []);

    // Guardar respuesta y avanzar automáticamente de paso
    const updateDraftValue = useCallback((key, value) => {
        setDraft(prevDraft => {
            const updated = { ...prevDraft, [key]: value };
            localStorage.setItem(draftKey, JSON.stringify(updated));
            return updated;
        });

        setDraftNotice('Borrador guardado localmente');

        if (stepTimerRef.current) {
            clearTimeout(stepTimerRef.current);
        }

        stepTimerRef.current = setTimeout(() => {
            setCurrentStep(prev => Math.min(5, prev + 1));
        }, 120);
    }, [draftKey]);

    // Manejo de atajos por teclado (1-5 para escala, ArrowLeft para volver)
    useEffect(() => {
        if (!consent?.c1 || (existingCheckin && !isEditing) || submittedSuccess) return;

        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }

            if (['1', '2', '3', '4', '5'].includes(e.key)) {
                const currentQuestion = QUESTIONS[currentStep];
                updateDraftValue(currentQuestion.key, Number(e.key));
            } else if (e.key === 'ArrowLeft') {
                if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
                setCurrentStep(prev => Math.max(0, prev - 1));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentStep, consent?.c1, existingCheckin, isEditing, submittedSuccess, updateDraftValue]);

    // Envío del Check-in
    const handleSubmit = (e) => {
        e.preventDefault();

        const missing = QUESTIONS.some(q => !Object.prototype.hasOwnProperty.call(draft, q.key));
        if (missing) {
            alert('Por favor responde cada dimensión o utiliza "Prefiero no responder".');
            return;
        }

        const storeData = pulsoStore.get();
        const payload = {
            id: existingCheckin?.id || `chk-${Date.now()}`,
            userId: user.id,
            journeyKey,
            date: journeyKey,
            submittedAt: existingCheckin?.submittedAt || new Date().toISOString(),
            ...Object.fromEntries(
                QUESTIONS.map(q => [q.key, Object.prototype.hasOwnProperty.call(draft, q.key) ? draft[q.key] : null])
            )
        };

        if (existingCheckin) {
            const index = storeData.checkins.findIndex(c => c.id === existingCheckin.id);
            if (index >= 0) storeData.checkins[index] = payload;
        } else {
            storeData.checkins.unshift(payload);
        }

        pulsoStore.save(storeData);
        pulsoStore.audit({
            actor: `${user.id} (${roleLabels[user.role] || user.role})`,
            action: existingCheckin ? 'EDICION_CHECKIN' : 'REGISTRO_CHECKIN',
            target: `Jornada ${journeyKey}`
        });

        localStorage.removeItem(draftKey);
        setExistingCheckin(payload);
        setSubmittedSuccess(true);
    };


    // 1. Caso: Bloqueo por falta de consentimiento C1
    if (!consent?.c1) {
        return (
            <div>
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Check-in de bienestar</h1>
                        <p className="page-subtitle">Jornada actual · America/Bogota</p>
                    </div>
                </div>

                <div className="card center-card">
                    <div className="center-icon-badge" style={{ backgroundColor: 'var(--c-alerta-bg)', color: 'var(--c-alerta)', border: '1px solid var(--c-alerta-border)' }}>
                        <Icon name="shield" size={32} />
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--c-texto)' }}>
                        Check-in no habilitado
                    </h2>
                    <p style={{ color: 'var(--c-texto-suave)', marginBottom: '20px', maxWidth: '480px', margin: '0 auto 20px' }}>
                        No tienes activa la finalidad C1 de registro diario en tus preferencias.
                    </p>
                    <Link to="/consentimiento" className="btn btn-primary">
                        Activar en mis preferencias
                    </Link>
                </div>
            </div>
        );
    }

    // 2. Caso: Pantalla de confirmación de éxito
    if (submittedSuccess) {
        return (
            <div>
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Check-in de bienestar</h1>
                        <p className="page-subtitle">Jornada {journeyKey} · Completado exitosamente</p>
                    </div>
                </div>

                <div className="card center-card">
                    <div className="center-icon-badge" style={{ backgroundColor: 'var(--c-exito-bg)', color: 'var(--c-exito)', border: '1px solid var(--c-exito-border)' }}>
                        <Icon name="check" size={32} />
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: 'var(--c-texto)' }}>
                        ¡Listo! Gracias por tu registro diario
                    </h2>
                    <p style={{ color: 'var(--c-texto-suave)', marginBottom: '24px', maxWidth: '520px', margin: '0 auto 24px', lineHeight: '1.5' }}>
                        Las respuestas marcadas como &ldquo;Prefiero no responder&rdquo; se almacenan como ausencia de dato, nunca como cero.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/agente/mi-bienestar" className="btn btn-primary">
                            Ver mi bienestar personal
                        </Link>
                        <Link to="/agente/bitacora" className="btn btn-secondary">
                            Escribir en mi bitácora
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Caso: Check-in ya registrado para la jornada de hoy (Ventana de edición)
    if (existingCheckin && !isEditing) {
        const age = Date.now() - new Date(existingCheckin.submittedAt).getTime();
        const editHours = Number(data.settings?.checkinEditHours || 2);
        const remainingTime = (editHours * 60 * 60 * 1000) - age;

        return (
            <div>
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Check-in de bienestar</h1>
                        <p className="page-subtitle">Jornada {journeyKey} · inicio de turno {String(shiftStartHour).padStart(2, '0')}:00</p>
                    </div>
                </div>

                <div className="card center-card">
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--c-texto)' }}>
                        Ya registraste tu check-in de esta jornada
                    </h2>

                    {remainingTime > 0 ? (
                        <>
                            <p style={{ color: 'var(--c-texto-suave)', marginBottom: '20px' }}>
                                Puedes editar tus respuestas durante {Math.floor(remainingTime / 3600000)} h {Math.floor((remainingTime % 3600000) / 60000)} min.
                            </p>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setDraft({ ...existingCheckin });
                                    setCurrentStep(0);
                                    setIsEditing(true);
                                }}
                            >
                                Editar registro
                            </button>
                        </>
                    ) : (
                        <p style={{ color: 'var(--c-texto-suave)' }}>
                            La ventana de edición configurada ({editHours} horas) ya ha cerrado para esta jornada.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // 4. Caso: Formulario de Wizard por Pasos (Preguntas 1 a 6)
    const safeStep = Math.min(5, Math.max(0, currentStep));
    const currentQ = QUESTIONS[safeStep] || QUESTIONS[0];
    const currentValue = draft[currentQ.key];

    return (
        <div>
            <div className="page-header" style={{ maxWidth: '600px', margin: '0 auto 16px' }}>
                <div>
                    <h1 className="page-title">Check-in de bienestar</h1>
                    <p className="page-subtitle">
                        Jornada {journeyKey} · inicio de turno {String(shiftStartHour).padStart(2, '0')}:00 · America/Bogota
                    </p>
                </div>
            </div>

            <form className="card wizard-card" onSubmit={handleSubmit}>
                <div className="wizard-header-meta">
                    <strong className="wizard-step-indicator">
                        Paso {currentStep + 1} de 6
                    </strong>
                    <span className="wizard-draft-notice">
                        {draftNotice}
                    </span>
                </div>

                {/* Barra de Progreso */}
                <div className="progress-track" aria-hidden="true">
                    <div
                        className="progress-fill"
                        style={{ width: `${((currentStep + 1) / 6) * 100}%` }}
                    />
                </div>

                {/* Sección de la pregunta activa */}
                <ScaleSelector
                    question={currentQ}
                    currentValue={currentValue}
                    onSelectValue={(val) => updateDraftValue(currentQ.key, val)}
                    onSkip={() => updateDraftValue(currentQ.key, null)}
                />

                {/* Botones de Navegación del Wizard */}
                <div className="wizard-footer-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                            if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
                            setCurrentStep(prev => Math.max(0, prev - 1));
                        }}
                        disabled={currentStep === 0}
                    >
                        <Icon name="arrowLeft" size={16} />
                        <span>Atrás</span>
                    </button>

                    {currentStep === 5 && (
                        <button type="submit" className="btn btn-primary">
                            <span>Enviar check-in</span>
                            <Icon name="check" size={16} />
                        </button>
                    )}
                </div>

                <div className="privacy-notice-box">
                    Tus respuestas individuales no se comparten con tu líder. Solo pueden contribuir a indicadores colectivos protegidos cuando C4 está activo y se cumple el umbral mínimo de confidencialidad (N ≥ 5).
                </div>
            </form>
        </div>
    );
}
