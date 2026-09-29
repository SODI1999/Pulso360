// src/features/landing/components/ScrollToTopButton.jsx
// Botón flotante accesible con transición de opacidad suave para volver al inicio

import { useState, useEffect } from 'react';
import { Icon } from '../../../core/components/Icon';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 360);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      className={`btn-scroll-top ${isVisible ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Volver al inicio de la página"
      title="Volver al inicio"
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={!isVisible}
    >
      <Icon name="arrowUp" size={18} />
    </button>
  );
}
