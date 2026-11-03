import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider, type AccentPresetName } from '@dawg-codes/react-toolkit/theme';
import { buildTheme, defaultAccent } from './theme';

/**
 * The accent colour chosen in Settings → Appearance, remembered in this browser. (Light, dark
 * or system mode is remembered by ThemeProvider itself.)
 */
const ACCENTS: AccentPresetName[] = ['indigo', 'teal', 'pink', 'graphite'];
const STORAGE_KEY = 'admin-accent';

interface Appearance {
  accent: AccentPresetName;
  setAccent: (accent: AccentPresetName) => void;
}
const AppearanceContext = createContext<Appearance | null>(null);

function readStored(): AccentPresetName {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as AccentPresetName | null;
    return saved && ACCENTS.includes(saved) ? saved : defaultAccent;
  } catch {
    return defaultAccent; // storage can be blocked
  }
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState(readStored);
  const value = useMemo<Appearance>(
    () => ({
      accent,
      setAccent: (next) => {
        setAccentState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // Storage unavailable: the choice lasts for this visit.
        }
      },
    }),
    [accent],
  );
  const theme = useMemo(() => buildTheme(accent), [accent]);
  return (
    <AppearanceContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const appearance = useContext(AppearanceContext);
  if (!appearance) throw new Error('useAppearance must be used inside <AppearanceProvider>.');
  return appearance;
}

export const accentOptions = ACCENTS;
