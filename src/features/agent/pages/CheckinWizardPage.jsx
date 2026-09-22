// src/features/agent/pages/CheckinWizardPage.jsx
// Formulario de Check-in diario por pasos (RF-03) somático, ergonómico y restaurador

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';
import { ScaleSelector } from '../components/ScaleSelector';
import { BpoResetModal } from '../components/BpoResetModal';
import '../../../styles/agent.css';

const QUESTIONS = [
    {
        key: 'energia',
        title: '¿Con qué nivel de batería física y mental estás enfrentando este turno?',
        labels: ['Sin batería', 'Baja energía', 'Justa para el turno', 'Buena energía', 'Plena y enfocado'],
        contextNote: 'Empezar con poca energía es natural tras jornadas largas o trasnocho. Reconocerlo te ayuda a no forzarte de más.'
    },
    {
        key: 'cargaEmocional',
        title: '¿Qué tan difícil o cargado sientes el trato con los usuarios en esta jornada?',
        labels: ['Muy tranquilo', 'Manejable', 'Exigente', 'Muy tenso', 'Hostil o agotador'],
        contextNote: 'Absorber la molestia de los clientes desgasta a cualquiera. Marcar un nivel alto refleja la rudeza de la cola hoy, no tu capacidad.'
    },
    {
        key: 'recuperacion',
        title: '¿Lograste descansar y desconectarte de la operación antes de iniciar hoy?',
        labels: ['Nada de descanso', 'Poco descanso', 'Descanso parcial', 'Buen descanso', 'Totalmente recuperado'],
        contextNote: 'Tu descanso es un derecho laboral. El sueño interrumpido o pensar en llamadas afecta directamente tu bienestar.'
    },
    {
        key: 'apoyo',
        title: 'Cuando se te complica una llamada o un caso difícil, ¿qué tan respaldado te sientes por tu soporte?',
        labels: ['Sin respaldo', 'Poco apoyo', 'Respaldo básico', 'Buen respaldo', 'Totalmente respaldado'],
        contextNote: 'Esta percepción corresponde a tu experiencia del turno; en los flujos definidos no se plantea usarla para calificar o amonestar a otras personas.'
    },
    {
        key: 'distanciamiento',
        title: '¿Sientes la necesidad de ponerte en \'piloto automático\' para sobrellevar la cola de llamadas?',
        labels: ['Nada (conectado)', 'Casi nunca', 'A veces', 'Frecuentemente', 'Todo el turno'],
        contextNote: 'Poner un escudo mental es una reacción natural de autoprotección cuando la cola no frena. No significa desinterés.'
    },
    {
        key: 'ineficacia',
        title: '¿Sientes que los sistemas, herramientas y políticas te dejan resolverle al usuario o te atan las manos?',
        labels: ['Todo fluye', 'Mayormente fluido', 'Trabas ocasionales', 'Manos atadas', 'Impotencia total'],
        contextNote: 'La frustración cuando el sistema se congela o la política no ayuda es un fallo de herramientas, no de tu capacidad.'
    }
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
        const currentHour = Number(dateParts.hour);
        let key = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;

        if (currentHour < shiftStartHour) {
            const previousDate = new Date(`${key}T12:00:00Z`);
            previousDate.setUTCDate(previousDate.getUTCDate() - 1);
            key = previousDate.toISOString().slice(0, 10);
        }

        // Fuera de horario regular: más de 8 horas tras el inicio o antes del inicio
        const hoursSinceStart = (currentHour - shiftStartHour + 24) % 24;
        const isOutsideShift = hoursSinceStart >= 8;

        return { journeyKey: key, shiftStartHour, currentHour, isOutsideShift };
    }, [user]);

    const { journeyKey, shiftStartHour, isOutsideShift } = calculateJourneyKey();
    const draftKey = `pulso360_checkin_draft_${user?.id}_${journeyKey}`;

    // Estados del flujo
    const [currentStep, setCurrentStep] = useState(0);
    const [draft, setDraft] = useState({});
    const [existingCheckin, setExistingCheckin] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [submittedSuccess, setSubmittedSuccess] = useState(false);
    const [draftNotice, setDraftNotice] = useState('');
    const [validationError, setValidationError] = useState('');
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [dismissDisconnectNotice, setDismissDisconnectNotice] = useState(false);

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

    // Guardar respuesta y avanzar automáticamente de paso (220ms para confirmación visual)
    const updateDraftValue = useCallback((key, value) => {
        setDraft(prevDraft => {
            const updated = { ...prevDraft, [key]: value };
            localStorage.setItem(draftKey, JSON.stringify(updated));
            return updated;
        });

        setDraftNotice('Borrador guardado localmente');
        setValidationError('');

        if (stepTimerRef.current) {
            clearTimeout(stepTimerRef.current);
        }

        stepTimerRef.current = setTimeout(() => {
            setCurrentStep(prev => Math.min(5, prev + 1));
        }, 220);
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
            setValidationError('Por favor responde cada dimensión o utiliza "Prefiero omitir esta pregunta hoy".');
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
            <div className="agent-page agent-page--checkin">
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

    // 2. Caso: Pantalla de Cierre Restaurador (éxito)
    if (submittedSuccess) {
        return (
            <div className="agent-page agent-page--checkin">
                <div className="page-header page-header--wizard">
                    <div>
                        <h1 className="page-title">Check-in de bienestar</h1>
                        <p className="page-subtitle">Jornada {journeyKey} · Completado exitosamente</p>
                    </div>
                </div>

                <div className="card center-card restaurador-card">
                    <div className="center-icon-badge" style={{ backgroundColor: 'var(--c-exito-bg)', color: 'var(--c-exito)', border: '1px solid var(--c-exito-border)' }}>
                        <Icon name="checkCircle" size={32} />
                    </div>

                    <h2 className="restaurador-title">
                        ¡Turno registrado! Gracias por hacer esta pausa.
                    </h2>

                    <div className="restaurador-somatic-box">
                        <div className="restaurador-somatic-icon-badge">
                            <Icon name="self_improvement" size={20} />
                        </div>
                        <p className="restaurador-somatic-text">
                            Antes de volver a ponerte la diadema: baja los hombros, gira suavemente el cuello e hidrátate con un sorbo de agua.
                        </p>
                    </div>

                    <p className="restaurador-privacy-note">
                        Tus respuestas siguen la regla de agregación definida para esta experiencia. Las dimensiones omitidas se almacenan como ausencia de dato, no como cero.
                    </p>

                    <div className="restaurador-actions">
                        <div className="restaurador-links-group">
                            <Link to="/agente/mi-bienestar" className="btn btn-primary">
                                <Icon name="favorite" size={16} />
                                <span>Ver mi bienestar personal</span>
                            </Link>
                            <button
                                type="button"
                                className="btn btn-decompression-highlight"
                                onClick={() => setIsResetModalOpen(true)}
                            >
                                <Icon name="self_improvement" size={18} />
                                <span>Pausa de reseteo (2 min)</span>
                            </button>
                            <Link to="/agente/bitacora" className="btn btn-secondary">
                                <Icon name="edit_note" size={16} />
                                <span>Escribir en mi bitácora</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Modal de Descompresión BPO (Box Breathing, Descanso Ocular, Estiramientos) */}
                <BpoResetModal
                    isOpen={isResetModalOpen}
                    onClose={() => setIsResetModalOpen(false)}
                />
            </div>
        );
    }

    // 3. Caso: Check-in ya registrado para la jornada de hoy (Ventana de edición)
    if (existingCheckin && !isEditing) {
        const age = Date.now() - new Date(existingCheckin.submittedAt).getTime();
        const editHours = Number(data.settings?.checkinEditHours || 2);
        const remainingTime = (editHours * 60 * 60 * 1000) - age;

        return (
            <div className="agent-page agent-page--checkin">
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
        <div className="agent-page agent-page--checkin">
            {/* Soporte de Desconexión Laboral (Ley 2191 de 2022) */}
            {isOutsideShift && !dismissDisconnectNotice && (
                <div className="disconnect-banner wizard-disconnect-banner">
                    <div className="disconnect-info">
                        <div className="disconnect-icon-wrapper">
                            <Icon name="clock" size={20} />
                        </div>
                        <div>
                            <div className="disconnect-title">
                                <span>Desconexión Laboral Activa (Ley 2191 de 2022)</span>
                                <span className="badge badge-ok">Fuera de horario ordinario</span>
                            </div>
                            <p className="disconnect-desc">
                                Tu turno regular ha culminado o estás antes de tu hora de inicio. En Pulso360 respaldamos tu derecho al descanso efectivo. Si te encuentras en jornada extraordinaria o deseas completar tu registro voluntariamente, continúa con total tranquilidad.
                            </p>
                        </div>
                    </div>
                    <div className="disconnect-actions">
                        <button
                            type="button"
                            className="btn btn-modal-comprendido btn-sm"
                            onClick={() => setDismissDisconnectNotice(true)}
                        >
                            Continuar registro
                        </button>
                    </div>
                </div>
            )}

            <div className="page-header page-header--wizard">
                <div>
                    <h1 className="page-title">Check-in de bienestar</h1>
                    <p className="page-subtitle">
                        Jornada {journeyKey} · inicio de turno {String(shiftStartHour).padStart(2, '0')}:00 · America/Bogota
                    </p>
                </div>
            </div>

            <form className="card wizard-card agent-work-surface" onSubmit={handleSubmit}>
                <div className="wizard-header-meta">
                    <strong className="wizard-step-indicator">
                        Dimensión {currentStep + 1} de 6
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

                {/* Sección de la pregunta activa con escala somática */}
                <ScaleSelector
                    question={currentQ}
                    currentValue={currentValue}
                    onSelectValue={(val) => updateDraftValue(currentQ.key, val)}
                    onSkip={() => updateDraftValue(currentQ.key, null)}
                />

                {/* Alerta de validación accesible en caso de dimensiones incompletas */}
                {validationError && (
                    <div className="alert alert-danger" role="alert" style={{ marginBottom: '16px' }}>
                        <Icon name="warning" size={16} />
                        <span>{validationError}</span>
                    </div>
                )}

                {/* Botones de Navegación del Wizard con anticipación simétrica */}
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

                    {currentStep < 5 ? (
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => {
                                if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
                                setCurrentStep(prev => Math.min(5, prev + 1));
                            }}
                        >
                            <span>Siguiente</span>
                            <Icon name="arrowRight" size={16} />
                        </button>
                    ) : (
                        <button type="submit" className="btn btn-primary">
                            <span>Enviar check-in</span>
                            <Icon name="check" size={16} />
                        </button>
                    )}
                </div>

                {/* Regla visible de agregación y alcance por rol */}
                <div className="privacy-notice-box wizard-privacy-box">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <Icon name="shieldCheck" size={16} style={{ color: 'var(--c-primario)', flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <strong style={{ color: 'var(--c-texto)', fontSize: '12.5px' }}>
                                Regla de agregación (k ≥ 5)
                            </strong>
                            <span style={{ fontSize: '12px', color: 'var(--c-texto-suave)', lineHeight: '1.45' }}>
                                En los flujos definidos, las respuestas individuales quedan fuera de la vista colectiva mientras el grupo no alcanza al menos 5 personas. Los roles operativos reciben tendencias agregadas, no el detalle de cada respuesta.
                            </span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
