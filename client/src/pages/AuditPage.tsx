import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, audit } from '../utils/api';
import type { AuditLog } from '../utils/api';

export default function AuditPage() {
  const { id: ticketId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [events, setEvents] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAudit() {
      try {
        const data = await audit.list(ticketId);
        setEvents(data);
      } catch (e: any) {
        setError(e.message);
      }
      setLoading(false);
    }
    if (ticketId) loadAudit();
    else setLoading(false);
  }, [ticketId]);

  const handleLogout = async () => {
    await auth.logout();
    window.location.assign('/login');
  };

  if (loading) return <p className="p-6">Cargando historial...</p>;
  if (!ticketId) return <p className="p-6 text-red-600">ID de ticket requerido</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(`/ticket/${ticketId}`)}
            className="text-xl font-bold text-left"
          >
            ← HelpDesk API
          </button>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Bienvenido</span>
            <button onClick={handleLogout} className="text-sm text-blue-600 hover-underline">
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">
            Historial de auditoría - Ticket #{ticketId}
          </h2>
          {error && <p className="text-red-600 mb-3">{error}</p>}
          {events.length === 0 ? (
            <p className="text-gray-500">No hay eventos de auditoría para este ticket.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="px-3 py-2 border-l-4 border-blue-500 rounded-md bg-gray-50"
                >
                  <p className="font-medium text-gray-700">{event.action}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(event.user?.name || event.userId || 'Sistema') + ' - '}
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                  {event.details && (
                    <p className="text-xs text-gray-400 mt-1">{event.details}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}