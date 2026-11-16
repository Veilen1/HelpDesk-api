import type { ReactNode } from 'react';
import type { Role, TicketPriority, TicketStatus } from '../utils/api';

/* ------------------------------------------------------------------ */
/* Etiquetas y sellos                                                  */
/* ------------------------------------------------------------------ */

const statusStyles: Record<TicketStatus, string> = {
  OPEN: 'border-signal-open/45 bg-signal-open/[0.07] text-signal-open',
  IN_PROGRESS: 'border-signal-progress/45 bg-signal-progress/[0.07] text-signal-progress',
  RESOLVED: 'border-signal-resolved/45 bg-signal-resolved/[0.07] text-signal-resolved',
  CLOSED: 'border-ink/25 bg-ink/[0.04] text-ink-500',
};

const statusDots: Record<TicketStatus, string> = {
  OPEN: 'bg-signal-open',
  IN_PROGRESS: 'bg-signal-progress',
  RESOLVED: 'bg-signal-resolved',
  CLOSED: 'bg-ink-400',
};

export const statusLabels: Record<TicketStatus, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En progreso',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
};

const priorityStyles: Record<TicketPriority, string> = {
  LOW: 'border-ink/20 bg-transparent text-ink-500',
  MEDIUM: 'border-signal-progress/40 bg-transparent text-signal-progress',
  HIGH: 'border-accent/50 bg-transparent text-accent',
  URGENT: 'border-signal-urgent bg-signal-urgent text-paper-50',
};

export const priorityLabels: Record<TicketPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const roleStyles: Record<Role, string> = {
  CUSTOMER: 'border-ink/25 text-ink-500',
  AGENT: 'border-signal-progress/45 text-signal-progress',
  ADMIN: 'border-accent/50 text-accent',
};

const roleLabels: Record<Role, string> = {
  CUSTOMER: 'Cliente',
  AGENT: 'Agente',
  ADMIN: 'Admin',
};

export function Stamp({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`stamp ${className}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Stamp className={statusStyles[status]}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDots[status]}`} aria-hidden="true" />
      {statusLabels[status]}
    </Stamp>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <Stamp className={priorityStyles[priority]}>{priorityLabels[priority]}</Stamp>;
}

export function RoleBadge({ role }: { role: Role }) {
  return <Stamp className={roleStyles[role]}>{roleLabels[role]}</Stamp>;
}

/* ------------------------------------------------------------------ */
/* Estados de interfaz                                                 */
/* ------------------------------------------------------------------ */

export function Spinner({ label = 'Cargando' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20" role="status">
      <span className="relative block h-[2px] w-40 overflow-hidden bg-ink/15">
        <span className="absolute inset-y-0 w-1/2 animate-sweep bg-accent" />
      </span>
      <span className="eyebrow">{label}</span>
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 border-l-2 border-accent bg-accent-soft/60 px-4 py-3"
    >
      <span className="mt-[3px] font-mono text-[11px] uppercase tracking-label text-accent">
        Error
      </span>
      <p className="text-sm text-ink-700">{message}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel-flat relative overflow-hidden">
      <div className="hatch pointer-events-none absolute inset-x-0 top-0 h-16" aria-hidden="true" />
      <div className="relative flex flex-col items-center justify-center px-6 py-14 text-center">
        <p className="display-md text-balance">{title}</p>
        {description && (
          <p className="mt-2 max-w-md text-sm text-ink-500 text-pretty">{description}</p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cabecera de página                                                  */
/* ------------------------------------------------------------------ */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 border-b border-ink/15 pb-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h1 className="display-lg text-balance">{title}</h1>
          {description && (
            <p className="mt-2 max-w-xl text-sm text-ink-500 text-pretty">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers de formato                                                  */
/* ------------------------------------------------------------------ */

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Identificador corto legible para tablas y series. */
export function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: 'OPEN', label: 'Abierto' },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'RESOLVED', label: 'Resuelto' },
  { value: 'CLOSED', label: 'Cerrado' },
];

export const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' },
];
