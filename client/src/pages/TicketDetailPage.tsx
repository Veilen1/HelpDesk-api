import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, tickets, comments, users } from '../utils/api';
import type { Ticket, Comment, User } from '../utils/api';

export default function TicketDetailPage() {
  const { id: ticketId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [commentsList, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignMode, setAssignMode] = useState(false);
  const [agentOptions, setAgentOptions] = useState<User[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [user] = useState<User | Record<string, never>>(() =>
    JSON.parse(localStorage.getItem('user') || '{}'),
  );

  useEffect(() => {
    async function loadData() {
      try {
        const [t, c] = await Promise.all([
          tickets.get(ticketId),
          comments.list(ticketId),
        ]);
        setTicket(t);
        setComments(c);
      } catch (e: any) {
        setError(e.message);
      }
      setLoading(false);
    }
    if (ticketId) loadData();
    else setLoading(false);
  }, [ticketId]);

  useEffect(() => {
    async function loadAgents() {
      try {
        const all = await users.list();
        setAgentOptions(all.filter((u) => u.role === 'AGENT'));
      } catch (e) {
        console.error('Error cargando agentes:', e);
      }
    }
    if ((user as User).role === 'ADMIN') loadAgents();
  }, [user]);

  const handleLogout = async () => {
    await auth.logout();
    window.location.assign('/login');
  };

  if (loading) return <p className="p-6">Cargando ticket...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;
  if (!ticket) return <p className="p-6">Ticket no encontrado</p>;

  const role = (user as User).role;
  const canManage = role === 'ADMIN' || role === 'AGENT';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-xl font-bold text-left"
          >
            ← HelpDesk API
          </button>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Bienvenido, {(user as User).name || 'Usuario'}
            </span>
            <button onClick={handleLogout} className="text-sm text-blue-600 hover-underline">
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-3">{ticket.title}</h2>
          <p className="text-gray-500 mb-4 line-clamp-3">{ticket.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Estado:</span>{' '}
              <span
                className={
                  ticket.status === 'OPEN'
                    ? 'text-green-600'
                    : ticket.status === 'RESOLVED'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }
              >
                {ticket.status}
              </span>
            </div>
            <div>
              <span className="font-medium">Prioridad:</span>{' '}
              <span className="text-blue-600 font-medium">{ticket.priority}</span>
            </div>
            <div>
              <span className="font-medium">Creado:</span>{' '}
              <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
            {ticket.assignedToId && (
              <div>
                <span className="font-medium">Asignado a:</span>{' '}
                <span className="text-orange-600">{ticket.assignedToId}</span>
              </div>
            )}
          </div>
        </div>

        {canManage &&
          (assignMode ? (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Reasignar a agente</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">-- Seleccionar agente --</option>
                {agentOptions.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.email}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (!selectedAgent) return;
                  tickets
                    .assign(ticketId, selectedAgent)
                    .then(() => {
                      window.alert('Ticket asignado');
                      setAssignMode(false);
                    })
                    .catch((e: any) => alert(e.message));
                }}
                className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 transition-colors"
              >
                Asignar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAssignMode(true)}
              className="mb-4 inline-block px-4 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 transition-colors"
            >
              Reasignar ticket
            </button>
          ))}

        <div>
          <h3 className="text-xl font-bold mb-3">Comentarios ({commentsList.length})</h3>
          {commentsList.length > 0 && (
            <div className="space-y-2">
              {commentsList.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-md p-3 mb-3">
                  <p className="font-medium">
                    {comment.author?.name || comment.authorId}: {comment.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
          {canManage || ticket.creatorId === (user as User).id ? (
            <div className="mt-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Añadir un comentario..."
                rows={2}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 resize-none"
                maxLength={1000}
              />
              <button
                onClick={() => {
                  if (newComment.trim()) {
                    comments
                      .create(ticketId, newComment)
                      .then((created) => {
                        setNewComment('');
                        setComments((prev) => [...prev, created]);
                      })
                      .catch((e: any) => alert(e.message));
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={!newComment.trim()}
              >
                Enviar
              </button>
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="text-xl font-bold mt-6">Historial de auditoría</h3>
          <button
            onClick={() => navigate(`/audit/${ticketId}`)}
            className="mb-3 inline-block px-4 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors"
          >
            Ver auditoría
          </button>
        </div>
      </main>
    </div>
  );
}