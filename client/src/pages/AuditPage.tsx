import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  EmptyState,
  ErrorMessage,
  formatDateTime,
  shortId,
  Spinner,
} from '../components/ui';
import { audit } from '../utils/api';
import type { AuditLog } from '../utils/api';

const actionLabels: Record<string, string> = {
  CREATED: 'Ticket creado',
  STATUS_CHANGED: 'Estado cambiado',
  PRIORITY_CHANGED: 'Prioridad cambiada',
  ASSIGNED: 'Ticket asignado',
  COMMENT_ADDED: 'Comentario agregado',
};

/** Traduce los valores enum que el API escribe dentro del campo `details`. */
const detailLabels: Record<string, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En progreso',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

function humanizeDetails(details: string): string {
  return details.replace(
    /\b(OPEN|IN_PROGRESS|RESOLVED|CLOSED|LOW|MEDIUM|HIGH|URGENT)\b/g,
    (match) => detailLabels[match] ?? match,
  );
}

export default function AuditPage() {
  const { id = '' } = useParams<{ id: string }>();

  const [events, setEvents] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    audit
      .list(id)
      .then((data) => {
        if (active) setEvents(data);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar la auditoría');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={`/ticket/${id}`} className="serial inline-flex items-center gap-2 hover:text-accent">
        ← Volver al ticket
      </Link>

      <header className="mb-8 mt-4 border-b border-ink/15 pb-5">
        <p className="eyebrow">Trazabilidad</p>
        <h1 className="display-lg mt-2">Historial de auditoría</h1>
        <p className="serial mt-2">Expediente #{shortId(id)}</p>
      </header>

      {loading ? (
        <Spinner label="Reconstruyendo historial" />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : events.length === 0 ? (
        <EmptyState
          title="Sin eventos registrados"
          description="Todavía no se produjeron cambios en este expediente."
        />
      ) : (
        <ol className="relative border-l border-ink/20 pl-6">
          {events.map((event, index) => (
            <li
              key={event.id}
              className="reveal relative pb-6 last:pb-0"
              style={{ '--i': index } as React.CSSProperties}
            >
              <span
                className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-[1px] border border-ink bg-paper"
                aria-hidden="true"
              />
              <div className="panel px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-display text-base font-semibold tracking-tight">
                    {actionLabels[event.action] ?? event.action}
                  </h2>
                  <span className="serial">{formatDateTime(event.createdAt)}</span>
                </div>
                {event.details && (
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-700 text-pretty">
                    {humanizeDetails(event.details)}
                  </p>
                )}
                <p className="serial mt-2">
                  {event.user ? `${event.user.name} · ${event.user.email}` : 'Sistema'}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
