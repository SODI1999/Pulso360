import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

//Al migrar los estilos de la maqueta debemos importat los estilos traidos desde el archivo style.css
import './styles/tokens.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
