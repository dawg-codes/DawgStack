import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@dawg-codes/react-toolkit/styles.css';
import { ThemeProvider } from '@dawg-codes/react-toolkit/theme';
import { App } from './App';
import { appConfig } from './app.config';
import './styles.css';
import { theme } from './theme';

document.title = appConfig.name;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
