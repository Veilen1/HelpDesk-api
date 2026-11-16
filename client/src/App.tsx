import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TicketDetailPage from './pages/TicketDetailPage';
import AuditPage from './pages/AuditPage';
import { useEffect, useState } from 'react';
import { auth } from './utils/api';

type AuthState = 'loading' | 'authenticated' | 'anonymous';

function App() {
  const [authState, setAuthState] = useState<AuthState>('loading');

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthState('anonymous');
      return;
    }
    auth
      .me()
      .then(() => setAuthState('authenticated'))
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState('anonymous');
      });
  }, []);

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Cargando...
      </div>
    );
  }

  const isAuthenticated = authState === 'authenticated';

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route path="/ticket/:id" element={<TicketDetailPage />} />
        <Route path="/audit/:id" element={<AuditPage />} />
        {/* Ruta comodín: cualquier URL desconocida vuelve al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;