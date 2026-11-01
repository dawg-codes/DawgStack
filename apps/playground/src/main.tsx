import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Everything at once: tokens, themes and every component's styles.
import '@dawg-codes/react-toolkit/styles.css';
import './playground.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
