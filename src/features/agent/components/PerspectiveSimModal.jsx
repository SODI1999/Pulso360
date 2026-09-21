// src/features/agent/components/PerspectiveSimModal.jsx
// Simulador de transparencia y k-anonimato: clarifica qué información permanece privada y qué visualiza el supervisor/SST

import { useRef } from 'react';
import { Icon } from '../../../core/components/Icon';
import { useAgentModalAccessibility } from './useAgentModalAccessibility';

export function PerspectiveSimModal({ isOpen, onClose }) {
    const dialogRef = useRef(null);
    useAgentModalAccessibility({ isOpen, onClose, dialogRef });

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
            <div ref={dialogRef} className="modal-box agent-modal perspective-modal" role="document">
                <div className="modal-header">
                    <div>
                        <span className="agent-kicker">
                            Transparencia de datos
                        </span>
                        <h2 id="perspective-modal-title" className="modal-title">
                            ¿Qué ve tu supervisor y qué permanece protegido?
                        </h2>
                        <p className="modal-subtitle">
                            Revisa qué permanece en tu espacio personal y qué puede aparecer en vistas agregadas de la operación.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={onClose}
                        aria-label="Cerrar ventana de perspectiva"
                    >
                        <Icon name="close" size={20} />
                    </button>
                </div>

                <div className="perspective-grid">
                    {/* Columna 1: Lo que solo tú ves */}
                    <div className="perspective-card private">
                        <div className="perspective-header">
                            <div>
                                <h3 className="perspective-card-title">
                                    Tu Espacio Privado
                                </h3>
                                <span className="perspective-card-sub">
                                    Registros de tu espacio personal
                                </span>
                            </div>
                            <span className="perspective-badge private">No es una vista operativa</span>
                        </div>
                        <ul className="perspective-list">
                            <li className="perspective-list-item">
                                <span className="perspective-item-icon perspective-item-icon--private">
                                    <Icon name="check_circle" size={15} />
                                </span>
                                <span>
                                    <strong>Notas de Bitácora:</strong> La redacción íntegra, las emociones y el desahogo de turno permanecen en el espacio personal configurado por la aplicación.
                                </span>
                            </li>
                            <li className="perspective-list-item">
                                <span className="perspective-item-icon perspective-item-icon--private">
                                    <Icon name="check_circle" size={15} />
                                </span>
                                <span>
                                    <strong>Puntuaciones somáticas individuales:</strong> En esta simulación, el valor exacto de cada escala se mantiene en el registro del agente y no se muestra en las vistas colectivas.
                                </span>
                            </li>
                            <li className="perspective-list-item">
                                <span className="perspective-item-icon perspective-item-icon--private">
                                    <Icon name="check_circle" size={15} />
                                </span>
                                <span>
                                    <strong>Histórico temporal propio:</strong> Tu gráfica de energía y recuperación es tuya para autorregular pausas.
                                </span>
                            </li>
                            <li className="perspective-list-item">
                                <span className="perspective-item-icon perspective-item-icon--private">
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
                                <h3 className="perspective-card-title">
                                    Vista de Operaciones / SST
                                </h3>
                                <span className="perspective-card-sub">
                                    Reportes colectivos consolidados
                                </span>
                            </div>
                            <span className="perspective-badge supervisor">k-Anonimato (k ≥ 5)</span>
                        </div>
                        <ul className="perspective-list">
                            <li className="perspective-list-item">
                                <span className="perspective-item-icon perspective-item-icon--ops">
                                    <Icon name="info" size={15} />
                                </span>
                                <span>
                                    <strong>Promedios agrupados:</strong> Solo se calcula la media de campaña si hay al menos 5 respuestas en la franja horaria.
                                </span>
                            </li>
                            <li className="perspective-list-item">
                                <span className="perspective-item-icon perspective-item-icon--risk">
                                    <Icon name="close" size={15} />
                                </span>
                                <span>
                                    <strong>Cero nombres o identificadores:</strong> Ningún supervisor puede filtrar por agente, cédula o posición de cubículo.
                                </span>
                            </li>
                            <li className="perspective-list-item">
                                <span className="perspective-item-icon perspective-item-icon--risk">
                                    <Icon name="close" size={15} />
                                </span>
                                <span>
                                    <strong>Cero acceso a texto de bitácora:</strong> Tu bitácora no existe en la base de datos de supervisión ni auditoría.
                                </span>
                            </li>
                            <li className="perspective-list-item">
                                <span className="perspective-item-icon perspective-item-icon--ops">
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
                        <p>
                            Los datos personales se procesan con salvaguardas técnicas irreversibles. Ninguna métrica de bienestar puede utilizarse en evaluaciones de desempeño, amonestaciones o rankings operativos de la operación.
                        </p>
                    </div>
                </div>

                {/* Nota de aislamiento */}
                <div className="perspective-isolation-notice">
                    <Icon name="lock" size={15} />
                    <span>Aislamiento por roles (RBAC): El módulo de supervisor no posee endpoints ni consultas de identidad individual.</span>
                </div>

                <div className="modal-footer">
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
