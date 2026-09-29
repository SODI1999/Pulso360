import { useState } from 'react';

import { authService } from '../../../core/auth/authService';
export function usePasswordRecovery() {
  const [recoveryEmail, setRecoveryEmail] = useState('');

  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const [recoveryFeedback, setRecoveryFeedback] = useState({ type: '', message: '' });

  const [dispatchedData, setDispatchedData] = useState(null);

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    if (!recoveryEmail.trim() || recoveryLoading) return;

    setRecoveryLoading(true);
    setRecoveryFeedback({ type: '', message: '' });

    try {
      const res = await authService.requestPasswordReset(recoveryEmail);
      setRecoveryLoading(false);

      if (res.success) {
        setDispatchedData(res);
      } else {
        setRecoveryFeedback({ type: 'error', message: res.message });
      }
    } catch (err) {
      console.error('Recovery request error:', err);
      setRecoveryLoading(false);
      setRecoveryFeedback({ type: 'error', message: 'Error inesperado al solicitar recuperación.' });
    }
  };
  return {
    recoveryEmail,
    setRecoveryEmail,
    recoveryLoading,
    recoveryFeedback,
    dispatchedData,
    setDispatchedData,
    handleRecoverySubmit
  };
}
