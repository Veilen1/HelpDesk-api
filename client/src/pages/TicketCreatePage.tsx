import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { ErrorMessage, PRIORITY_OPTIONS } from '../components/ui';
import { tickets } from '../utils/api';
import type { TicketPriority } from '../utils/api';

function SectionTitle({ index, title, hint }: { index: string; title: string; hint?: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-ink/10 pb-2">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[10px] tracking-stamp text-accent">{index}</span>
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {hint && <span className="serial hidden sm:inline">{hint}</span>}
    </div>
  );
}

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
      notify('Ticket creado');
      navigate(`/ticket/${created.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="serial inline-flex items-center gap-2 hover:text-accent">
        ← Volver a los tickets
      </Link>

      <header className="mb-8 mt-4 border-b border-ink/15 pb-5">
        <p className="eyebrow">Nuevo expediente</p>
        <h1 className="display-lg mt-2">Abrir un ticket</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-500 text-pretty">
          Cuanto más preciso sea el detalle, más rápido se puede resolver. Todo lo que escribas
          queda asociado a tu cuenta.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <ErrorMessage message={error} />}

        <section className="panel p-5 sm:p-6">
          <SectionTitle index="01" title="Asunto" hint="mín. 5 caracteres" />
          <label className="label" htmlFor="title">
            Título del ticket
          </label>
          <input
            id="title"
            className="input text-base"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={5}
            maxLength={120}
            placeholder="Ej.: Error al exportar el reporte mensual"
            required
          />
          <p className="field-hint">{title.trim().length}/120 · visible para agentes y admins</p>
        </section>

        <section className="panel p-5 sm:p-6">
          <SectionTitle index="02" title="Detalle" hint="mín. 10 caracteres" />
          <label className="label" htmlFor="description">
            ¿Qué pasó?
          </label>
          <textarea
            id="description"
            className="input min-h-[160px] resize-y leading-relaxed"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minLength={10}
            maxLength={2000}
            placeholder="Contá qué estabas haciendo, qué esperabas que ocurriera y qué ocurrió en su lugar. Si aplica, incluí navegador, dispositivo y pasos para reproducirlo."
            required
          />
          <p className="field-hint">
            {description.trim().length}/2000 · se puede editar mientras el ticket esté abierto
          </p>
        </section>

        <section className="panel p-5 sm:p-6">
          <SectionTitle index="03" title="Prioridad" hint="orientativa para el agente" />
          <fieldset>
            <legend className="sr-only">Prioridad del ticket</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PRIORITY_OPTIONS.map((option) => {
                const selected = priority === option.value;
                return (
                  <label
                    key={option.value}
                    className={[
                      'cursor-pointer border px-3 py-2.5 text-center font-mono text-[11px] uppercase tracking-label transition-all duration-150',
                      selected
                        ? 'border-ink bg-ink text-paper-50 shadow-stamp'
                        : 'border-ink/25 bg-paper-50 text-ink-500 hover:-translate-y-0.5 hover:border-ink hover:text-ink',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={option.value}
                      checked={selected}
                      onChange={() => setPriority(option.value)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <p className="field-hint mt-3">
            Urgente se reserva para bloqueos totales del servicio.
          </p>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink/15 pt-5">
          <Link to="/" className="btn-ghost">
            Cancelar
          </Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Registrando…' : 'Crear ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
