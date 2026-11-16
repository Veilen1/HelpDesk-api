import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import AuthShell from '../components/AuthShell';
import { ErrorMessage } from '../components/ui';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      kicker="Registro · nueva cuenta"
      title="Abrir un expediente"
      subtitle="Con la cuenta vas a poder crear tickets y seguirlos."
      footer={
        <>
          ¿Ya tenés cuenta?{' '}
          <Link
            to="/login"
            className="font-medium text-ink underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
          >
            Iniciá sesión
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-5">
          <ErrorMessage message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label" htmlFor="name">
            Nombre completo
          </label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            minLength={2}
            placeholder="Carlos Rodríguez"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="cliente@ejemplo.com"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
          <p className="field-hint">Mínimo 6 caracteres</p>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
    </AuthShell>
  );
}
