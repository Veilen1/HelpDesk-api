import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../components/ToastProvider';
import {
  EmptyState,
  ErrorMessage,
  formatDate,
  formatDateTime,
  PRIORITY_OPTIONS,
  PriorityBadge,
  shortId,
  Spinner,
  STATUS_OPTIONS,
  StatusBadge,
} from '../components/ui';
import { comments, tickets, users } from '../utils/api';
import type { Comment, Ticket, TicketPriority, TicketStatus, User } from '../utils/api';

function initials(name?: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-ink/10 py-2 last:border-b-0">
      <span className="eyebrow shrink-0">{label}</span>
      <span className="min-w-0 truncate text-right text-sm text-ink-700">{children}</span>
    </div>
  );
}

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
  // asignación desde la interfaz queda disponible únicamente para ese rol.
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

  if (loading) return <Spinner label="Abriendo expediente" />;
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
      notify(`Estado: ${status}`);
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
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="serial inline-flex items-center gap-2 hover:text-accent"
          onClick={() => navigate('/')}
        >
          ← Volver a los tickets
        </button>
        {canManage && (
          <Link to={`/audit/${ticket.id}`} className="btn-secondary btn-sm">
            Ver auditoría
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        {/* ---------------- Columna principal ---------------- */}
        <div className="min-w-0 space-y-6">
          <article className="panel p-5 sm:p-6">
            <p className="serial">
              Expediente #{shortId(ticket.id)} · {formatDate(ticket.createdAt)}
            </p>

            {editing ? (
              <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
                <div>
                  <label className="label" htmlFor="edit-title">
                    Título
                  </label>
                  <input
                    id="edit-title"
                    className="input text-base"
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
                    className="input min-h-[150px] resize-y leading-relaxed"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    minLength={10}
                    required
                  />
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      setEditing(false);
                      setEditTitle(ticket.title);
                      setEditDescription(ticket.description);
                    }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={savingEdit}>
                    {savingEdit ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="display-lg mt-2 text-balance">{ticket.title}</h1>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>

                <div className="mt-5 border-t border-ink/10 pt-5">
                  <p className="whitespace-pre-line text-[0.95rem] leading-relaxed text-ink-700 text-pretty">
                    {ticket.description}
                  </p>
                </div>

                {canEdit && (
                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-4">
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => setEditing(true)}
                    >
                      Editar título y descripción
                    </button>
                    {!canManage && (
                      <span className="serial">editable mientras el ticket esté abierto</span>
                    )}
                  </div>
                )}
              </>
            )}
          </article>

          {/* ---------------- Conversación ---------------- */}
          <section className="panel p-5 sm:p-6" aria-label="Comentarios">
            <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-ink/10 pb-2">
              <h2 className="font-display text-lg font-semibold tracking-tight">Conversación</h2>
              <span className="serial">
                {commentList.length} mensaje{commentList.length === 1 ? '' : 's'}
              </span>
            </div>

            {commentList.length === 0 ? (
              <EmptyState
                title="Sin mensajes todavía"
                description="Escribí el primero para dejar contexto o pedir una actualización."
              />
            ) : (
              <ol className="space-y-4">
                {commentList.map((comment) => (
                  <li key={comment.id} className="flex gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] border border-ink/25 bg-paper-100 font-mono text-[10px] tracking-stamp text-ink-500">
                      {initials(comment.author?.name)}
                    </span>
                    <div className="min-w-0 flex-1 border-l border-ink/15 pl-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm font-medium text-ink">
                          {comment.author?.name ?? 'Usuario'}
                        </span>
                        <span className="serial">{formatDateTime(comment.createdAt)}</span>
                      </div>
                      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-700 text-pretty">
                        {comment.content}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {canManage || isCreator ? (
              <form onSubmit={handleAddComment} className="mt-6 border-t border-ink/10 pt-5">
                <label className="label" htmlFor="new-comment">
                  Añadir comentario
                </label>
                <textarea
                  id="new-comment"
                  className="input min-h-[90px] resize-y"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribí una actualización o una pregunta…"
                  maxLength={1000}
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="field-hint">{newComment.length}/1000</span>
                  <button
                    type="submit"
                    className="btn-primary btn-sm"
                    disabled={postingComment || newComment.trim().length < 2}
                  >
                    {postingComment ? 'Enviando…' : 'Comentar'}
                  </button>
                </div>
              </form>
            ) : null}
          </section>
        </div>

        {/* ---------------- Panel de expediente ---------------- */}
        <aside className="space-y-4 lg:sticky lg:top-8">
          <div className="panel">
            <div className="border-b border-ink/15 bg-paper-100/60 px-4 py-2.5">
              <p className="eyebrow">Expediente</p>
            </div>

            <div className="px-4 py-3">
              <MetaRow label="Creado por">{ticket.creator?.name ?? 'Desconocido'}</MetaRow>
              <MetaRow label="Asignado">
                {ticket.assignedTo ? (
                  ticket.assignedTo.name
                ) : (
                  <span className="text-ink-400">sin asignar</span>
                )}
              </MetaRow>
              <MetaRow label="Alta">{formatDate(ticket.createdAt)}</MetaRow>
              <MetaRow label="Último cambio">{formatDate(ticket.updatedAt)}</MetaRow>
            </div>
          </div>

          {canManage ? (
            <div className="panel">
              <div className="border-b border-ink/15 bg-paper-100/60 px-4 py-2.5">
                <p className="eyebrow">Gestión</p>
              </div>

              <div className="space-y-4 px-4 py-4">
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

                {isAdmin && (
                  <div className="border-t border-ink/10 pt-4">
                    <label className="label" htmlFor="assign-select">
                      Asignar a
                    </label>
                    <select
                      id="assign-select"
                      className="input"
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                    >
                      <option value="">Sin asignar</option>
                      {ticket.assignedTo && !agents.some((a) => a.id === ticket.assignedTo?.id) && (
                        <option value={ticket.assignedTo.id}>{ticket.assignedTo.name}</option>
                      )}
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} · {agent.email}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-primary btn-sm mt-2 w-full"
                      disabled={assigning || !selectedAgent}
                      onClick={() => void handleAssign()}
                    >
                      {assigning ? 'Asignando…' : 'Asignar'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="panel-flat px-4 py-3">
              <p className="eyebrow">Seguimiento</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                El estado y la prioridad los administra el equipo de soporte. Podés sumar
                comentarios en cualquier momento.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
