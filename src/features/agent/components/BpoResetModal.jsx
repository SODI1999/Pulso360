// src/features/agent/components/BpoResetModal.jsx
// Modal de descompresión para operaciones BPO (Box Breathing 4-4-4-4, Descanso Visual 20-20-20 y Estiramientos)

import { useState, useEffect } from 'react';
import { Icon } from '../../../core/components/Icon';

export function BpoResetModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('breathing'); // 'breathing' | 'eyes' | 'stretch'
    const [breathSeconds, setBreathSeconds] = useState(4);
    const [breathPhaseIndex, setBreathPhaseIndex] = useState(0);
    const [eyeTimer, setEyeTimer] = useState(20);
    const [eyeActive, setEyeActive] = useState(false);

    const phases = [
        { label: 'Inhala profundamente', hint: 'Llena tus pulmones con calma' },
        { label: 'Sostén el aire', hint: 'Mantén la calma y relaja los hombros' },
        { label: 'Exhala despacio', hint: 'Suelta toda la tensión de las llamadas' },
        { label: 'Pausa con calma', hint: 'Descansa antes del siguiente ciclo' }
    ];

    // Manejo de tecla Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Temporizador Box Breathing (16s ciclo total: 4 fases de 4s)
    useEffect(() => {
        if (!isOpen || activeTab !== 'breathing') return;

        const interval = setInterval(() => {
            setBreathSeconds((prev) => {
                if (prev <= 1) {
                    setBreathPhaseIndex((phase) => (phase + 1) % 4);
                    return 4;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, activeTab]);

    // Temporizador Descanso Ocular 20-20-20
    useEffect(() => {
        if (!isOpen || activeTab !== 'eyes' || !eyeActive) return;

        const interval = setInterval(() => {
            setEyeTimer((prev) => {
                if (prev <= 1) {
                    setEyeActive(false);
                    return 20;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, activeTab, eyeActive]);

    if (!isOpen) return null;

    const currentPhase = phases[breathPhaseIndex];

    return (
        <div
            className="modal-overlay active"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bpo-reset-title"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="modal-box bpo-reset-modal" role="document">
                <div className="modal-header">
                    <div>
                        <span
                            style={{
                                fontSize: '11px',
                                fontWeight: '700',
                                color: 'var(--c-calma-accent)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                display: 'block',
                                marginBottom: '4px'
                            }}
                        >
                            Pausa Activa y Recuperación Operativa
                        </span>
                        <h2 id="bpo-reset-title" className="modal-title">
                            Estación de Descompresión (2 minutos)
                        </h2>
                        <p className="modal-subtitle">
                            Desacelera el ritmo fisiológico y mitiga la fatiga ocular y postural entre turnos.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn-ghost"
                        onClick={onClose}
                        aria-label="Cerrar modal de descompresión"
                        style={{ padding: '6px', borderRadius: 'var(--radius-full)' }}
                    >
                        <Icon name="close" size={20} />
                    </button>
                </div>

                {/* Pestañas de ejercicios */}
                <div className="reset-tabs" role="tablist" aria-label="Técnicas de descompresión">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'breathing'}
                        className={`reset-tab-btn ${activeTab === 'breathing' ? 'active' : ''}`}
                        onClick={() => setActiveTab('breathing')}
                    >
                        <Icon name="self_improvement" size={16} />
                        <span>Respiración</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'eyes'}
                        className={`reset-tab-btn ${activeTab === 'eyes' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('eyes');
                            setEyeActive(true);
                        }}
                    >
                        <Icon name="visibility" size={16} />
                        <span>Descanso Ocular</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'stretch'}
                        className={`reset-tab-btn ${activeTab === 'stretch' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stretch')}
                    >
                        <Icon name="fitness_center" size={16} />
                        <span>Estiramiento Postural</span>
                    </button>
                </div>

                {/* Contenido Pestaña 1: Box Breathing */}
                {activeTab === 'breathing' && (
                    <div className="breathe-container" role="tabpanel">
                        <div className="breath-ring-wrapper">
                            <div className="breath-ring" aria-hidden="true" />
                            <div className="breath-inner-content">
                                <span className="breath-phase-text">{currentPhase.label}</span>
                                <span className="breath-countdown-number">{breathSeconds}</span>
                                <span className="breath-guide-label">{currentPhase.hint}</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '12.5px', color: 'var(--c-texto-suave)', maxWidth: '420px', margin: '12px auto 0', lineHeight: '1.45' }}>
                            La respiración cuadrada disminuye la frecuencia cardíaca y restablece el sistema nervioso simpático tras llamadas de alta demanda emocional.
                        </p>
                    </div>
                )}

                {/* Contenido Pestaña 2: Descanso Visual */}
                {activeTab === 'eyes' && (
                    <div className="eye-rest-panel" role="tabpanel">
                        <div className="eye-rest-target">
                            <span className="eye-rest-timer-val">{eyeTimer}s</span>
                            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                {eyeActive ? 'Enfoque lejano' : 'Completado'}
                            </span>
                        </div>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--c-texto)', margin: '8px 0 4px' }}>
                            Regla ergonómica 20-20-20
                        </h3>
                        <p style={{ fontSize: '12.5px', color: 'var(--c-texto-suave)', maxWidth: '440px', margin: '0 auto', lineHeight: '1.45' }}>
                            Aparta la vista del monitor y enfoca la mirada en un punto fijo a más de 6 metros de distancia durante 20 segundos para relajar los músculos ciliares de la vista.
                        </p>
                        {!eyeActive && (
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                    setEyeTimer(20);
                                    setEyeActive(true);
                                }}
                                style={{ marginTop: '16px' }}
                            >
                                <Icon name="play" size={14} />
                                <span>Reiniciar 20 segundos</span>
                            </button>
                        )}
                    </div>
                )}

                {/* Contenido Pestaña 3: Estiramientos */}
                {activeTab === 'stretch' && (
                    <div role="tabpanel">
                        <div className="stretch-grid">
                            <div className="stretch-item">
                                <span className="stretch-item-number">1</span>
                                <h4 className="stretch-item-title">Descarga Cervical</h4>
                                <p className="stretch-item-desc">
                                    Inclina la cabeza suavemente hacia el hombro derecho por 10s, luego cambia al izquierdo sin forzar la mandíbula.
                                </p>
                            </div>
                            <div className="stretch-item">
                                <span className="stretch-item-number">2</span>
                                <h4 className="stretch-item-title">Alivio de Muñecas</h4>
                                <p className="stretch-item-desc">
                                    Extiende un brazo al frente con la palma abierta y flexiona los dedos hacia atrás con la otra mano para liberar el túnel carpiano.
                                </p>
                            </div>
                            <div className="stretch-item">
                                <span className="stretch-item-number">3</span>
                                <h4 className="stretch-item-title">Apertura Dorsal</h4>
                                <p className="stretch-item-desc">
                                    Entrelaza las manos detrás de la espalda, eleva el pecho e inhala hondo para contrarrestar la postura frente al teclado.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                        type="button"
                        className="btn-modal-comprendido"
                        onClick={onClose}
                    >
                        Listo, volver al turno
                    </button>
                </div>
            </div>
        </div>
    );
}
