// src/features/agent/components/PerspectiveSimModal.jsx
// Simulador de transparencia y k-anonimato: clarifica qué información permanece privada y qué visualiza el supervisor/SST

import { useEffect } from 'react';
import { Icon } from '../../../core/components/Icon';

export function PerspectiveSimModal({ isOpen, onClose }) {
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay active"
            role="dialog"
            aria-modal="true"
            aria-labelledby="perspective-modal-title"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="modal-box perspective-modal" role="document">
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
                            Transparencia Algorítmica y Privacidad por Diseño
                        </span>
                        <h2 id="perspective-modal-title" className="modal-title">
                            ¿Qué ve tu supervisor y qué permanece protegido?
                        </h2>
                        <p className="modal-subtitle">
                            Compara cara a cara lo que está en tu control exclusivo frente a los datos que llegan a la operación.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn-ghost"
                        onClick={onClose}
                        aria-label="Cerrar ventana de perspectiva"
                        style={{ padding: '6px', borderRadius: 'var(--radius-full)' }}
                    >
                        <Icon name="close" size={20} />
                    </button>
                </div>

                <div className="perspective-grid">
                    {/* Columna 1: Lo que solo tú ves */}
                    <div className="perspective-card private">
                        <div className="perspective-header">
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--c-texto)', margin: 0 }}>
                                    Tu Espacio Privado
                                </h3>
                                <span style={{ fontSize: '11.5px', color: 'var(--c-texto-suave)' }}>
                                    Visión exclusiva del agente
                                </span>
                            </div>
                            <span className="perspective-badge private">Secreto Individual</span>
                        </div>
                        <ul className="perspective-list">
                            <li className="perspective-list-item">
                                <span className="perspective-item-icon" style={{ color: 'var(--c-calma-accent)' }}>
                                    <Icon name="check_circle" size={15} />
                                </span>
                                <span>
                                    <strong>Notas de Bitácora:</strong> Redacción íntegra, emociones y desahogo de turno quedan cifrados localmente.
                                </span>
                            </li>
                            <li className="perspective-list-item">
                                <span className="perspective-item-icon" style={{ color: 'var(--c-calma-accent)' }}>
                                    <Icon name="check_circle" size={15} />
                                </span>
                                <span>
                                    <strong>Puntuaciones somáticas individuales:</strong> El valor exacto que marcas en cada escala (1 a 5) nunca se asocia a tu nombre.
                                </span>
                            </li>
                            <li className="perspective-list-item">
                                <span className="perspective-item-icon" style={{ color: 'var(--c-calma-accent)' }}>
                                    <Icon name="check_circle" size={15} />
                                </span>
                                <span>
                                    <strong>Histórico temporal propio:</strong> Tu gráfica de energía y recuperación es tuya para autorregular pausas.
                                </span>
                            </li>
                            <li className="perspective-list-item">
                                <span className="perspective-item-icon" style={{ color: 'var(--c-calma-accent)' }}>
                                    <Icon name="check_circle" size={15} />
                                </span>
                                <span>
                                    <strong>Preferencias de consentimiento:</strong> Modificables o revocables en cualquier momento.
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Columna 2: Lo que ve el supervisor / SST */}
                    <div className="perspective-card supervisor">
                        <div className="perspective-header">
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--c-texto)', margin: 0 }}>
                                    Vista de Operaciones / SST
                                </h3>
                                <span style={{ fontSize: '11.5px', color: 'var(--c-texto-suave)' }}>
                                    Reportes colectivos consolidados
                                </span>
                            </div>
                            <span className="perspective-badge supervisor">k-Anonimato (k ≥ 5)</span>
                        </div>
                        <ul className="perspective-list">
                            <li className="perspective-list-item">
                                <span className="perspective-item-icon" style={{ color: '#1d4ed8' }}>
                                    <Icon name="info" size={15} />
                                </span>
                                <span>
                                    <strong>Promedios agrupados:</strong> Solo se calcula la media de campaña si hay al menos 5 respuestas en la franja horaria.
                                </span>
                            </li>
                            <li className="perspective-list-item">
                                <span className="perspective-item-icon" style={{ color: 'var(--c-critico)' }}>
                                    <Icon name="close" size={15} />
                                </span>
                                <span>
                                    <strong>Cero nombres o identificadores:</strong> Ningún supervisor puede filtrar por agente, cédula o posición de cubículo.
                                </span>
                            </li>
                            <li className="perspective-list-item">
                                <span className="perspective-item-icon" style={{ color: 'var(--c-critico)' }}>
                                    <Icon name="close" size={15} />
                                </span>
                                <span>
                                    <strong>Cero acceso a texto de bitácora:</strong> Tu bitácora no existe en la base de datos de supervisión ni auditoría.
                                </span>
                            </li>
                            <li className="perspective-list-item">
                                <span className="perspective-item-icon" style={{ color: '#1d4ed8' }}>
                                    <Icon name="info" size={15} />
                                </span>
                                <span>
                                    <strong>Alertas colectivas:</strong> Señalan sobrecarga general de la cola de llamadas para activar rotaciones o pausas de equipo.
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Banner de Urna Cerrada */}
                <div className="perspective-urna-banner">
                    <Icon name="shield" size={20} />
                    <div>
                        <strong>Mecanismo de Urna Cerrada Institucional:</strong>
                        <p style={{ margin: '3px 0 0', fontSize: '12px' }}>
                            Los datos personales se procesan con salvaguardas técnicas irreversibles. Ninguna métrica de bienestar puede utilizarse en evaluaciones de desempeño, amonestaciones o rankings operativos de la operación.
                        </p>
                    </div>
                </div>

                {/* Nota de aislamiento */}
                <div className="perspective-isolation-notice">
                    <Icon name="lock" size={15} />
                    <span>Aislamiento por roles (RBAC): El módulo de supervisor no posee endpoints ni consultas de identidad individual.</span>
                </div>

                <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn-modal-comprendido"
                        onClick={onClose}
                    >
                        Comprendido
                    </button>
                </div>
            </div>
        </div>
    );
}
