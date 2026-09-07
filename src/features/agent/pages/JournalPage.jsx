// src/features/agent/pages/JournalPage.jsx
// Bitácora privada con análisis NLP explicable, corrección humana y protocolo de crisis

import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { nlpEngine } from '../../../core/nlp/nlpEngine';
import { Icon } from '../../../core/components/Icon';
import { NlpAnalysisPanel } from '../components/NlpAnalysisPanel';
import { NlpCorrectionModal, NlpHistoryModal } from '../components/NlpCorrectionModal';
import { CrisisSupportModal } from '../components/CrisisSupportModal';
import '../../../styles/bitacora.css';

export function JournalPage() {
    const currentUser = authService.getCurrentUser();
    const storeState = pulsoStore.get();
    const consent = storeState.consents?.[currentUser?.id] || {};

    // Estados del editor
    const [journals, setJournals] = useState([]);
    const [currentJournalId, setCurrentJournalId] = useState(null);
    const [journalText, setJournalText] = useState('');
    const [contextTag, setContextTag] = useState('');
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Modales
    const [showCrisisModal, setShowCrisisModal] = useState(false);
    const [crisisPriorityStep, setCrisisPriorityStep] = useState(false);
    const [crisisMode, setCrisisMode] = useState('anonimo');

    const [showCorrectionModal, setShowCorrectionModal] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [correctionNote, setCorrectionNote] = useState('');

    const [showHistoryModal, setShowHistoryModal] = useState(false);

    const pendingAnalysisRef = useRef(null);

    // Cargar bitácoras del agente
    const loadJournals = () => {
        const storeData = pulsoStore.get();
        const myJournals = (storeData.journals || []).filter(j => j.userId === currentUser?.id);
        setJournals(myJournals);
        return myJournals;
    };

    useEffect(() => {
        loadJournals();
    }, [currentUser?.id]);

    // Detección de posibles nombres propios o identificaciones (regex RF-04)
    const hasThirdPartyData = useMemo(() => {
        const pattern = /\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}\b|\b\d{7,}\b/;
        return pattern.test(journalText);
    }, [journalText]);

    // Obtener la entrada actualmente cargada
    const currentJournal = useMemo(() => {
        return journals.find(j => j.id === currentJournalId) || null;
    }, [journals, currentJournalId]);

    // Seleccionar una entrada de la lista
    const handleSelectJournal = (journal) => {
        setCurrentJournalId(journal.id);
        setJournalText(journal.text);
        setContextTag(journal.context || '');
        setFeedback({ type: '', message: '' });
    };

    // Crear una nueva entrada limpia
    const handleNewEntry = () => {
        setCurrentJournalId(null);
        setJournalText('');
        setContextTag('');
        setFeedback({ type: '', message: '' });
    };

    // Guardar / Guardar y analizar
    const handleSaveJournal = (e) => {
        e.preventDefault();
        const trimmed = journalText.trim();
        if (!trimmed) return;

        let storeData = pulsoStore.get();
        const isNew = !currentJournalId;
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);

        const journalPayload = {
            id: currentJournalId || `jrn-${Date.now()}`,
            userId: currentUser.id,
            date: currentJournal?.date || dateStr,
            createdAt: currentJournal?.createdAt || now.toISOString(),
            updatedAt: now.toISOString(),
            context: contextTag,
            text: trimmed,
            analysis: currentJournal?.analysis || null,
            correctedCategories: currentJournal?.correctedCategories || null,
            correctionNote: currentJournal?.correctionNote || null,
            correctionHistory: currentJournal?.correctionHistory || []
        };

        if (isNew) {
            storeData.journals.unshift(journalPayload);
        } else {
            const index = storeData.journals.findIndex(j => j.id === currentJournalId);
            if (index >= 0) storeData.journals[index] = journalPayload;
        }

        pulsoStore.save(storeData);
        pulsoStore.audit({
            actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
            action: isNew ? 'REGISTRO_BITACORA' : 'ACTUALIZACION_BITACORA',
            target: `Bitácora ${journalPayload.id}`
        });

        setCurrentJournalId(journalPayload.id);
        loadJournals();

        const latestConsent = pulsoStore.get().consents?.[currentUser?.id] || {};

        // Si no tiene C3 autorizado, no analiza con NLP
        if (!latestConsent.c3) {
            setFeedback({
                type: 'success',
                message: 'Entrada guardada sin análisis NLP por preferencia de consentimiento.'
            });
            return;
        }

        // Ejecución de análisis NLP con estado de carga visual
        setIsAnalyzing(true);

        setTimeout(() => {
            const analysisResult = nlpEngine.analyze(trimmed);

            const finishProcessing = () => {
                storeData = pulsoStore.get();
                const target = storeData.journals.find(j => j.id === journalPayload.id);
                if (target) {
                    target.analysis = analysisResult;
                    pulsoStore.save(storeData);
                }

                pulsoStore.audit({
                    actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
                    action: 'EJECUCION_NLP',
                    target: `Bitácora ${journalPayload.id}`
                });

                setIsAnalyzing(false);
                loadJournals();
                setFeedback({
                    type: 'success',
                    message: 'Entrada analizada y guardada con éxito.'
                });
            };

            if (analysisResult.isCrisisAlert) {
                pulsoStore.audit({
                    actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
                    action: 'RUTA_APOYO_MOSTRADA',
                    target: 'Ruta de apoyo prioritario'
                });
                pendingAnalysisRef.current = finishProcessing;
                setShowCrisisModal(true);
                setCrisisPriorityStep(false);
            } else {
                finishProcessing();
            }
        }, 450);
    };

    // Eliminar entrada (con confirmación de 2 pasos y escritura de palabra ELIMINAR)
    const handleDeleteJournal = () => {
        if (!currentJournalId) return;

        if (!window.confirm('Esta acción es irreversible. Se borrará el texto y su análisis. ¿Deseas continuar?')) {
            return;
        }

        const typedConfirmation = window.prompt('Para confirmar la eliminación definitiva, escribe ELIMINAR:') || '';
        if (typedConfirmation !== 'ELIMINAR') {
            alert('Confirmación no válida. No se eliminó la entrada.');
            return;
        }

        const storeData = pulsoStore.get();
        storeData.journals = storeData.journals.filter(j => j.id !== currentJournalId);
        pulsoStore.save(storeData);

        pulsoStore.audit({
            actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
            action: 'ELIMINACION_BITACORA',
            target: `Bitácora ${currentJournalId}`
        });

        handleNewEntry();
        loadJournals();
        setFeedback({ type: 'success', message: 'Entrada eliminada definitivamente.' });
    };

    // Abrir modal de corrección humana
    const handleOpenCorrection = () => {
        if (!currentJournal?.analysis) return;
        const initial = currentJournal.correctedCategories
            ? [...currentJournal.correctedCategories]
            : currentJournal.analysis.categories.map(c => c.name);

        setSelectedCategories(initial);
        setCorrectionNote('');
        setShowCorrectionModal(true);
    };

    // Manejo de checkboxes en la corrección
    const toggleCategorySelection = (catName) => {
        if (catName === 'Ninguna aplica') {
            if (selectedCategories.includes('Ninguna aplica')) {
                setSelectedCategories([]);
            } else {
                setSelectedCategories(['Ninguna aplica']);
            }
            return;
        }

        setSelectedCategories(prev => {
            const withoutNone = prev.filter(c => c !== 'Ninguna aplica');
            if (withoutNone.includes(catName)) {
                return withoutNone.filter(c => c !== catName);
            } else {
                return [...withoutNone, catName];
            }
        });
    };

    // Guardar corrección humana
    const handleSaveCorrection = () => {
        const storeData = pulsoStore.get();
        const target = storeData.journals.find(j => j.id === currentJournalId);
        if (!target) return;

        let finalCategories = selectedCategories.filter(c => c !== 'Ninguna aplica');
        const previousCats = target.correctedCategories
            ? [...target.correctedCategories]
            : (target.analysis?.categories || []).map(c => c.name);

        const noteText = correctionNote.trim().slice(0, 200);

        const newCorrectionRecord = {
            id: `corr-${Date.now()}`,
            timestamp: new Date().toISOString(),
            dateFormatted: new Date().toLocaleString('es-CO', {
                dateStyle: 'short',
                timeStyle: 'short'
            }),
            modelVersion: target.analysis?.version || 'lexico-v1.2',
            categories: finalCategories,
            previousCategories: previousCats,
            note: noteText
        };

        target.correctionHistory = target.correctionHistory || [];
        target.correctionHistory.unshift(newCorrectionRecord);
        target.correctedCategories = finalCategories;
        target.correctionNote = noteText;

        pulsoStore.save(storeData);
        pulsoStore.audit({
            actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
            action: 'CORRECCION_NLP',
            target: `Bitácora ${target.id} (Corrección #${target.correctionHistory.length})`
        });

        loadJournals();
        setShowCorrectionModal(false);
        setFeedback({ type: 'success', message: 'Corrección humana aplicada y registrada en auditoría.' });
    };

    // Confirmar solicitud prioritaria de crisis con SST
    const handleConfirmCrisisPriority = () => {
        const storeData = pulsoStore.get();
        const currentConsent = storeData.consents?.[currentUser?.id];

        if (!currentConsent?.c5) {
            alert('Se requiere tener activa la finalidad C5 de consentimiento para canalizar solicitudes a SST.');
            return;
        }

        const isAnonymous = crisisMode === 'anonimo';
        const prefix = isAnonymous ? 'ANON-PRI' : 'CONF-PRI';
        const code = `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        const newRequest = {
            id: `req-${Date.now()}`,
            code,
            mode: crisisMode,
            ownerUserId: currentUser.id,
            identityUserId: isAnonymous ? null : currentUser.id,
            date: new Date().toISOString().slice(0, 10),
            reason: 'Contacto prioritario solicitado por el titular',
            description: 'Contacto prioritario originado desde la bitácora.',
            urgency: 'alta',
            contactPreference: isAnonymous ? 'app' : 'directo',
            timeWindow: isAnonymous ? 'No aplica' : 'Prioritario',
            status: 'Recibida',
            assignedTo: 'usr-3',
            sla: 'Prioritario'
        };

        storeData.supportRequests = storeData.supportRequests || [];
        storeData.supportRequests.unshift(newRequest);
        pulsoStore.save(storeData);

        pulsoStore.audit({
            actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
            action: 'SOLICITUD_CONTACTO_PRIORITARIO',
            target: `Caso ${code} (${isAnonymous ? 'Modalidad Anónima' : 'Modalidad Confidencial Identificada'})`
        });

        setShowCrisisModal(false);
        if (pendingAnalysisRef.current) {
            pendingAnalysisRef.current();
            pendingAnalysisRef.current = null;
        }

        setFeedback({
            type: 'success',
            message: `Solicitud prioritaria registrada (Caso ${code}). SST gestionará tu caso prioritariamente. No se transmitió texto de tu bitácora.`
        });
    };

    const handleContinueFromCrisis = () => {
        setShowCrisisModal(false);
        if (pendingAnalysisRef.current) {
            pendingAnalysisRef.current();
            pendingAnalysisRef.current = null;
        }
    };

    // 1. Caso: Bloqueo por falta de consentimiento C2
    // 1. Caso: Bloqueo por falta de consentimiento C2
    if (!consent?.c2) {
        return (
            <div>
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Mi bitácora laboral</h1>
                        <p className="page-subtitle">Almacenamiento privado y cifrado.</p>
                    </div>
                </div>

                <div className="card center-card">
                    <div className="center-icon-badge" style={{ backgroundColor: 'var(--c-alerta-bg)', color: 'var(--c-alerta)', border: '1px solid var(--c-alerta-border)' }}>
                        <Icon name="shield" size={32} />
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--c-texto)' }}>
                        Bitácora desactivada
                    </h2>
                    <p style={{ color: 'var(--c-texto-suave)', marginBottom: '20px', maxWidth: '480px', margin: '0 auto 20px' }}>
                        No tienes activa la finalidad C2 de bitácora personal en tus preferencias.
                    </p>
                    <Link to="/consentimiento" className="btn btn-primary">
                        Activar C2 en mis preferencias
                    </Link>
                </div>
            </div>
        );
    }

    const allCategoriesWithNone = [...nlpEngine.getCategoryNames(), 'Ninguna aplica'];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Mi bitácora laboral</h1>
                    <p className="page-subtitle">
                        Solo tú puedes consultar estos textos. Almacenamiento privado; ningún otro rol dispone de acceso a tus notas.
                    </p>
                </div>
                <Link to="/agente/mi-analisis" className="btn btn-secondary">
                    <Icon name="insights" size={18} />
                    <span>Ver mis análisis</span>
                </Link>
            </div>

            {/* Split View: Lista a la izquierda y Editor a la derecha */}
            <div id="journalArea" className="journal-layout">
                {/* 1. Panel de Entradas Previas */}
                <section className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="card-title">Mis entradas</div>
                        <button type="button" className="btn btn-secondary" onClick={handleNewEntry}>
                            <Icon name="edit_note" size={16} />
                            <span>Nueva</span>
                        </button>
                    </div>

                    <div id="journalsList" className="journal-sidebar-list">
                        {journals.length === 0 ? (
                            <p style={{ color: 'var(--c-texto-suave)', padding: '16px 0', textAlign: 'center' }}>
                                Aún no has escrito entradas.
                            </p>
                        ) : (
                            journals.map(item => {
                                const isSelected = item.id === currentJournalId;
                                const preview = item.text.slice(0, 50);
                                const ellipsis = item.text.length > 50 ? '…' : '';
                                const badge = item.analysis ? 'Analizada' : 'Sin análisis';

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={`btn btn-ghost journal-row ${isSelected ? 'active' : ''}`}
                                        onClick={() => handleSelectJournal(item)}
                                        style={{
                                            textAlign: 'left',
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: 'var(--radius-md)',
                                            border: isSelected ? '1px solid var(--c-primario)' : '1px solid transparent',
                                            background: isSelected ? 'var(--c-primario-suave)' : 'var(--c-superficie)'
                                        }}
                                    >
                                        <div style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <strong style={{ fontSize: '13px', color: 'var(--c-texto)' }}>{item.date}</strong>
                                                <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{badge}</span>
                                            </div>
                                            <small style={{ color: 'var(--c-texto-suave)', display: 'block', margin: '4px 0' }}>
                                                {preview}{ellipsis}
                                            </small>
                                            {item.context && (
                                                <span style={{ fontSize: '11px', color: 'var(--c-texto-mutado)' }}>
                                                    {item.context}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* 2. Editor de Entrada */}
                <section className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Icon name="lock" size={18} />
                                <span>Entrada privada</span>
                            </div>
                            <div className="card-subtitle">Evita nombres de compañeros o datos de clientes.</div>
                        </div>
                        <span className="badge badge-info" id="nlpModeBadge">
                            {consent?.c3 ? 'NLP Activo' : 'NLP desactivado'}
                        </span>
                    </div>

                    {/* Alerta de Datos de Terceros (Regex) */}
                    {hasThirdPartyData && (
                        <div className="alert-banner warn" style={{ display: 'flex', gap: '10px', margin: '12px 0' }}>
                            <Icon name="info" size={18} />
                            <div style={{ fontSize: '13px' }}>
                                Evita escribir nombres de compañeros o datos identificativos de clientes. Puedes describir la situación sin identificarlos.
                            </div>
                        </div>
                    )}

                    <form id="journalForm" onSubmit={handleSaveJournal}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="contextTag">Contexto opcional</label>
                            <select
                                id="contextTag"
                                className="form-select"
                                value={contextTag}
                                onChange={(e) => setContextTag(e.target.value)}
                            >
                                <option value="">Sin etiqueta</option>
                                <option value="Turno mañana">Turno mañana</option>
                                <option value="Turno tarde">Turno tarde</option>
                                <option value="Campaña">Campaña</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="journalText">¿Qué deseas registrar hoy?</label>
                            <textarea
                                id="journalText"
                                className="form-textarea"
                                rows={8}
                                maxLength={2000}
                                placeholder="Escribe con total tranquilidad sobre cómo viviste tu jornada..."
                                value={journalText}
                                onChange={(e) => setJournalText(e.target.value)}
                                required
                            />
                            <div className="char-count">
                                <span>{journalText.length}</span> / 2000 caracteres
                            </div>
                        </div>

                        <div className="journal-editor-actions">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                id="saveJournalBtn"
                                disabled={isAnalyzing}
                            >
                                <Icon name={isAnalyzing ? 'sync' : 'task_alt'} size={18} />
                                <span>
                                    {isAnalyzing
                                        ? 'Analizando…'
                                        : consent?.c3
                                            ? 'Guardar y analizar'
                                            : 'Guardar'}
                                </span>
                            </button>

                            {currentJournalId && (
                                <button type="button" className="btn btn-danger" onClick={handleDeleteJournal}>
                                    <span>Eliminar entrada</span>
                                </button>
                            )}
                        </div>

                        {feedback.message && (
                            <div className={`form-feedback ${feedback.type}`} style={{ marginTop: '12px' }}>
                                {feedback.message}
                            </div>
                        )}
                    </form>

                    {/* 3. Panel de Análisis NLP Explicable */}
                    <NlpAnalysisPanel
                        journal={currentJournal}
                        onOpenCorrection={handleOpenCorrection}
                        onOpenHistory={() => setShowHistoryModal(true)}
                    />
                </section>
            </div>

            {/* MODAL 1: Protocolo de Apoyo en Crisis */}
            <CrisisSupportModal
                isOpen={showCrisisModal}
                priorityStep={crisisPriorityStep}
                onSetPriorityStep={setCrisisPriorityStep}
                crisisMode={crisisMode}
                onChangeCrisisMode={setCrisisMode}
                hasC5Consent={Boolean(consent?.c5)}
                onConfirmPriority={handleConfirmCrisisPriority}
                onContinue={handleContinueFromCrisis}
                onClose={() => setShowCrisisModal(false)}
            />

            {/* MODAL 2: Corrección Humana de NLP */}
            <NlpCorrectionModal
                isOpen={showCorrectionModal}
                allCategories={allCategoriesWithNone}
                selectedCategories={selectedCategories}
                onToggleCategory={toggleCategorySelection}
                correctionNote={correctionNote}
                onChangeNote={setCorrectionNote}
                onSave={handleSaveCorrection}
                onClose={() => setShowCorrectionModal(false)}
            />

            {/* MODAL 3: Historial de Correcciones NLP */}
            <NlpHistoryModal
                isOpen={showHistoryModal}
                history={currentJournal?.correctionHistory || []}
                onClose={() => setShowHistoryModal(false)}
            />
        </div>
    );
}
