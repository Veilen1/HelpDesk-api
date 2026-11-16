import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../components/ToastProvider';
import {
  EmptyState,
  ErrorMessage,
  PRIORITY_OPTIONS,
  PriorityBadge,
  Spinner,
  STATUS_OPTIONS,
  StatusBadge,
} from '../components/ui';
import { comments, tickets, users } from '../utils/api';
import type { Comment, Ticket, TicketPriority, TicketStatus, User } from '../utils/api';

export default function TicketDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, canManage, isAdmin } = useAuth();
  const { notify } = useToast();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPriority, setSavingPriority] = useState(false);

  const [agents, setAgents] = useState<User[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const loadTicket = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [data, commentData] = await Promise.all([tickets.get(id), comments.list(id)]);
      setTicket(data);
      setCommentList(commentData);
      setEditTitle(data.title);
      setEditDescription(data.description);
      setSelectedAgent(data.assignedToId ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el ticket');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadTicket();
  }, [loadTicket]);

  // Solo un ADMIN puede listar usuarios (GET /api/users), así que la
  // asignación desde la UI queda disponible únicamente para ese rol.
  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    users
      .list()
      .then((list) => {
        if (!active) return;
        setAgents(list.filter((u) => u.role === 'AGENT' || u.role === 'ADMIN'));
      })
      .catch(() => {
        if (active) setAgents([]);
      });
    return () => {
      active = false;
    };
  }, [isAdmin]);

  if (loading) return <Spinner label="Cargando ticket..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!ticket) return <ErrorMessage message="Ticket no encontrado" />;

  const isCreator = user?.id === ticket.creatorId;
  const canEdit = canManage || (isCreator && ticket.status === 'OPEN');

  const handleSaveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (editTitle.trim().length < 5) {
      notify('El título debe tener al menos 5 caracteres', 'error');
      return;
    }
    if (editDescription.trim().length < 10) {
      notify('La descripción debe tener al menos 10 caracteres', 'error');
      return;
    }
    setSavingEdit(true);
    try {
      const updated = await tickets.update(ticket.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      setTicket(updated);
      setEditing(false);
      notify('Ticket actualizado');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo actualizar', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (status === ticket.status) return;
    setSavingStatus(true);
    try {
      const updated = await tickets.changeStatus(ticket.id, status);
      setTicket(updated);
      notify('Estado actualizado');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo cambiar el estado', 'error');
    } finally {
      setSavingStatus(false);
    }
  };

  const handlePriorityChange = async (priority: TicketPriority) => {
    if (priority === ticket.priority) return;
    setSavingPriority(true);
    try {
      const updated = await tickets.update(ticket.id, { priority });
      setTicket(updated);
      notify('Prioridad actualizada');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo cambiar la prioridad', 'error');
    } finally {
      setSavingPriority(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedAgent) {
      notify('Seleccioná un agente', 'error');
      return;
    }
    setAssigning(true);
    try {
      const updated = await tickets.assign(ticket.id, selectedAgent);
      setTicket(updated);
      notify('Ticket asignado');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo asignar el ticket', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleAddComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newComment.trim().length < 2) {
      notify('El comentario debe tener al menos 2 caracteres', 'error');
      return;
    }
    setPostingComment(true);
    try {
      const created = await comments.create(ticket.id, newComment.trim());
      setCommentList((prev) => [...prev, created]);
      setNewComment('');
      notify('Comentario agregado');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo agregar el comentario', 'error');
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
          ← Volver
        </button>
        {canManage && (
          <Link to={`/audit/${ticket.id}`} className="btn-secondary">
            Ver auditoría
          </Link>
        )}
      </div>

      <div className="card p-6">
        {editing ? (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="label" htmlFor="edit-title">
                Título
              </label>
              <input
                id="edit-title"
                className="input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                minLength={5}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="edit-description">
                Descripción
              </label>
              <textarea
                id="edit-description"
                className="input min-h-[140px] resize-y"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                minLength={10}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditing(false);
                  setEditTitle(ticket.title);
                  setEditDescription(ticket.description);
                }}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={savingEdit}>
                {savingEdit ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{ticket.title}</h1>
              <div className="flex items-center gap-2">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>

            <p className="whitespace-pre-line text-slate-700">{ticket.description}</p>

            <dl className="mt-6 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-slate-500">Creado por</dt>
                <dd className="font-medium text-slate-800">
                  {ticket.creator?.name ?? 'Desconocido'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Asignado a</dt>
                <dd className="font-medium text-slate-800">
                  {ticket.assignedTo?.name ?? 'Sin asignar'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Creado</dt>
                <dd className="font-medium text-slate-800">
                  {new Date(ticket.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Actualizado</dt>
                <dd className="font-medium text-slate-800">
                  {new Date(ticket.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>

            {canEdit && (
              <div className="mt-4">
                <button type="button" className="btn-secondary" onClick={() => setEditing(true)}>
                  Editar título y descripción
                </button>
                {!canManage && (
                  <p className="mt-2 text-xs text-slate-500">
                    Solo podés editar el ticket mientras esté abierto.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {canManage && (
        <div className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Gestión</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="status-select">
                Estado
              </label>
              <select
                id="status-select"
                className="input"
                value={ticket.status}
                disabled={savingStatus}
                onChange={(e) => void handleStatusChange(e.target.value as TicketStatus)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="priority-select">
                Prioridad
              </label>
              <select
                id="priority-select"
                className="input"
                value={ticket.priority}
                disabled={savingPriority}
                onChange={(e) => void handlePriorityChange(e.target.value as TicketPriority)}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isAdmin && (
            <div>
              <label className="label" htmlFor="assign-select">
                Asignar a
              </label>
              <div className="flex flex-wrap gap-2">
                <select
                  id="assign-select"
                  className="input flex-1"
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                >
                  <option value="">Sin asignar</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={assigning || !selectedAgent}
                  onClick={() => void handleAssign()}
                >
                  {assigning ? 'Asignando...' : 'Asignar'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Comentarios ({commentList.length})
        </h2>

        {commentList.length === 0 ? (
          <EmptyState title="Todavía no hay comentarios" />
        ) : (
          <ul className="space-y-3">
            {commentList.map((comment) => (
              <li key={comment.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-800">
                    {comment.author?.name ?? 'Usuario'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="whitespace-pre-line text-sm text-slate-700">{comment.content}</p>
              </li>
            ))}
          </ul>
        )}

        {canManage || isCreator ? (
          <form onSubmit={handleAddComment} className="mt-5 space-y-2">
            <label className="label" htmlFor="new-comment">
              Añadir comentario
            </label>
            <textarea
              id="new-comment"
              className="input min-h-[90px] resize-y"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribí tu comentario..."
              maxLength={1000}
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500">{newComment.length}/1000</span>
              <button
                type="submit"
                className="btn-primary"
                disabled={postingComment || newComment.trim().length < 2}
              >
                {postingComment ? 'Enviando...' : 'Comentar'}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
