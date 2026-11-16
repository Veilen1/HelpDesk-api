import type { ReactNode } from 'react';
import type { TicketPriority, TicketStatus } from '../utils/api';

const statusStyles: Record<TicketStatus, string> = {
  OPEN: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  RESOLVED: 'bg-amber-100 text-amber-800 border-amber-200',
  CLOSED: 'bg-slate-200 text-slate-700 border-slate-300',
};

const statusLabels: Record<TicketStatus, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En progreso',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
};

const priorityStyles: Record<TicketPriority, string> = {
  LOW: 'bg-slate-100 text-slate-700 border-slate-200',
  MEDIUM: 'bg-sky-100 text-sky-800 border-sky-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  URGENT: 'bg-red-100 text-red-800 border-red-200',
};

const priorityLabels: Record<TicketPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const roleStyles = {
  CUSTOMER: 'bg-slate-100 text-slate-700 border-slate-200',
  AGENT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
} as const;

const roleLabels = {
  CUSTOMER: 'Cliente',
  AGENT: 'Agente',
  ADMIN: 'Admin',
} as const;

export function Badge({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <Badge className={statusStyles[status]}>{statusLabels[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <Badge className={priorityStyles[priority]}>{priorityLabels[priority]}</Badge>
  );
}

export function RoleBadge({ role }: { role: keyof typeof roleLabels }) {
  return <Badge className={roleStyles[role]}>{roleLabels[role]}</Badge>;
}

export function Spinner({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
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
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="text-base font-medium text-slate-700">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
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