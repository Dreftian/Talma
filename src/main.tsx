import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initClientSecurity } from './lib/security';

// Inicializar blindaje de seguridad del cliente
initClientSecurity();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
