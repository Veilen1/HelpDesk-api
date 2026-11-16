import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../components/ToastProvider';
import { ErrorMessage, RoleBadge } from '../components/ui';

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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi perfil</h1>
        <p className="text-sm text-slate-500">Datos de tu cuenta</p>
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <p className="text-lg font-semibold text-slate-900">{user.name}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <RoleBadge role={user.role} />
      </div>

      <form onSubmit={handleProfileSubmit} className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Datos personales</h2>

        {profileError && <ErrorMessage message={profileError} />}

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

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={savingProfile}>
            {savingProfile ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Cambiar contraseña</h2>

        {passwordError && <ErrorMessage message={passwordError} />}

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
            Confirmar contraseña
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

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={savingPassword}>
            {savingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </div>
      </form>
    </div>
  );
}
