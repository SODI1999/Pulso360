import { Component, Suspense, useId } from 'react';
import { Link, useLocation } from 'react-router-dom';

function PageLoading({ standalone }) {
  const Container = standalone ? 'main' : 'div';
  return <Container data-page-boundary="loading" aria-busy="true"
    className={standalone ? 'page-container' : undefined} style={{ padding: 'var(--space-5)' }}>
    <p role="status">Cargando vista…</p>
  </Container>;
}

function PageLoadError({ standalone }) {
  const headingId = useId();
  const Container = standalone ? 'main' : 'div';
  return <Container data-page-boundary="error" className={standalone ? 'page-container' : undefined}
    style={{ padding: 'var(--space-5)' }}>
    <section role="alert" aria-labelledby={headingId}>
      <h1 id={headingId} className="page-title">No se pudo mostrar esta vista</h1>
      <p style={{ color: 'var(--c-texto-suave)', lineHeight: 1.6 }}>
        Puedes recargar la página para volver a intentarlo o ir al inicio.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Recargar página
        </button>
        <Link to="/" className="btn btn-secondary">Ir al inicio</Link>
      </div>
    </section>
  </Container>;
}

class PageErrorBoundary extends Component {
  state = { failed: false, pathname: this.props.pathname };

  static getDerivedStateFromProps(props, state) {
    return props.pathname !== state.pathname ? { failed: false, pathname: props.pathname } : null;
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <PageLoadError standalone={this.props.standalone} /> : this.props.children;
  }
}

/**
 * Contiene la carga y los fallos de una vista, sin recrear el shell en cada cambio de ruta.
 * Cambiar pathname permite abrir otra vista; recargar reinicia también un import rechazado.
 * @param {object} props Contenido de la ruta y ubicación de la frontera.
 * @param {import('react').ReactNode} props.children Rutas o vista que pueden suspender o fallar.
 * @param {boolean} [props.standalone=false] Usa main solo cuando todavía no existe AppLayout.
 * @returns {JSX.Element} Vista, carga anunciada o error recuperable sin detalles internos.
 */
export function PageBoundary({ children, standalone = false }) {
  const { pathname } = useLocation();
  return <PageErrorBoundary pathname={pathname} standalone={standalone}>
    <Suspense fallback={<PageLoading standalone={standalone} />}>{children}</Suspense>
  </PageErrorBoundary>;
}
