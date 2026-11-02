// src/App.jsx
// Enrutador principal de Pulso360 con arquitectura RBAC y Layout Maestro
import { lazy, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService, roleHomePaths } from './core/auth/authService';
import { ProtectedRoute } from './core/auth/ProtectedRoute';
import { RouteAccessibility } from './core/components/RouteAccessibility';
import { env } from './core/config/env';
import { PageBoundary } from './core/components/PageBoundary';

const AppLayout = lazy(() => import('./core/layout/AppLayout').then(module => ({ default: module.AppLayout })));

// Páginas de Autenticación (Hito 1)
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const ConsentPage = lazy(() => import('./features/auth/pages/ConsentPage').then(module => ({ default: module.ConsentPage })));
const ForgotPasswordPage = lazy(() => import('./features/auth/pages/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./features/auth/pages/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })));
const ForbiddenPage = lazy(() => import('./features/auth/pages/ForbiddenPage').then(module => ({ default: module.ForbiddenPage })));

// Páginas del Módulo Agente (Hito 3)
const AgentDashboardPage = lazy(() => import('./features/agent/pages/AgentDashboardPage').then(module => ({ default: module.AgentDashboardPage })));
const CheckinWizardPage = lazy(() => import('./features/agent/pages/CheckinWizardPage').then(module => ({ default: module.CheckinWizardPage })));
const JournalPage = lazy(() => import('./features/agent/pages/JournalPage').then(module => ({ default: module.JournalPage })));
const MyWellbeingPage = lazy(() => import('./features/agent/pages/MyWellbeingPage').then(module => ({ default: module.MyWellbeingPage })));
const SupportChannelPage = lazy(() => import('./features/agent/pages/SupportChannelPage').then(module => ({ default: module.SupportChannelPage })));
const MyDataPrivacyPage = lazy(() => import('./features/agent/pages/MyDataPrivacyPage').then(module => ({ default: module.MyDataPrivacyPage })));
const CrisisSupportPage = lazy(() => import('./features/agent/pages/CrisisSupportPage').then(module => ({ default: module.CrisisSupportPage })));

// Páginas del Módulo Supervisor (Hito 4)
const TeamDashboardPage = lazy(() => import('./features/supervisor/pages/TeamDashboardPage').then(module => ({ default: module.TeamDashboardPage })));
const ActionsPage = lazy(() => import('./features/supervisor/pages/ActionsPage').then(module => ({ default: module.ActionsPage })));

// Páginas del Módulo SST (Hito 5)
const SstDashboardPage = lazy(() => import('./features/sst/pages/SstDashboardPage').then(module => ({ default: module.SstDashboardPage })));
const AlertsInboxPage = lazy(() => import('./features/sst/pages/AlertsInboxPage').then(module => ({ default: module.AlertsInboxPage })));
const AlertRulesPage = lazy(() => import('./features/sst/pages/AlertRulesPage').then(module => ({ default: module.AlertRulesPage })));
const InterventionsPage = lazy(() => import('./features/sst/pages/InterventionsPage').then(module => ({ default: module.InterventionsPage })));
const SupportInboxPage = lazy(() => import('./features/sst/pages/SupportInboxPage').then(module => ({ default: module.SupportInboxPage })));

// Páginas del Módulo Auditor (Hito 6)
const AuditLogPage = lazy(() => import('./features/auditor/pages/AuditLogPage').then(module => ({ default: module.AuditLogPage })));

// Páginas del Módulo Administrador (Hito 6)
const OrganizationPage = lazy(() => import('./features/admin/pages/OrganizationPage').then(module => ({ default: module.OrganizationPage })));
const UsersRolesPage = lazy(() => import('./features/admin/pages/UsersRolesPage').then(module => ({ default: module.UsersRolesPage })));
const SystemParamsPage = lazy(() => import('./features/admin/pages/SystemParamsPage').then(module => ({ default: module.SystemParamsPage })));
const CsvImportPage = lazy(() => import('./features/admin/pages/CsvImportPage').then(module => ({ default: module.CsvImportPage })));
const HabeasDataPage = lazy(() => import('./features/admin/pages/HabeasDataPage').then(module => ({ default: module.HabeasDataPage })));

// Páginas Compartidas y Cierre (Hito 7)
const ReportsPage = lazy(() => import('./features/reports/pages/ReportsPage').then(module => ({ default: module.ReportsPage })));
const NotificationsPage = lazy(() => import('./features/notifications/pages/NotificationsPage').then(module => ({ default: module.NotificationsPage })));
const LandingPage = lazy(() => import('./features/landing/pages/LandingPage').then(module => ({ default: module.LandingPage })));
const ContactenosPage = lazy(() => import('./features/landing/pages/ContactenosPage').then(module => ({ default: module.ContactenosPage })));
const AcademicFoundationPage = lazy(() => import('./features/landing/pages/AcademicFoundationPage').then(module => ({ default: module.AcademicFoundationPage })));

// Componente para resolver la ruta raíz según el rol del usuario conectado
function RootRedirect() {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHomePaths[user.role] || '/login'} replace />;
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
      <RouteAccessibility />
      <PageBoundary standalone>
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
              <ProtectedRoute allowedRoles={['agente']} standalone>
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
      </PageBoundary>
    </BrowserRouter>
  );
}

export default App;
