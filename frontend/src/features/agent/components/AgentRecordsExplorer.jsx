import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../core/components/Icon';

/**
 * Explorador Cronológico de Registros Propios del Agente.
 * Reemplaza las tarjetas KPI de conteos planos por una lista navegable y accionable de registros asociados al titular.
 */
export function AgentRecordsExplorer({ summary, formatDate, onSelectForRectification }) {
  const [filterType, setFilterType] = useState('all');

  const checkinsCount = summary?.checkins?.length || 0;
  const journalsCount = summary?.journals?.length || 0;
  const supportCount = summary?.support?.length || 0;

  // Mapear y normalizar registros para visualización cronológica unificada
  const allRecords = useMemo(() => {
    const list = [];
    const checkins = summary?.checkins || [];
    const journals = summary?.journals || [];
    const support = summary?.support || [];

    checkins.forEach((item) => {
      const dateVal = item.date || item.submittedAt || '';
      list.push({
        id: item.id || `chk-${dateVal}`,
        type: 'checkin',
        typeLabel: 'Check-in de turno',
        icon: 'HeartPulse',
        iconClass: 'icon-primary',
        date: dateVal,
        title: `Check-in de turno · ID ${item.id || 'S/N'}`,
        description: `Energía: ${item.energia ?? '–'}/5 · Tensión: ${item.cargaEmocional ?? '–'}/5 · Registro somático de jornada.`,
        viewLink: '/agente/mi-bienestar',
        viewLinkLabel: 'Ver en Bienestar',
        raw: item
      });
    });

    journals.forEach((item) => {
      const dateVal = item.date || item.createdAt || '';
      const textPreview = item.content
        ? item.content.length > 85
          ? `${item.content.slice(0, 85)}…`
          : item.content
        : 'Reflexión privada de desahogo almacenada localmente.';

      list.push({
        id: item.id || `jnl-${dateVal}`,
        type: 'journal',
        typeLabel: 'Bitácora personal',
        icon: 'BookOpen',
        iconClass: 'icon-teal',
        date: dateVal,
        title: `Bitácora personal · ID ${item.id || 'S/N'}`,
        description: textPreview,
        viewLink: '/agente/bitacora',
        viewLinkLabel: 'Ver en Bitácora',
        raw: item
      });
    });

    support.forEach((item) => {
      const dateVal = item.date || item.createdAt || '';
      list.push({
        id: item.id || `sup-${dateVal}`,
        type: 'support',
        typeLabel: 'Solicitud de apoyo',
        icon: 'HeartHandshake',
        iconClass: 'icon-purple',
        date: dateVal,
        title: `Acompañamiento · ID ${item.id || 'S/N'}`,
        description: `Canal: ${item.channel || 'SST / Orientación'} · Estado: ${item.status || 'Registrada'} · Confidencial.`,
        viewLink: '/agente/apoyo',
        viewLinkLabel: 'Ver en Apoyo',
        raw: item
      });
    });

    // Ordenar de más reciente a más antiguo
    return list.sort((a, b) => {
      const dateA = new Date(a.date.includes('T') ? a.date : `${a.date}T12:00:00Z`).getTime();
      const dateB = new Date(b.date.includes('T') ? b.date : `${b.date}T12:00:00Z`).getTime();
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });
  }, [summary]);

  const filteredRecords = useMemo(() => {
    if (filterType === 'all') return allRecords;
    return allRecords.filter((r) => r.type === filterType);
  }, [allRecords, filterType]);

  const filters = [
    { id: 'all', label: 'Todos los registros', count: allRecords.length },
    { id: 'checkin', label: 'Check-ins', count: checkinsCount },
    { id: 'journal', label: 'Bitácoras', count: journalsCount },
    { id: 'support', label: 'Solicitudes de apoyo', count: supportCount }
  ];

  return (
    <div className="card">
      <div className="card-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h2 className="card-title" style={{ fontSize: '15px' }}>
            Explorador de Registros Propios
          </h2>
          <p className="card-subtitle">
            Consulta el histórico de entradas vinculadas a tu cuenta. Puedes inspeccionar cada registro o solicitar su rectificación formal si detectas alguna inconsistencia.
          </p>
        </div>
      </div>

      {/* Píldoras de filtrado */}
      <div className="records-filter-pills" role="group" aria-label="Filtro de tipos de registro">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`records-filter-pill ${filterType === f.id ? 'is-active' : ''}`}
            onClick={() => setFilterType(f.id)}
            aria-pressed={filterType === f.id}
          >
            <span>{f.label}</span>
            <span className="records-filter-count">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Listado de registros filtrados */}
      <div className="records-list" id="records-list-container">
        {filteredRecords.length === 0 ? (
          <div className="records-empty-state">
            <Icon name="Inbox" size={32} style={{ color: 'var(--c-texto-suave)', marginBottom: '8px' }} />
            <strong style={{ fontSize: '13.5px', color: 'var(--c-texto)' }}>
              No hay registros disponibles en esta categoría
            </strong>
            <p style={{ fontSize: '12.5px', color: 'var(--c-texto-suave)', margin: '4px 0 0' }}>
              Cuando completes check-ins o redactes entradas en tu bitácora, aparecerán catalogados aquí.
            </p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div key={`${record.type}-${record.id}`} className="record-item-card">
              <div className="record-item-main">
                <div className={`record-item-icon-box ${record.iconClass}`}>
                  <Icon name={record.icon} size={16} />
                </div>
                <div className="record-item-info">
                  <div className="record-item-header-line">
                    <strong className="record-item-title">{record.title}</strong>
                    <span className="record-item-date">
                      <Icon name="Calendar" size={12} />
                      <span>{formatDate(record.date)}</span>
                    </span>
                  </div>
                  <p className="record-item-desc">{record.description}</p>
                </div>
              </div>

              <div className="record-item-actions">
                {record.viewLink && (
                  <Link to={record.viewLink} className="btn btn-secondary btn-sm record-action-btn">
                    <span>{record.viewLinkLabel}</span>
                  </Link>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm record-action-btn"
                  onClick={() => onSelectForRectification(record)}
                  title="Radicar una solicitud formal para rectificar este registro"
                >
                  <Icon name="Pencil" size={13} />
                  <span>Rectificar</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
