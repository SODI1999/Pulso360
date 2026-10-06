// src/App.jsx
// Enrutador principal de Pulso360 con arquitectura RBAC y Layout Maestro
import { useEffect, lazy, Suspense } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService, roleHomePaths } from './core/auth/authService';
import { ProtectedRoute } from './core/auth/ProtectedRoute';
import { AppLayout } from './core/layout/AppLayout';
import { env } from './core/config/env';

// Helper para carga perezosa de componentes con exportación nombrada
const lazyPage = (factory, name) => lazy(() => factory().then(m => ({ default: m[name] })));

// Páginas de Autenticación (Hito 1)
const LoginPage = lazyPage(() => import('./features/auth/pages/LoginPage'), 'LoginPage');
const ConsentPage = lazyPage(() => import('./features/auth/pages/ConsentPage'), 'ConsentPage');
const ForgotPasswordPage = lazyPage(() => import('./features/auth/pages/ForgotPasswordPage'), 'ForgotPasswordPage');
const ResetPasswordPage = lazyPage(() => import('./features/auth/pages/ResetPasswordPage'), 'ResetPasswordPage');
const ForbiddenPage = lazyPage(() => import('./features/auth/pages/ForbiddenPage'), 'ForbiddenPage');

// Páginas del Módulo Agente (Hito 3)
const AgentDashboardPage = lazyPage(() => import('./features/agent/pages/AgentDashboardPage'), 'AgentDashboardPage');
const CheckinWizardPage = lazyPage(() => import('./features/agent/pages/CheckinWizardPage'), 'CheckinWizardPage');
const JournalPage = lazyPage(() => import('./features/agent/pages/JournalPage'), 'JournalPage');
const MyAnalysisPage = lazyPage(() => import('./features/agent/pages/MyAnalysisPage'), 'MyAnalysisPage');
const MyWellbeingPage = lazyPage(() => import('./features/agent/pages/MyWellbeingPage'), 'MyWellbeingPage');
const SupportChannelPage = lazyPage(() => import('./features/agent/pages/SupportChannelPage'), 'SupportChannelPage');
const MyDataPrivacyPage = lazyPage(() => import('./features/agent/pages/MyDataPrivacyPage'), 'MyDataPrivacyPage');
const CrisisSupportPage = lazyPage(() => import('./features/agent/pages/CrisisSupportPage'), 'CrisisSupportPage');

// Páginas del Módulo Supervisor (Hito 4)
const TeamDashboardPage = lazyPage(() => import('./features/supervisor/pages/TeamDashboardPage'), 'TeamDashboardPage');
const ActionsPage = lazyPage(() => import('./features/supervisor/pages/ActionsPage'), 'ActionsPage');

// Páginas del Módulo SST (Hito 5)
const SstDashboardPage = lazyPage(() => import('./features/sst/pages/SstDashboardPage'), 'SstDashboardPage');
const AlertsInboxPage = lazyPage(() => import('./features/sst/pages/AlertsInboxPage'), 'AlertsInboxPage');
const AlertRulesPage = lazyPage(() => import('./features/sst/pages/AlertRulesPage'), 'AlertRulesPage');
const InterventionsPage = lazyPage(() => import('./features/sst/pages/InterventionsPage'), 'InterventionsPage');
const SupportInboxPage = lazyPage(() => import('./features/sst/pages/SupportInboxPage'), 'SupportInboxPage');

// Páginas del Módulo Auditor (Hito 6)
const AuditLogPage = lazyPage(() => import('./features/auditor/pages/AuditLogPage'), 'AuditLogPage');

// Páginas del Módulo Administrador (Hito 6)
const OrganizationPage = lazyPage(() => import('./features/admin/pages/OrganizationPage'), 'OrganizationPage');
const UsersRolesPage = lazyPage(() => import('./features/admin/pages/UsersRolesPage'), 'UsersRolesPage');
const SystemParamsPage = lazyPage(() => import('./features/admin/pages/SystemParamsPage'), 'SystemParamsPage');
const CsvImportPage = lazyPage(() => import('./features/admin/pages/CsvImportPage'), 'CsvImportPage');
const HabeasDataPage = lazyPage(() => import('./features/admin/pages/HabeasDataPage'), 'HabeasDataPage');

// Páginas Compartidas y Cierre (Hito 7)
const ReportsPage = lazyPage(() => import('./features/reports/pages/ReportsPage'), 'ReportsPage');
const NotificationsPage = lazyPage(() => import('./features/notifications/pages/NotificationsPage'), 'NotificationsPage');
const LandingPage = lazyPage(() => import('./features/landing/pages/LandingPage'), 'LandingPage');
const ContactenosPage = lazyPage(() => import('./features/landing/pages/ContactenosPage'), 'ContactenosPage');
const AcademicFoundationPage = lazyPage(() => import('./features/landing/pages/AcademicFoundationPage'), 'AcademicFoundationPage');

// Componente para resolver la ruta raíz según el rol del usuario conectado
function RootRedirect() {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHomePaths[user.role] || '/login'} replace />;
}

function PageLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: '32px',
        color: 'var(--color-text-muted, #64748b)'
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '3px solid rgba(0,0,0,0.08)',
          borderTopColor: 'var(--color-primary, #0284c7)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '12px'
        }}
      />
      <span style={{ fontSize: '14px', fontWeight: 500 }}>Cargando módulo de Pulso360...</span>
    </div>
  );
}

function App() {
  useEffect(() => {
    axios
      .get(env.apiBaseUrl)
      .then(() => {
        console.log('[Pulso360]: Conexion establecida con el servidor backend.');
      })
      .catch((err) => {
        console.error('[Pulso360]: Error al conectar con el servidor backend:', err.message);
      });
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
        {/* 1. Rutas Públicas de Autenticación y Demostración */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperar-clave" element={<ForgotPasswordPage />} />
        <Route path="/nueva-clave" element={<ResetPasswordPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/contactenos" element={<ContactenosPage />} />
        <Route path="/fundamentacion" element={<AcademicFoundationPage />} />

        {/* 2. Ruta de Consentimiento (Agente) */}
        <Route
          path="/consentimiento"
          element={
            <ProtectedRoute allowedRoles={['agente']}>
              <ConsentPage />
            </ProtectedRoute>
          }
        />

        {/* 3. Rutas Autenticadas bajo AppLayout (Hito 2 y 3) */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* --- MÓDULO AGENTE (HITO 3 COMPLETO) --- */}
          <Route
            path="/agente/panel"
            element={
              <ProtectedRoute allowedRoles={['agente']}>
                <AgentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agente/checkin"
            element={
              <ProtectedRoute allowedRoles={['agente']}>
                <CheckinWizardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agente/bitacora"
            element={
              <ProtectedRoute allowedRoles={['agente']}>
                <JournalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agente/mi-analisis"
            element={
              <ProtectedRoute allowedRoles={['agente']}>
                <MyAnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agente/mi-bienestar"
            element={
              <ProtectedRoute allowedRoles={['agente']}>
                <MyWellbeingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agente/apoyo"
            element={
              <ProtectedRoute allowedRoles={['agente']}>
                <SupportChannelPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agente/mis-datos"
            element={
              <ProtectedRoute allowedRoles={['agente']}>
                <MyDataPrivacyPage />
              </ProtectedRoute>
            }
          />

          {/* --- MÓDULO SUPERVISOR (HITO 4) --- */}
          <Route
            path="/supervisor/panel"
            element={
              <ProtectedRoute allowedRoles={['supervisor']}>
                <TeamDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supervisor/acciones"
            element={
              <ProtectedRoute allowedRoles={['supervisor']}>
                <ActionsPage />
              </ProtectedRoute>
            }
          />

          {/* --- MÓDULO SST (HITO 5) --- */}
          <Route
            path="/sst/panel"
            element={
              <ProtectedRoute allowedRoles={['sst']}>
                <SstDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sst/alertas"
            element={
              <ProtectedRoute allowedRoles={['sst']}>
                <AlertsInboxPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sst/reglas-alertas"
            element={
              <ProtectedRoute allowedRoles={['sst']}>
                <AlertRulesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sst/intervenciones"
            element={
              <ProtectedRoute allowedRoles={['sst']}>
                <InterventionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sst/buzon"
            element={
              <ProtectedRoute allowedRoles={['sst']}>
                <SupportInboxPage />
              </ProtectedRoute>
            }
          />

          {/* --- MÓDULO AUDITOR (Hito 6) --- */}
          <Route path="/auditor/panel" element={<Navigate to="/auditor/auditoria" replace />} />
          <Route
            path="/auditor/auditoria"
            element={
              <ProtectedRoute allowedRoles={['auditor']}>
                <AuditLogPage />
              </ProtectedRoute>
            }
          />

          {/* --- MÓDULO ADMINISTRADOR (Hito 6) --- */}
          <Route path="/admin/panel" element={<Navigate to="/admin/organizacion" replace />} />
          <Route
            path="/admin/organizacion"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <OrganizationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios-roles"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersRolesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/parametros"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SystemParamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/importar"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CsvImportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/solicitudes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <HabeasDataPage />
              </ProtectedRoute>
            }
          />

          {/* --- RUTAS COMPARTIDAS ENTRE ROLES (Hito 7) --- */}
          <Route
            path="/reportes"
            element={
              <ProtectedRoute allowedRoles={['supervisor', 'sst', 'admin']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notificaciones"
            element={
              <ProtectedRoute allowedRoles={['agente', 'supervisor', 'sst', 'auditor', 'admin']}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apoyo-crisis"
            element={
              <ProtectedRoute allowedRoles={['agente']}>
                <CrisisSupportPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 4. Enrutamiento Raíz, Atajo a Panel y Comodín */}
        <Route path="/panel" element={<RootRedirect />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
