import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-6xl font-bold text-slate-300">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Página no encontrada</h1>
      <p className="mt-2 text-slate-500">
        La dirección que buscás no existe o fue movida.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Volver a los tickets
      </Link>
    </div>
  );
}
