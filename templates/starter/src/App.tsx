import { AppHeader } from './components/AppHeader';
import { Dashboard } from './pages/Dashboard';

export function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <AppHeader />
      <Dashboard />
      <footer className="container app-footer">
        Built with <a href="https://github.com/dawg-codes/DawgStack">DawgStack</a>
      </footer>
    </>
  );
}
