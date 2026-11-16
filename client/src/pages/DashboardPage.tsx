import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { tickets } from '../utils/api';
import type { Ticket, TicketFilters, TicketPriority, TicketStatus } from '../utils/api';
import {
  EmptyState,
  ErrorMessage,
  PRIORITY_OPTIONS,
  PriorityBadge,
  Spinner,
  STATUS_OPTIONS,
  StatusBadge,
} from '../components/ui';

const PAGE_SIZE = 12;

export default function DashboardPage() {
  const { user, canManage } = useAuth();

  const [status, setStatus] = useState<TicketStatus | ''>('');
  const [priority, setPriority] = useState<TicketPriority | ''>('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo<TicketFilters>(
    () => ({
      page,
      limit: PAGE_SIZE,
      status,
      priority,
      assignedToId: onlyMine ? user?.id : undefined,
    }),
    [page, status, priority, onlyMine, user?.id],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    tickets
      .list(filters)
      .then((result) => {
        if (!active) return;
        setItems(result.data);
        setMeta(result.meta);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los tickets');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters]);

  const resetFilters = () => {
    setStatus('');
    setPriority('');
    setOnlyMine(false);
    setPage(1);
  };

  const hasFilters = status !== '' || priority !== '' || onlyMine;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tickets</h1>
          <p className="text-sm text-slate-500">
            {user?.role === 'CUSTOMER'
              ? 'Tus solicitudes de soporte'
              : 'Todos los tickets del sistema'}
          </p>
        </div>
        <Link to="/tickets/new" className="btn-primary">
          + Nuevo ticket
        </Link>
      </div>

      <div className="card flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[160px]">
          <label className="label" htmlFor="filter-status">
            Estado
          </label>
          <select
            id="filter-status"
            className="input"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as TicketStatus | '');
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[160px]">
          <label className="label" htmlFor="filter-priority">
            Prioridad
          </label>
          <select
            id="filter-priority"
            className="input"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value as TicketPriority | '');
              setPage(1);
            }}
          >
            <option value="">Todas</option>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {canManage && (
          <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={onlyMine}
              onChange={(e) => {
                setOnlyMine(e.target.checked);
                setPage(1);
              }}
            />
            Solo asignados a mí
          </label>
        )}

        {hasFilters && (
          <button type="button" className="btn-secondary ml-auto" onClick={resetFilters}>
            Limpiar filtros
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Spinner label="Cargando tickets..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No hay tickets para mostrar"
          description={
            hasFilters
              ? 'Probá cambiando o limpiando los filtros.'
              : 'Cuando se cree un ticket aparecerá acá.'
          }
          action={
            hasFilters ? (
              <button type="button" className="btn-secondary" onClick={resetFilters}>
                Limpiar filtros
              </button>
            ) : (
              <Link to="/tickets/new" className="btn-primary">
                Crear el primero
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/ticket/${ticket.id}`}
                className="card flex flex-col p-5 transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h2 className="line-clamp-2 font-semibold text-slate-900">{ticket.title}</h2>
                  <PriorityBadge priority={ticket.priority} />
                </div>

                <p className="mb-4 line-clamp-3 flex-1 text-sm text-slate-500">
                  {ticket.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <StatusBadge status={ticket.status} />
                  <span className="text-xs text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {ticket.assignedTo && (
                  <p className="mt-2 text-xs text-slate-500">
                    Asignado a <span className="font-medium">{ticket.assignedTo.name}</span>
                  </p>
                )}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {meta.total} ticket{meta.total === 1 ? '' : 's'} · página {meta.page} de{' '}
              {meta.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-secondary"
                disabled={meta.page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                ← Anterior
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={meta.page >= meta.totalPages || loading}
                onClick={() => setPage((current) => current + 1)}
              >
                Siguiente →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
