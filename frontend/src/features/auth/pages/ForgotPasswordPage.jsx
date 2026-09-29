// src/features/auth/pages/ForgotPasswordPage.jsx
// Fachada institucional para la ruta /recuperar-clave montada sobre la experiencia Split-Screen

import { LoginPage } from './LoginPage';

export function ForgotPasswordPage() {
  return <LoginPage initialMode="forgot" />;
}
