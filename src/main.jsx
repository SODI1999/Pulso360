import { StorageNotice } from './core/components/StorageNotice';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Tokens, estructura y estilos: este orden conserva la cascada de la aplicación.
import './styles/tokens.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/styles.css';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StorageNotice />
    <App />
  </StrictMode>
);
