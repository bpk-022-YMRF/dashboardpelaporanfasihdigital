import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handler for debugging production issues
window.onerror = function(message, source, lineno, colno, error) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; color: red; font-family: sans-serif;">
        <h2>Runtime Error</h2>
        <p>${message}</p>
        <pre style="background: #eee; padding: 10px;">${error?.stack || ''}</pre>
      </div>
    `;
  }
  return false;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
