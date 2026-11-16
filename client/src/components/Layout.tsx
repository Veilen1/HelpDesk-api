import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { RoleBadge } from './ui';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-50 text-blue-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              HD
            </span>
            <span className="text-lg font-semibold text-slate-900">HelpDesk</span>
          </div>

          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Tickets
            </NavLink>
            <NavLink to="/tickets/new" className={navLinkClass}>
              Nuevo ticket
            </NavLink>
            {isAdmin && (
              <NavLink to="/users" className={navLinkClass}>
                Usuarios
              </NavLink>
            )}
            <NavLink to="/profile" className={navLinkClass}>
              Perfil
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-slate-600 sm:inline">
                  {user.name}
                </span>
                <RoleBadge role={user.role} />
              </div>
            )}
            <button onClick={handleLogout} className="btn-secondary">
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}