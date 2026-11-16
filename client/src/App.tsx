import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ToastProvider } from './components/ToastProvider';
import Layout from './components/Layout';
import { Spinner } from './components/ui';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TicketCreatePage from './pages/TicketCreatePage';
import TicketDetailPage from './pages/TicketDetailPage';
import AuditPage from './pages/AuditPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

/**
 * Contenedor de rutas privadas. Mientras se valida el token guardado
 * muestra un spinner; si no hay sesión redirige al login conservando
 * la ruta de origen para volver después de autenticarse.
 */
function BootScreen({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-ink bg-ink font-display text-sm font-bold text-paper-50">
            HD
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">HelpDesk</span>
        </div>
        <Spinner label={label} />
      </div>
    </div>
  );
}

function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <BootScreen label="Verificando sesión" />;
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

/** Restringe una ruta a ciertos roles; el resto vuelve al listado. */
function RequireRole({ roles }: { roles: Array<'AGENT' | 'ADMIN'> }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role as 'AGENT' | 'ADMIN')) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

/** Evita que un usuario ya autenticado vea login/registro. */
function PublicOnly() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <BootScreen label="Verificando sesión" />;
  }

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/tickets/new" element={<TicketCreatePage />} />
          <Route path="/ticket/:id" element={<TicketDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<RequireRole roles={['AGENT', 'ADMIN']} />}>
            <Route path="/audit/:id" element={<AuditPage />} />
          </Route>

          <Route element={<RequireRole roles={['ADMIN']} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
