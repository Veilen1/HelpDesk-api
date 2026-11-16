import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { RoleBadge } from './ui';

interface NavItem {
  to: string;
  label: string;
  index: string;
  end?: boolean;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Tickets', index: '01', end: true },
  { to: '/tickets/new', label: 'Nuevo ticket', index: '02' },
  { to: '/users', label: 'Usuarios', index: '03', adminOnly: true },
  { to: '/profile', label: 'Perfil', index: '04' },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] border border-ink bg-ink font-display text-sm font-bold text-paper-50">
        HD
      </span>
      <span className="leading-none">
        <span className="block font-display text-lg font-semibold tracking-tight">HelpDesk</span>
        {!compact && (
          <span className="mt-1 block font-mono text-[10px] uppercase tracking-label text-ink-400">
            mesa de ayuda
          </span>
        )}
      </span>
    </div>
  );
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'group relative flex items-center gap-3 border-l-2 py-2.5 pl-4 pr-3 transition-colors duration-150',
    isActive
      ? 'border-accent bg-paper-100 text-ink'
      : 'border-transparent text-ink-500 hover:border-ink/20 hover:bg-paper-100/60 hover:text-ink',
  ].join(' ');

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15.5rem_1fr] lg:bg-[linear-gradient(90deg,rgba(250,247,240,0.62)_0_15.49rem,rgba(22,19,15,0.15)_15.49rem_15.5rem,transparent_15.5rem)]">
      {/* ---------------- Rail lateral (desktop) ---------------- */}
      <aside className="hidden bg-paper-50/60 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r lg:border-ink/15">
        <div className="border-b border-ink/15 px-5 py-6">
          <Brand />
        </div>

        <nav aria-label="Navegación principal" className="flex-1 py-4">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
              <span className="font-mono text-[10px] tracking-stamp text-ink-300 group-hover:text-accent">
                {item.index}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}

          <div className="mt-6 border-t border-ink/10 px-5 pt-5">
            <p className="eyebrow">Flujo</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-500">
              Registro → asignación → comentarios → resolución. Cada paso queda auditado.
            </p>
          </div>
        </nav>

        <div className="border-t border-ink/15 px-5 py-5">
          {user && (
            <>
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="mt-0.5 truncate font-mono text-[10px] text-ink-400">{user.email}</p>
              <div className="mt-2">
                <RoleBadge role={user.role} />
              </div>
            </>
          )}
          <button type="button" onClick={handleLogout} className="btn-ghost btn-sm mt-4 w-full justify-between">
            Cerrar sesión <span aria-hidden="true">→</span>
          </button>
        </div>
      </aside>

      {/* ---------------- Cabecera (mobile) ---------------- */}
      <div className="lg:hidden">
        <header className="sticky top-0 z-30 border-b border-ink/15 bg-paper/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3">
            <Brand compact />
            <div className="flex items-center gap-2">
              {user && <RoleBadge role={user.role} />}
              <button type="button" onClick={handleLogout} className="btn-secondary btn-sm">
                Salir
              </button>
            </div>
          </div>
          <nav aria-label="Navegación principal" className="flex overflow-x-auto border-t border-ink/10">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'shrink-0 border-b-2 px-4 py-2.5 font-mono text-[10px] uppercase tracking-label transition-colors',
                    isActive
                      ? 'border-accent text-ink'
                      : 'border-transparent text-ink-500 hover:text-ink',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
      </div>

      {/* ---------------- Contenido ---------------- */}
      <div className="min-w-0">
        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <Outlet />
        </main>
        <footer className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6 lg:px-10">
          <div className="rule" />
          <p className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-label text-ink-300">
            <span>HelpDesk · mesa de ayuda</span>
            <span>NestJS · React · Prisma</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
