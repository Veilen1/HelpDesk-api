import { useEffect, useState } from 'react';
import { audit } from '../utils/api';

interface AuditPageProps {
  ticketId: string;
}

export default function AuditPage() {
  const params = new URLSearchParams(window.location.hash);
  const ticketId = params.get('id') || '';

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAudit() {
      try {
        const data = await audit.list(ticketId);
        setEvents(data);
      } catch (e: any) {
        console.error('Error cargando auditoría:', e);
      }
      setLoading(false);
    }
    loadAudit();
  }, [ticketId]);

  if (loading) return <p>Cargando historial...</p>;
  if (!ticketId) return <p className="text-red-600">ID de ticket requerido</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">HelpDesk API</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Bienvenido
            </span>
            <button onClick={() => auth.logout()} className="text-sm text-blue-600 hover-underline">
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Historial de auditoría - Ticket #{ticketId}</h2>
          {events.length === 0 ? (
            <p className="text-gray-500">No hay eventos de auditoría para este ticket.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="px-3 py-2 border-l-4 border-blue-500 rounded-md bg-gray-50">
                  <p className="font-medium text-gray-700">{event.type}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {event.changedBy} - {new Date(event.timestamp).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{event.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}