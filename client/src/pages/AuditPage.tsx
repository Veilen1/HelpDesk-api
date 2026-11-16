import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState, ErrorMessage, Spinner } from '../components/ui';
import { audit } from '../utils/api';
import type { AuditLog } from '../utils/api';

const actionLabels: Record<string, string> = {
  CREATED: 'Ticket creado',
  STATUS_CHANGED: 'Estado cambiado',
  PRIORITY_CHANGED: 'Prioridad cambiada',
  ASSIGNED: 'Ticket asignado',
  COMMENT_ADDED: 'Comentario agregado',
};

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
    <div className="space-y-6">
      <div>
        <Link to={`/ticket/${id}`} className="text-sm text-blue-600 hover:underline">
          ← Volver al ticket
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Historial de auditoría</h1>
        <p className="text-sm text-slate-500">Ticket #{id}</p>
      </div>

      {loading ? (
        <Spinner label="Cargando historial..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : events.length === 0 ? (
        <EmptyState
          title="Sin eventos registrados"
          description="Todavía no se registraron cambios en este ticket."
        />
      ) : (
        <ol className="space-y-3">
          {events.map((event) => (
            <li key={event.id} className="card border-l-4 border-l-blue-500 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-slate-800">
                  {actionLabels[event.action] ?? event.action}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(event.createdAt).toLocaleString()}
                </span>
              </div>
              {event.details && <p className="mt-1 text-sm text-slate-600">{event.details}</p>}
              <p className="mt-1 text-xs text-slate-500">
                {event.user ? `${event.user.name} (${event.user.email})` : 'Sistema'}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
