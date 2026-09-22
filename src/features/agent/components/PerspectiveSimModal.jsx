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
                                    Tu espacio privado
                                </h3>
                                <span className="perspective-card-sub">
                                    Registros que quedan bajo tu cuenta
                                </span>
                            </div>
                        </div>
                        <ul className="perspective-list">
                            <li className="perspective-list-item">
                                <span className="perspective-item-icon perspective-item-icon--private">
                                    <Icon name="check_circle" size={15} />
                                </span>
                                <span>
                                    <strong>Notas de Bitácora:</strong> La redacción íntegra, las emociones y el desahogo de turno permanecen sólo en tu espacio personal; nadie más los ve dentro de la aplicación.
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
                                    Vista de operaciones y SST
                                </h3>
                                <span className="perspective-card-sub">
                                    Reportes colectivos, sin personas nombradas
                                </span>
                            </div>
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
                                    <strong>Cero acceso a texto de bitácora:</strong> Tu bitácora no forma parte de los registros que consultan supervisión ni auditoría.
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

                {/* Garantía de separación: un solo aviso reúne lo que antes eran dos cajas
                    (urna + aislamiento). Cada frase describe una regla comprobable en el código:
                    agregación k ≥ 5, vistas sin identidad y ausencia de funciones de evaluación
                    (auditoría 015, hallazgos 1 y 4). */}
                <div className="agent-notice agent-notice--flat">
                    <Icon name="shieldCheck" size={18} className="agent-notice-icon" />
                    <div className="agent-notice-text">
                        <strong>Separación de bienestar y desempeño:</strong> Las vistas de supervisión y SST reciben únicamente tendencias agregadas cuando hay al menos 5 personas (k ≥ 5) y ninguna de ellas permite consultar o filtrar a una persona concreta. La aplicación no incluye funciones de evaluación de desempeño, ranking ni amonestación: el registro de bienestar está separado de las métricas operativas como el AHT.
                    </div>
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
