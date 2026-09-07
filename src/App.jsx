// src/App.jsx
// Enrutador principal de Pulso360 con arquitectura RBAC y Layout Maestro

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService, roleHomePaths } from './core/auth/authService';
import { ProtectedRoute } from './core/auth/ProtectedRoute';
import { AppLayout } from './core/layout/AppLayout';
import { PlaceholderView } from './core/components/PlaceholderView';

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
                {/* 1. Rutas Públicas de Autenticación */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/recuperar-clave" element={<ForgotPasswordPage />} />
                <Route path="/nueva-clave" element={<ResetPasswordPage />} />
                <Route path="/403" element={<ForbiddenPage />} />

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

                    {/* --- MÓDULO AUDITOR --- */}
                    <Route
                        path="/auditor/auditoria"
                        element={
                            <ProtectedRoute allowedRoles={['auditor']}>
                                <PlaceholderView title="Registro de Auditoría" subtitle="Trazabilidad inmutable con verificación de hash chain" icon="policy" milestone="Hito 6" />
                            </ProtectedRoute>
                        }
                    />

                    {/* --- MÓDULO ADMINISTRADOR --- */}
                    <Route
                        path="/admin/organizacion"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <PlaceholderView title="Estructura Organizacional" subtitle="Gestión de sedes, campañas y equipos" icon="domain" milestone="Hito 6" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/usuarios-roles"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <PlaceholderView title="Usuarios y Roles" subtitle="Control de accesos y estados de cuenta" icon="manage_accounts" milestone="Hito 6" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/parametros"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <PlaceholderView title="Parámetros del Sistema" subtitle="Versiones de póliza y variables globales" icon="tune" milestone="Hito 6" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/importar"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <PlaceholderView title="Importación CSV" subtitle="Carga masiva de datos organizacionales" icon="upload_file" milestone="Hito 6" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/solicitudes"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <PlaceholderView title="Habeas Data" subtitle="Atención de derechos de cancelación y oposición" icon="shield" milestone="Hito 6" />
                            </ProtectedRoute>
                        }
                    />

                    {/* --- RUTAS COMPARTIDAS ENTRE ROLES --- */}
                    <Route
                        path="/reportes"
                        element={
                            <ProtectedRoute allowedRoles={['supervisor', 'sst', 'admin']}>
                                <PlaceholderView title="Centro de Reportes" subtitle="Exportación de métricas consolidadas en PDF, CSV y JSON" icon="summarize" milestone="Hito 7" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/notificaciones"
                        element={
                            <ProtectedRoute allowedRoles={['agente', 'supervisor', 'sst', 'auditor', 'admin']}>
                                <PlaceholderView title="Centro de Notificaciones" subtitle="Avisos del sistema y confirmaciones operativas" icon="notifications" milestone="Hito 7" />
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

                {/* 4. Enrutamiento Raíz y Comodín */}
                <Route path="/" element={<RootRedirect />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
