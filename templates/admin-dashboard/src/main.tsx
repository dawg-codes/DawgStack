import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@dawg-codes/react-toolkit/styles.css';
import { ToastProvider } from '@dawg-codes/react-toolkit/toast';
import { App } from './App';
import { AppearanceProvider } from './appearance';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppearanceProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AppearanceProvider>
  </StrictMode>,
);
