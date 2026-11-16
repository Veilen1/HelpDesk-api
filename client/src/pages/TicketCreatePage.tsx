import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { ErrorMessage, PRIORITY_OPTIONS } from '../components/ui';
import { tickets } from '../utils/api';
import type { TicketPriority } from '../utils/api';

export default function TicketCreatePage() {
  const navigate = useNavigate();
  const { notify } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (title.trim().length < 5) {
      setError('El título debe tener al menos 5 caracteres');
      return;
    }
    if (description.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      const created = await tickets.create({
        title: title.trim(),
        description: description.trim(),
        priority,
      });
      notify('Ticket creado correctamente');
      navigate(`/ticket/${created.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← Volver a los tickets
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Nuevo ticket</h1>
        <p className="text-sm text-slate-500">
          Describí el problema con el mayor detalle posible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5 p-6">
        {error && <ErrorMessage message={error} />}

        <div>
          <label className="label" htmlFor="title">
            Título
          </label>
          <input
            id="title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={5}
            maxLength={120}
            placeholder="Ej: Error al exportar reportes"
            required
          />
          <p className="mt-1 text-xs text-slate-500">Mínimo 5 caracteres.</p>
        </div>

        <div>
          <label className="label" htmlFor="description">
            Descripción
          </label>
          <textarea
            id="description"
            className="input min-h-[140px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minLength={10}
            maxLength={2000}
            placeholder="Contá qué estabas haciendo, qué esperabas y qué ocurrió."
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            Mínimo 10 caracteres. {description.trim().length}/2000
          </p>
        </div>

        <div>
          <label className="label" htmlFor="priority">
            Prioridad
          </label>
          <select
            id="priority"
            className="input"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority)}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Link to="/" className="btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
