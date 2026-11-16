import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PriorityBadge, StatusBadge } from './ui';

/** Marco compartido por login y registro: expediente a la izquierda, formulario a la derecha. */
export default function AuthShell({
  kicker,
  title,
  subtitle,
  children,
  footer,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Columna editorial */}
      <section className="relative hidden border-r border-ink/15 bg-paper-50/70 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <div className="hatch pointer-events-none absolute inset-x-0 top-0 h-24" aria-hidden="true" />

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-ink bg-ink font-display text-sm font-bold text-paper-50">
              HD
            </span>
            <span className="leading-none">
              <span className="block font-display text-lg font-semibold tracking-tight">
                HelpDesk
              </span>
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-label text-ink-400">
                mesa de ayuda
              </span>
            </span>
          </Link>

          <p className="eyebrow mt-16">{kicker}</p>
          <h2 className="mt-4 max-w-md font-display text-[2.75rem] font-semibold leading-[1.02] tracking-tight text-balance">
            Cada incidencia, con su expediente.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500 text-pretty">
            Abrí un ticket, seguí la conversación y mirá cómo se mueve hasta resolverse. Todo
            cambio queda registrado con quién, cuándo y qué.
          </p>
        </div>

        {/* Muestra de expediente (decorativa) */}
        <div className="relative mt-12 max-w-md" aria-hidden="true">
          <p className="eyebrow mb-3">Últimos movimientos</p>
          <div className="panel divide-y divide-ink/10">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-semibold">
                  Error al exportar reportes
                </p>
                <p className="serial mt-0.5">#A1F4C2D9 · hace 2 h</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <StatusBadge status="IN_PROGRESS" />
                <PriorityBadge priority="HIGH" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-semibold">
                  Acceso bloqueado tras cambio de clave
                </p>
                <p className="serial mt-0.5">#7B0E93AA · hace 5 h</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <StatusBadge status="RESOLVED" />
                <PriorityBadge priority="MEDIUM" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-semibold">
                  Factura duplicada en el resumen
                </p>
                <p className="serial mt-0.5">#2C88E1B7 · ayer</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <StatusBadge status="OPEN" />
                <PriorityBadge priority="URGENT" />
              </div>
            </div>
          </div>
          <p className="serial mt-3">Datos de ejemplo · no representan tu cuenta</p>
        </div>
      </section>

      {/* Columna de formulario */}
      <section className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-ink bg-ink font-display text-xs font-bold text-paper-50">
              HD
            </span>
            <span className="font-display text-base font-semibold tracking-tight">HelpDesk</span>
          </div>

          <p className="eyebrow">{kicker}</p>
          <h1 className="mt-2 display-lg">{title}</h1>
          <p className="mt-2 text-sm text-ink-500">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <div className="mt-8 text-sm text-ink-500">{footer}</div>
        </div>
      </section>
    </div>
  );
}
