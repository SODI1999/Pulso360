// src/App.jsx
// Enrutador principal de Pulso360 con arquitectura RBAC y Layout Maestro

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService, roleHomePaths } from './core/auth/authService';
import { ProtectedRoute } from './core/auth/ProtectedRoute';
import { AppLayout } from './core/layout/AppLayout';

// Páginas de Autenticación (Hito 1)
import { LoginPage } from './features/auth/pages/LoginPage';
import { ConsentPage } from './features/auth/pages/ConsentPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage';
import { ForbiddenPage } from './features/auth/pages/ForbiddenPage';

// Páginas del Módulo Agente (Hito 3)
import { AgentDashboardPage } from './features/agent/pages/AgentDashboardPage';
import { CheckinWizardPage } from './features/agent/pages/CheckinWizardPage';
import { JournalPage } from './features/agent/pages/JournalPage';
import { MyAnalysisPage } from './features/agent/pages/MyAnalysisPage';
import { MyWellbeingPage } from './features/agent/pages/MyWellbeingPage';
import { SupportChannelPage } from './features/agent/pages/SupportChannelPage';
import { MyDataPrivacyPage } from './features/agent/pages/MyDataPrivacyPage';
import { CrisisSupportPage } from './features/agent/pages/CrisisSupportPage';

// Páginas del Módulo Supervisor (Hito 4)
import { TeamDashboardPage } from './features/supervisor/pages/TeamDashboardPage';
import { ActionsPage } from './features/supervisor/pages/ActionsPage';

// Páginas del Módulo SST (Hito 5)
import { SstDashboardPage } from './features/sst/pages/SstDashboardPage';
import { AlertsInboxPage } from './features/sst/pages/AlertsInboxPage';
import { AlertRulesPage } from './features/sst/pages/AlertRulesPage';
import { InterventionsPage } from './features/sst/pages/InterventionsPage';
import { SupportInboxPage } from './features/sst/pages/SupportInboxPage';

// Páginas del Módulo Auditor (Hito 6)
import { AuditLogPage } from './features/auditor/pages/AuditLogPage';

// Páginas del Módulo Administrador (Hito 6)
import { OrganizationPage } from './features/admin/pages/OrganizationPage';
import { UsersRolesPage } from './features/admin/pages/UsersRolesPage';
import { SystemParamsPage } from './features/admin/pages/SystemParamsPage';
import { CsvImportPage } from './features/admin/pages/CsvImportPage';
import { HabeasDataPage } from './features/admin/pages/HabeasDataPage';

// Páginas Compartidas y Cierre (Hito 7)
import { ReportsPage } from './features/reports/pages/ReportsPage';
import { NotificationsPage } from './features/notifications/pages/NotificationsPage';
import { LandingPage } from './features/landing/pages/LandingPage';
import { ContactenosPage } from './features/landing/pages/ContactenosPage';
import { AcademicFoundationPage } from './features/landing/pages/AcademicFoundationPage';


// Componente para resolver la ruta raíz según el rol del usuario conectado
function RootRedirect() {
    const user = authService.getCurrentUser();
    if (!user) return <Navigate to="/login" replace />;
    return <Navigate to={roleHomePaths[user.role] || '/login'} replace />;
}

function App() {
    return (
        <BrowserRouter>
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
                    <Route
                        path="/auditor/auditoria"
                        element={
                            <ProtectedRoute allowedRoles={['auditor']}>
                                <AuditLogPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* --- MÓDULO ADMINISTRADOR (Hito 6) --- */}
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
        </BrowserRouter>
    );
}

export default App;
