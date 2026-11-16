import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import AuthShell from '../components/AuthShell';
import { ErrorMessage } from '../components/ui';

interface LocationState {
  from?: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as LocationState | null)?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      kicker="Acceso · sesión"
      title="Entrar a la mesa"
      subtitle="Usá la cuenta con la que abriste tus tickets."
      footer={
        <>
          ¿Todavía no tenés cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-ink underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
          >
            Crear una
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
            autoComplete="current-password"
            minLength={6}
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Verificando…' : 'Entrar'}
        </button>
      </form>
    </AuthShell>
  );
}
