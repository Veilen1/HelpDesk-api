import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl">
      <div className="panel relative overflow-hidden">
        <div className="hatch pointer-events-none absolute inset-x-0 top-0 h-24" aria-hidden="true" />
        <div className="relative px-6 py-14 text-center">
          <p className="eyebrow">Error 404</p>
          <p className="mt-3 font-display text-7xl font-semibold leading-none tracking-tight text-ink">
            404
          </p>
          <h1 className="display-md mt-4 text-balance">No encontramos ese expediente</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500 text-pretty">
            La dirección no existe, cambió de lugar o el ticket ya no está disponible para tu
            cuenta.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Link to="/" className="btn-primary">
              Volver a los tickets
            </Link>
            <Link to="/tickets/new" className="btn-secondary">
              Abrir un ticket
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
