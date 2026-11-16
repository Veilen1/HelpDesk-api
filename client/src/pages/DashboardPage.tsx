import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, tickets } from '../utils/api';
import type { Ticket } from '../utils/api';

export default function DashboardPage() {
  const [ticketList, setTicketList] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTickets() {
      try {
        const { data } = await tickets.list(1, 20);
        setTicketList(data);
      } catch (e: any) {
        setError(e.message);
      }
      setLoading(false);
    }
    loadTickets();
  }, []);

  const handleLogout = async () => {
    await auth.logout();
    window.location.assign('/login');
  };

  if (loading) return <p className="p-6">Cargando...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">HelpDesk API</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Bienvenido, {JSON.parse(localStorage.getItem('user') || '{}').name || 'Usuario'}
            </span>
            <button onClick={handleLogout} className="text-sm text-blue-600 hover-underline">
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Tickets</h2>
          <div className="flex gap-2 mb-4">
            <select
              onChange={(e) => console.log('Filtrar por:', e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Todos</option>
              <option value="OPEN">Abiertos</option>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="RESOLVED">Resueltos</option>
              <option value="CLOSED">Cerrados</option>
            </select>
            <select
              onChange={(e) => console.log('Filtrar por prioridad:', e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Todas</option>
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>
        </div>

        {ticketList.length === 0 ? (
          <p className="text-gray-500">No hay tickets para mostrar.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ticketList.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-lg shadow p-5 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-lg font-medium mb-2">{ticket.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{ticket.description}</p>
                <div className="mt-3 text-sm">
                  <span className="mr-2">
                    <span
                      className={`font-medium ${
                        ticket.status === 'OPEN'
                          ? 'text-green-600'
                          : ticket.status === 'RESOLVED'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </span>
                  <span className="mr-2">P: {ticket.priority}</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => navigate(`/ticket/${ticket.id}`)}
                    className="text-xs text-blue-600 hover-underline"
                  >
                    Ver detalles
                  </button>
                  {ticket.assignedToId && (
                    <button
                      onClick={() => navigate(`/ticket/${ticket.id}`)}
                      className="text-xs text-orange-600 hover-underline"
                    >
                      Reasignar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}