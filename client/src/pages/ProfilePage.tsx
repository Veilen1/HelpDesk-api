import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../components/ToastProvider';
import { ErrorMessage, RoleBadge } from '../components/ui';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { notify } = useToast();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  if (!user) return null;

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileError(null);

    if (name.trim().length < 2) {
      setProfileError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
      notify('Perfil actualizado');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'No se pudo actualizar el perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError(null);

    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    setSavingPassword(true);
    try {
      await updateProfile({ password });
      setPassword('');
      setConfirmPassword('');
      notify('Contraseña actualizada');
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : 'No se pudo actualizar la contraseña',
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8 border-b border-ink/15 pb-5">
        <p className="eyebrow">Cuenta · ajustes</p>
        <h1 className="display-lg mt-2">Mi perfil</h1>
      </header>

      {/* Ficha de identidad */}
      <section className="panel mb-6 flex flex-wrap items-center gap-4 p-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-[2px] border border-ink bg-ink font-display text-lg font-semibold text-paper-50">
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-semibold tracking-tight text-ink">{user.name}</p>
          <p className="font-mono text-[12px] text-ink-500">{user.email}</p>
        </div>
        <RoleBadge role={user.role} />
      </section>

      <div className="space-y-6">
        <form onSubmit={handleProfileSubmit} className="panel p-5 sm:p-6">
          <div className="mb-5 flex items-baseline justify-between gap-3 border-b border-ink/10 pb-2">
            <h2 className="font-display text-lg font-semibold tracking-tight">Datos personales</h2>
            <span className="serial">01</span>
          </div>

          {profileError && (
            <div className="mb-4">
              <ErrorMessage message={profileError} />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="profile-name">
                Nombre
              </label>
              <input
                id="profile-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={2}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="profile-email">
                Correo electrónico
              </label>
              <input
                id="profile-email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4">
            <p className="field-hint mt-0">
              El correo se usa para iniciar sesión; tiene que ser único.
            </p>
            <button type="submit" className="btn-primary btn-sm" disabled={savingProfile}>
              {savingProfile ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>

        <form onSubmit={handlePasswordSubmit} className="panel p-5 sm:p-6">
          <div className="mb-5 flex items-baseline justify-between gap-3 border-b border-ink/10 pb-2">
            <h2 className="font-display text-lg font-semibold tracking-tight">Seguridad</h2>
            <span className="serial">02</span>
          </div>

          {passwordError && (
            <div className="mb-4">
              <ErrorMessage message={passwordError} />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="new-password">
                Nueva contraseña
              </label>
              <input
                id="new-password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="confirm-password">
                Repetir contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4">
            <p className="field-hint mt-0">Mínimo 6 caracteres.</p>
            <button type="submit" className="btn-primary btn-sm" disabled={savingPassword}>
              {savingPassword ? 'Actualizando…' : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
