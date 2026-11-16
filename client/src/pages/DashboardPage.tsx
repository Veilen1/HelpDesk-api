import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  EmptyState,
  ErrorMessage,
  formatDate,
  PRIORITY_OPTIONS,
  PriorityBadge,
  shortId,
  Spinner,
  STATUS_OPTIONS,
  StatusBadge,
} from '../components/ui';
import { tickets } from '../utils/api';
import type { Ticket, TicketFilters, TicketPriority, TicketStatus } from '../utils/api';

const PAGE_SIZE = 12;

const roleEyebrow = {
  CUSTOMER: 'Mesa de ayuda · mis tickets',
  AGENT: 'Mesa de ayuda · bandeja de agentes',
  ADMIN: 'Mesa de ayuda · administración',
} as const;

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
    <div>
      <header className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/15 pb-5">
          <div>
            <p className="eyebrow">
              {user ? roleEyebrow[user.role] : roleEyebrow.CUSTOMER}
            </p>
            <h1 className="display-xl mt-2">Tickets</h1>
          </div>
          <Link to="/tickets/new" className="btn-primary">
            + Nuevo ticket
          </Link>
        </div>
      </header>

      {/* Barra de filtros */}
      <section className="panel mb-6 p-4" aria-label="Filtros de tickets">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[10rem] flex-1 sm:flex-none">
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

          <div className="min-w-[10rem] flex-1 sm:flex-none">
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
            <label className="flex cursor-pointer items-center gap-2 py-2.5 text-sm text-ink-700">
              <input
                type="checkbox"
                className="h-4 w-4 cursor-pointer appearance-none rounded-[1px] border border-ink/40 bg-paper-50 checked:border-ink checked:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                checked={onlyMine}
                onChange={(e) => {
                  setOnlyMine(e.target.checked);
                  setPage(1);
                }}
              />
              Solo asignados a mí
            </label>
          )}

          <div className="ml-auto flex items-center gap-3">
            {hasFilters && (
              <button type="button" className="btn-ghost btn-sm" onClick={resetFilters}>
                Limpiar
              </button>
            )}
            <span className="serial hidden sm:inline">
              {meta.total} registro{meta.total === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading ? (
        <Spinner label="Leyendo expedientes" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No hay tickets en esta vista"
          description={
            hasFilters
              ? 'Ajustá los filtros o limpiá la selección para ver todo el registro.'
              : 'Cuando se abra el primer ticket, va a aparecer acá con su número de expediente.'
          }
          action={
            hasFilters ? (
              <button type="button" className="btn-secondary" onClick={resetFilters}>
                Limpiar filtros
              </button>
            ) : (
              <Link to="/tickets/new" className="btn-primary">
                Abrir el primero
              </Link>
            )
          }
        />
      ) : (
        <section className="panel overflow-hidden" aria-label="Listado de tickets">
          <div className="hidden border-b border-ink/15 bg-paper-100/60 px-4 py-2.5 sm:flex sm:items-center sm:justify-between">
            <span className="eyebrow">Expediente / asunto</span>
            <span className="eyebrow">Estado · prioridad · fecha</span>
          </div>

          {items.map((ticket, index) => (
            <Link
              key={ticket.id}
              to={`/ticket/${ticket.id}`}
              className="ledger-row reveal group"
              style={{ '--i': index } as React.CSSProperties}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="serial">#{shortId(ticket.id)}</span>
                    <span className="h-2.5 w-px bg-ink/15" aria-hidden="true" />
                    <span className="serial">
                      {ticket.creator?.name ?? 'sin autor'}
                    </span>
                  </div>

                  <h2 className="mt-1.5 line-clamp-2 font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-accent sm:line-clamp-none sm:truncate">
                    {ticket.title}
                  </h2>

                  <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-ink-500 text-pretty">
                    {ticket.description}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="serial">{formatDate(ticket.createdAt)}</span>
                    {ticket.assignedTo ? (
                      <span className="serial">
                        → {ticket.assignedTo.name}
                      </span>
                    ) : (
                      <span className="serial text-ink-300">→ sin asignar</span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  <span
                    className="mt-1 font-mono text-sm text-ink-300 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-accent"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/15 bg-paper-100/40 px-4 py-3">
            <p className="serial">
              Página {meta.page} de {meta.totalPages} · {meta.total} ticket
              {meta.total === 1 ? '' : 's'} en total
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-secondary btn-sm"
                disabled={meta.page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                ← Anterior
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm"
                disabled={meta.page >= meta.totalPages || loading}
                onClick={() => setPage((current) => current + 1)}
              >
                Siguiente →
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
