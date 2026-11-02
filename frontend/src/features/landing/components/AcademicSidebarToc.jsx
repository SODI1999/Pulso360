import { Icon } from '../../../core/components/Icon';

const SECTIONS = [
  { id: 'autores', label: 'Autores y Equipo', icon: 'users' },
  { id: 'evidencia-empirica', label: '1. Datos de aula', icon: 'Activity' },
  { id: 'transferencia', label: '2. Origen de la idea', icon: 'FileText' },
  { id: 'antivigilancia', label: '3. Anti-vigilancia', icon: 'ShieldCheck' },
  { id: 'citacion', label: '4. Atribución del material', icon: 'Bookmark' },
  { id: 'marco-legal', label: '5. Marco Legal', icon: 'Scale' }
];

export function AcademicSidebarToc({ activeSection }) {
  return (
    <aside className="academic-sidebar-rail no-print" aria-label="Navegación del dossier">
      <nav className="academic-toc-sidebar" aria-label="Índice temático del dossier">
        <div className="toc-sidebar-header">
          <Icon name="bookmark" size={14} />
          <span>Índice del Dossier</span>
        </div>

        <div className="toc-sidebar-list">
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className={`toc-sidebar-link ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <Icon name={sec.icon} size={14} className="toc-link-icon" />
                <span className="toc-link-text">{sec.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
