// src/App.jsx
// Enrutador principal de la aplicación con rutas de autenticación

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/pages/LoginPage';
import { ConsentPage } from './features/auth/pages/ConsentPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas de Autenticación y Recuperación */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/consentimiento" element={<ConsentPage />} />
        <Route path="/recuperar-clave" element={<ForgotPasswordPage />} />
        <Route path="/nueva-clave" element={<ResetPasswordPage />} />

        {/* Ruta por defecto mientras configuramos el resto de módulos */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
