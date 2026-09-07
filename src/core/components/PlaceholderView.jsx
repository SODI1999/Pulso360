// src/core/components/PlaceholderView.jsx
// Vista provisional para rutas pendientes de migración en hitos posteriores

import { Icon } from './Icon';

export function PlaceholderView({ title, subtitle, icon = 'dashboard', milestone = 'Hito Próximo' }) {
    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">{title}</h1>
                    <p className="page-subtitle">{subtitle}</p>
                </div>
                <span className="badge badge-info">{milestone}</span>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--c-primario-suave)',
                    color: 'var(--c-primario)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                }}>
                    <Icon name={icon} size={28} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--c-texto)' }}>
                    Módulo listo para migración
                </h2>
                <p style={{ maxWidth: '480px', margin: '0 auto', fontSize: '13.5px', color: 'var(--c-texto-suave)', lineHeight: '1.5' }}>
                    Esta vista se encuentra vinculada correctamente en el árbol de rutas y protegida bajo el modelo RBAC.
                    La lógica de negocio completa se integrará en el {milestone}.
                </p>
            </div>
        </div>
    );
}
