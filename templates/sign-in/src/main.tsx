import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@dawg-codes/react-toolkit/styles.css';
import { ThemeProvider } from '@dawg-codes/react-toolkit/theme';
import { App } from './App';
import { SessionProvider } from './auth/session';
import './styles.css';
import { theme } from './theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <SessionProvider>
        <App />
      </SessionProvider>
    </ThemeProvider>
  </StrictMode>,
);
