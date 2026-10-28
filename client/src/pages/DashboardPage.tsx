import { useEffect, useState } from 'react';
import { auth, tickets } from '../utils/api';

export default function DashboardPage() {
  const [ticketList, setTicketList] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTickets() {
      try {
        const data = await ticketService.list(1, 20);
        setTicketList(data.items);
      } catch (e: any) {
        setError(e.message);
      }
      setLoading(false);
    }
    loadTickets();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">HelpDesk API</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Bienvenido, {JSON.parse(localStorage.getItem('user') || '{}').name || 'Usuario'}
            </span>
            <button onClick={() => auth.logout()} className="text-sm text-blue-600 hover-underline">
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
          <button
            onClick={() => window.location.hash = '/ticket/nuevo'}
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Crear ticket
          </button>
        </div>

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
                  <span className={`text-${ticket.status === 'OPEN' ? 'green' : ticket.status === 'RESOLVED' ? 'yellow' : 'red'}-600 font-medium`}>
                    {ticket.status}
                  </span>
                </span>
                <span className="mr-2">P: {ticket.priority}</span>
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => window.location.hash = `/ticket/${ticket.id}`}
                  className="text-xs text-blue-600 hover-underline"
                >
                  Ver detalles
                </button>
                {ticket.agentId && (
                  <button
                    onClick={() => window.location.hash = `/ticket/assign/${ticket.id}`}
                    className="text-xs text-orange-600 hover-underline"
                  >
                    Reasignar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}