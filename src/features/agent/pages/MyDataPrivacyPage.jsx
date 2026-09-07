// src/features/agent/pages/MyDataPrivacyPage.jsx
// Panel de Habeas Data, inventario, portabilidad y supresión de datos personales (RF-14 / Ley 1581 de 2012)

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { authService, roleLabels } from '../../../core/auth/authService';
import { pulsoStore } from '../../../core/storage/pulsoStore';
import { Icon } from '../../../core/components/Icon';

export function MyDataPrivacyPage() {
    const currentUser = authService.getCurrentUser();

    const [rectificationText, setRectificationText] = useState('');
    const [rectificationFeedback, setRectificationFeedback] = useState('');

    const [suppressionConfirmText, setSuppressionConfirmText] = useState('');
    const [suppressionFeedback, setSuppressionFeedback] = useState('');

    const [requestsVersion, setRequestsVersion] = useState(0);

    // Formatear fechas en formato colombiano
    const formatDate = (val) => {
        if (!val) return '—';
        const str = val.includes('T') ? val : `${val}T12:00:00`;
        return new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(str));
    };

    // Calcular rango de fechas
    const calculateDateRange = (rows, dateField) => {
        const values = rows
            .map(item => item[dateField])
            .filter(Boolean)
            .map(val => new Date(val.includes('T') ? val : `${val}T12:00:00`))
            .sort((a, b) => a - b);

        if (!values.length) return 'Sin registros';
        return `${formatDate(values[0].toISOString())} – ${formatDate(values.at(-1).toISOString())}`;
    };

    // Calcular días hábiles
    const addBusinessDays = (startDate, daysCount) => {
        const target = new Date(startDate);
        let added = 0;
        while (added < daysCount) {
            target.setDate(target.getDate() + 1);
            const dayOfWeek = target.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) added++;
        }
        return target.toISOString().slice(0, 10);
    };

    // Resumen de datos propios
    const summary = useMemo(() => {
        void requestsVersion;
        const storeData = pulsoStore.get();
        return {
            checkins: (storeData.checkins || []).filter(c => c.userId === currentUser?.id),
            journals: (storeData.journals || []).filter(j => j.userId === currentUser?.id),
            support: (storeData.supportRequests || []).filter(s => s.ownerUserId === currentUser?.id),
            consent: storeData.consents?.[currentUser?.id],
            requests: (storeData.habeasRequests || []).filter(r => r.userId === currentUser?.id)
        };
    }, [currentUser?.id, requestsVersion]);

    // Crear solicitud de Habeas Data
    const createHabeasRequest = (requestType, noteText) => {
        const storeData = pulsoStore.get();
        storeData.habeasRequests = storeData.habeasRequests || [];

        const now = new Date();
        const currentYear = now.getFullYear();
        const seq = storeData.habeasRequests.filter(r => String(r.id).startsWith(`HD-${currentYear}-`)).length + 1;
        const generatedId = `HD-${currentYear}-${String(seq).padStart(3, '0')}`;

        const businessDays = (requestType === 'Rectificación' || requestType === 'Supresión') ? 15 : 10;

        storeData.habeasRequests.unshift({
            id: generatedId,
            userId: currentUser.id,
            type: requestType,
            createdAt: now.toISOString(),
            status: 'Recibida',
            deadline: addBusinessDays(now, businessDays),
            note: noteText
        });

        pulsoStore.save(storeData);
        pulsoStore.audit({
            actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
            action: 'SOLICITUD_HABEAS_DATA',
            target: `${generatedId} · ${requestType}`
        });

        setRequestsVersion(prev => prev + 1);
        return generatedId;
    };

    // Portabilidad de datos (JSON / CSV)
    const handleDownloadPortability = (format) => {
        const payload = {
            titular: { id: currentUser.id, email: currentUser.email, name: currentUser.name },
            generado: new Date().toISOString(),
            checkins: summary.checkins,
            bitacoras: summary.journals,
            solicitudesAcompanamiento: summary.support,
            consentimiento: summary.consent
        };

        let content, mimeType, fileName;

        if (format === 'json') {
            content = JSON.stringify(payload, null, 2);
            mimeType = 'application/json';
            fileName = `pulso360_${currentUser.id}.json`;
        } else {
            const rows = ['tipo,id,fecha'];
            summary.checkins.forEach(item => rows.push(`checkin,${item.id},${item.date}`));
            summary.journals.forEach(item => rows.push(`bitacora,${item.id},${item.date}`));
            summary.support.forEach(item => rows.push(`solicitud_acompanamiento,${item.id},${item.date}`));
            content = rows.join('\n');
            mimeType = 'text/csv';
            fileName = `pulso360_${currentUser.id}.csv`;
        }

        const blob = new Blob([content], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = blobUrl;
        downloadAnchor.download = fileName;
        downloadAnchor.click();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 500);

        pulsoStore.audit({
            actor: `${currentUser.id} (${roleLabels[currentUser.role] || currentUser.role})`,
            action: 'PORTABILIDAD_DATOS',
            target: format.toUpperCase()
        });
    };

    // Solicitar rectificación
    const handleRectificationSubmit = (e) => {
        e.preventDefault();
        const detail = rectificationText.trim();
        if (detail.length < 10) {
            alert('Describe con un poco más de detalle el dato que deseas rectificar (mínimo 10 caracteres).');
            return;
        }

        const reqId = createHabeasRequest('Rectificación', detail);
        setRectificationFeedback(`Solicitud ${reqId} recibida. No se modifica ningún dato automáticamente.`);
        setRectificationText('');
    };

    // Solicitar supresión
    const handleSuppressionSubmit = () => {
        const reqId = createHabeasRequest('Supresión', 'Solicitud de supresión de datos conforme a la Ley 1581 de 2012.');
        setSuppressionFeedback(`Solicitud ${reqId} radicada exitosamente. Se gestionará administrativamente.`);
        setSuppressionConfirmText('');
    };

    const isSuppressionConfirmed = suppressionConfirmText === 'SUPRIMIR';

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Aquí controlas tus datos personales</h1>
                    <p className="page-subtitle">
                        Consulta, rectificación, portabilidad, revocación de consentimientos y solicitud de supresión.
                    </p>
                </div>
            </div>

            {/* 1. Inventario de Información Propia */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                    <div>
                        <div className="card-title">Inventario de información propia registrada</div>
                        <div className="card-subtitle">Los conteos y rangos corresponden exclusivamente a los registros asociados con tu cuenta.</div>
                    </div>
                </div>

                <div className="kpi-grid" id="inventory" style={{ marginTop: '16px' }}>
                    <div className="kpi-card">
                        <div className="kpi-label">Check-ins</div>
                        <div className="kpi-value">{summary.checkins.length}</div>
                        <div style={{ fontSize: '11px', color: 'var(--c-texto-mutado)', marginTop: '4px' }}>
                            {calculateDateRange(summary.checkins, 'date')}
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-label">Bitácoras</div>
                        <div className="kpi-value">{summary.journals.length}</div>
                        <div style={{ fontSize: '11px', color: 'var(--c-texto-mutado)', marginTop: '4px' }}>
                            {calculateDateRange(summary.journals, 'date')}
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-label">Solicitudes de apoyo</div>
                        <div className="kpi-value">{summary.support.length}</div>
                        <div style={{ fontSize: '11px', color: 'var(--c-texto-mutado)', marginTop: '4px' }}>
                            {calculateDateRange(summary.support, 'date')}
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-label">Consentimiento</div>
                        <div className="kpi-value" style={{ fontSize: '16px' }}>
                            {summary.consent?.policyAccepted ? 'Vigente' : 'Pendiente'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--c-texto-mutado)', marginTop: '4px' }}>
                            {summary.consent?.updatedAt ? `Actualizado ${formatDate(summary.consent.updatedAt)}` : 'Sin aceptación vigente'}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Consentimientos y Solicitud de Rectificación */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div className="card">
                    <div>
                        <div className="card-title">Consentimientos y finalidades</div>
                        <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', margin: '8px 0 16px' }}>
                            Puedes revisar o revocar las finalidades C1–C5 en cualquier momento sin consecuencias laborales.
                        </p>
                    </div>
                    <Link to="/consentimiento" className="btn btn-secondary">
                        <Icon name="shield" size={16} />
                        <span>Modificar mis preferencias</span>
                    </Link>
                </div>

                <div className="card">
                    <div className="card-title">Solicitar rectificación de datos</div>
                    <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', margin: '8px 0 14px' }}>
                        Indica qué información consideras incorrecta. La solicitud queda formalmente registrada y auditada.
                    </p>
                    <textarea
                        className="form-textarea"
                        rows={3}
                        maxLength={300}
                        placeholder="Describe el dato o registro a revisar..."
                        value={rectificationText}
                        onChange={(e) => setRectificationText(e.target.value)}
                    />
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleRectificationSubmit}
                        style={{ marginTop: '12px' }}
                    >
                        <Icon name="edit_note" size={16} />
                        <span>Crear solicitud de rectificación</span>
                    </button>
                    {rectificationFeedback && (
                        <div className="form-feedback info" style={{ marginTop: '10px' }}>
                            {rectificationFeedback}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Portabilidad de Datos */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-title">Portabilidad de datos propios</div>
                <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', margin: '8px 0 16px' }}>
                    Descarga una copia estructurada de tus datos registrados. La exportación queda asentada en la cadena inmutable de auditoría.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => handleDownloadPortability('json')}>
                        <Icon name="upload_file" size={16} />
                        <span>Descargar JSON estructurado</span>
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => handleDownloadPortability('csv')}>
                        <Icon name="summarize" size={16} />
                        <span>Descargar CSV propio</span>
                    </button>
                </div>
            </div>

            {/* 4. Solicitud Formal de Supresión */}
            <div className="card" style={{ border: '1px solid var(--c-critico-border)', marginBottom: '24px' }}>
                <div className="card-title" style={{ color: 'var(--c-critico)' }}>
                    Solicitud formal de supresión de datos
                </div>
                <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', margin: '8px 0 16px' }}>
                    Se eliminarán o disociarán datos personales conforme a la política vigente. Los agregados ya consolidados y los eventos de auditoría no se eliminan retrospectivamente para preservar la integridad del sistema.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', background: 'var(--c-fondo)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                    <div>
                        <strong style={{ fontSize: '12.5px', color: 'var(--c-texto)' }}>Se elimina o disocia:</strong>
                        <ul style={{ fontSize: '12px', color: 'var(--c-texto-suave)', paddingLeft: '18px', marginTop: '6px' }}>
                            <li>Texto de bitácoras sujeto a supresión</li>
                            <li>Clasificación NLP vinculada a tus textos</li>
                            <li>Vínculo personal de registros que corresponda disociar</li>
                        </ul>
                    </div>
                    <div>
                        <strong style={{ fontSize: '12.5px', color: 'var(--c-texto)' }}>Se conserva por política y ley:</strong>
                        <ul style={{ fontSize: '12px', color: 'var(--c-texto-suave)', paddingLeft: '18px', marginTop: '6px' }}>
                            <li>Métricas agregadas ya consolidadas</li>
                            <li>Metadatos de auditoría (con pseudonimización)</li>
                            <li>Prueba de consentimientos históricos</li>
                        </ul>
                    </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--c-texto-suave)', marginBottom: '10px' }}>
                    Para confirmar, escribe la palabra <strong style={{ color: 'var(--c-critico)' }}>SUPRIMIR</strong> en el siguiente campo:
                </p>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        className="form-input"
                        placeholder="Escribe SUPRIMIR..."
                        autoComplete="off"
                        value={suppressionConfirmText}
                        onChange={(e) => setSuppressionConfirmText(e.target.value)}
                        style={{ maxWidth: '240px' }}
                    />
                    <button
                        type="button"
                        className="btn btn-danger"
                        disabled={!isSuppressionConfirmed}
                        onClick={handleSuppressionSubmit}
                    >
                        <span>Crear solicitud de supresión</span>
                    </button>
                </div>

                {suppressionFeedback && (
                    <div className="form-feedback info" style={{ marginTop: '12px' }}>
                        {suppressionFeedback}
                    </div>
                )}
            </div>

            {/* 5. Seguimiento de Solicitudes de Habeas Data */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Seguimiento de mis solicitudes de Habeas Data</div>
                        <div className="card-subtitle">Plazos calculados en días hábiles (simulación sin calendario de festivos).</div>
                    </div>
                </div>

                <div id="requestTimeline" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                    {summary.requests.length === 0 ? (
                        <p style={{ color: 'var(--c-texto-suave)', margin: '16px 0', textAlign: 'center' }}>
                            No tienes solicitudes Habeas Data registradas.
                        </p>
                    ) : (
                        summary.requests.map(req => (
                            <div
                                key={req.id}
                                style={{ padding: '14px', background: 'var(--c-fondo)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--c-borde-suave)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong style={{ fontSize: '13.5px', color: 'var(--c-texto)' }}>{req.id} · {req.type}</strong>
                                    <span className="badge badge-info">{req.status}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--c-texto-suave)', margin: '4px 0' }}>
                                    Radicada: {formatDate(req.createdAt)} · Fecha objetivo: {formatDate(req.deadline)}
                                </div>
                                {req.note && (
                                    <div style={{ fontSize: '12px', color: 'var(--c-texto-mutado)', fontStyle: 'italic', marginTop: '4px' }}>
                                        Nota: {req.note}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
