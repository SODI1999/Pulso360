// src/features/auth/pages/ResetPasswordPage.jsx
// Fachada institucional para la ruta /nueva-clave montada sobre la experiencia Split-Screen

import { LoginPage } from './LoginPage';

export function ResetPasswordPage() {
  return <LoginPage initialMode="reset" />;
}
