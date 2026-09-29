import { useState, useEffect } from 'react';

import { authService, validatePasswordStrength } from '../../../core/auth/authService';
export function usePasswordReset(mode, tokenParam, onResetComplete) {
  const [tokenState, setTokenState] = useState({ loading: true, valid: false, email: '', message: '' });

  const [newPassword, setNewPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resetLoading, setResetLoading] = useState(false);

  const [resetFeedback, setResetFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (mode !== 'reset') return;
    let isMounted = true;
    authService.validateResetToken(tokenParam).then((res) => {
      if (!isMounted) return;
      if (res.valid) {
        setTokenState({ loading: false, valid: true, email: res.email || '', message: '' });
      } else {
        setTokenState({ loading: false, valid: false, email: '', message: res.message });
      }
    });
    return () => {
      isMounted = false;
    };
  }, [mode, tokenParam]);

  const hasLength = newPassword.length >= 8;

  const hasCases = /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword);

  const hasNumbers = /[0-9]/.test(newPassword);

  const passwordsMatch = Boolean(newPassword && confirmPassword && newPassword === confirmPassword);

  const passwordPolicy = validatePasswordStrength(newPassword);

  const checkPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(score, 4);
  };

  const strengthScore = checkPasswordStrength(newPassword);

  const strengthLabels = ['Débil', 'Aceptable', 'Buena', 'Fuerte'];

  const strengthClass = ['weak', 'weak', 'medium', 'strong'][Math.max(0, strengthScore - 1)] || 'weak';

  const strengthLabel = newPassword ? strengthLabels[Math.max(0, strengthScore - 1)] : '-';

  const isResetValid = tokenState.valid && passwordPolicy.valid && passwordsMatch && !resetLoading;

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!isResetValid) return;

    setResetLoading(true);
    setResetFeedback({ type: '', message: '' });

    try {
      const result = await authService.resetPassword(tokenParam, newPassword);
      setResetLoading(false);

      if (result.success) {
        setResetFeedback({
          type: 'success',
          message: 'Contraseña actualizada con éxito. Redirigiendo al inicio de sesión...'
        });
        setTimeout(() => {
          onResetComplete(newPassword);
          setResetFeedback({ type: '', message: '' });
        }, 1200);
      } else {
        setResetFeedback({ type: 'error', message: result.message });
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setResetLoading(false);
      setResetFeedback({ type: 'error', message: 'Ocurrió un error inesperado al guardar la contraseña.' });
    }
  };
  return {
    tokenState,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    resetLoading,
    resetFeedback,
    hasLength,
    hasCases,
    hasNumbers,
    passwordsMatch,
    strengthScore,
    strengthClass,
    strengthLabel,
    isResetValid,
    handleResetSubmit
  };
}
