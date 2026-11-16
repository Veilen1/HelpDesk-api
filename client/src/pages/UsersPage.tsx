import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../components/ToastProvider';
import { ErrorMessage, RoleBadge, Spinner } from '../components/ui';
import { users } from '../utils/api';
import type { Role, User } from '../utils/api';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'CUSTOMER', label: 'Cliente' },
  { value: 'AGENT', label: 'Agente' },
  { value: 'ADMIN', label: 'Admin' },
];

interface EditState {
  name: string;
  email: string;
  role: Role;
}

export default function UsersPage() {
  const { notify } = useToast();
  const { user: currentUser } = useAuth();

  const [list, setList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState>({ name: '', email: '', role: 'CUSTOMER' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    users
      .list()
      .then(setList)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los usuarios');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (target: User) => {
    setEditingId(target.id);
    setEdit({ name: target.name, email: target.email, role: target.role });
  };

  const handleSave = async (target: User) => {
    if (edit.name.trim().length < 2) {
      notify('El nombre debe tener al menos 2 caracteres', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await users.update(target.id, {
        name: edit.name.trim(),
        email: edit.email.trim(),
        role: edit.role,
      });
      setList((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setEditingId(null);
      notify('Usuario actualizado');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo actualizar el usuario', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-sm text-slate-500">Administración de cuentas y roles</p>
        </div>
        <Link to="/" className="btn-secondary">
          ← Volver a los tickets
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Spinner label="Cargando usuarios..." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <tr key={item.id} className="align-middle">
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          className="input"
                          value={edit.name}
                          onChange={(e) => setEdit((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      ) : (
                        <span className="font-medium text-slate-800">{item.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          className="input"
                          type="email"
                          value={edit.email}
                          onChange={(e) => setEdit((prev) => ({ ...prev, email: e.target.value }))}
                        />
                      ) : (
                        <span className="text-slate-600">{item.email}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          className="input"
                          value={edit.role}
                          onChange={(e) =>
                            setEdit((prev) => ({ ...prev, role: e.target.value as Role }))
                          }
                        >
                          {ROLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <RoleBadge role={item.role} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => setEditingId(null)}
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              className="btn-primary"
                              disabled={saving}
                              onClick={() => void handleSave(item)}
                            >
                              {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => startEdit(item)}
                            >
                              Editar
                            </button>
                            {currentUser?.id === item.id && (
                              <span className="self-center text-xs text-slate-400">vos</span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
