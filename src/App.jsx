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

                {/* 3. Rutas Autenticadas bajo AppLayout (Hito 2) */}
                <Route
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* --- MÓDULO AGENTE --- */}
                    <Route
                        path="/agente/panel"
                        element={
                            <ProtectedRoute allowedRoles={['agente']}>
                                <PlaceholderView title="Mi Panel" subtitle="Resumen de bienestar individual y atajos operativos" icon="dashboard" milestone="Hito 3" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/agente/checkin"
                        element={
                            <ProtectedRoute allowedRoles={['agente']}>
                                <PlaceholderView title="Check-in Diario" subtitle="Registro de estado anímico y factores de jornada" icon="favorite" milestone="Hito 3" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/agente/bitacora"
                        element={
                            <ProtectedRoute allowedRoles={['agente']}>
                                <PlaceholderView title="Bitácora Personal & NLP" subtitle="Reflexión privada con procesamiento de lenguaje natural" icon="edit_note" milestone="Hito 3" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/agente/mi-analisis"
                        element={
                            <ProtectedRoute allowedRoles={['agente']}>
                                <PlaceholderView title="Mi Análisis" subtitle="Tendencias de factores detectados por el motor léxico" icon="insights" milestone="Hito 3" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/agente/mi-bienestar"
                        element={
                            <ProtectedRoute allowedRoles={['agente']}>
                                <PlaceholderView title="Mi Bienestar" subtitle="Evolución histórica y comparativas personales" icon="monitoring" milestone="Hito 3" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/agente/apoyo"
                        element={
                            <ProtectedRoute allowedRoles={['agente']}>
                                <PlaceholderView title="Acompañamiento" subtitle="Solicitudes confidenciales de apoyo psicosocial" icon="support_agent" milestone="Hito 3" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/agente/mis-datos"
                        element={
                            <ProtectedRoute allowedRoles={['agente']}>
                                <PlaceholderView title="Mis Datos & Privacidad" subtitle="Gestión de consentimientos y solicitudes Habeas Data" icon="shield" milestone="Hito 3" />
                            </ProtectedRoute>
                        }
                    />

                    {/* --- MÓDULO SUPERVISOR --- */}
                    <Route
                        path="/supervisor/panel"
                        element={
                            <ProtectedRoute allowedRoles={['supervisor']}>
                                <PlaceholderView title="Panel de Equipo" subtitle="Indicadores agregados con regla de k-anonimato (N >= 5)" icon="group" milestone="Hito 4" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/supervisor/acciones"
                        element={
                            <ProtectedRoute allowedRoles={['supervisor']}>
                                <PlaceholderView title="Intervenciones" subtitle="Registro de acciones de apoyo y seguimiento operativo" icon="task_alt" milestone="Hito 4" />
                            </ProtectedRoute>
                        }
                    />

                    {/* --- MÓDULO SST --- */}
                    <Route
                        path="/sst/panel"
                        element={
                            <ProtectedRoute allowedRoles={['sst']}>
                                <PlaceholderView title="Panel Agregado SST" subtitle="Vigilancia epidemiológica y mapa de calor organizacional" icon="analytics" milestone="Hito 5" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/sst/alertas"
                        element={
                            <ProtectedRoute allowedRoles={['sst']}>
                                <PlaceholderView title="Bandeja de Alertas" subtitle="Alertas tempranas de riesgo de agotamiento" icon="notifications_active" milestone="Hito 5" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/sst/reglas-alertas"
                        element={
                            <ProtectedRoute allowedRoles={['sst']}>
                                <PlaceholderView title="Reglas de Alertas" subtitle="Parametrización de umbrales preventivos" icon="tune" milestone="Hito 5" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/sst/intervenciones"
                        element={
                            <ProtectedRoute allowedRoles={['sst']}>
                                <PlaceholderView title="Intervenciones Colectivas" subtitle="Planes de mitigación y seguimiento organizacional" icon="healing" milestone="Hito 5" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/sst/buzon"
                        element={
                            <ProtectedRoute allowedRoles={['sst']}>
                                <PlaceholderView title="Buzón de Acompañamiento" subtitle="Gestión confidencial de solicitudes de agentes" icon="mark_email_unread" milestone="Hito 5" />
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
                                <PlaceholderView title="Recursos de Apoyo en Crisis" subtitle="Líneas de atención psicológica 24/7 y asistencia inmediata" icon="support" milestone="Hito 7" />
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
