import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../components/ToastProvider';
import { EmptyState, ErrorMessage, RoleBadge, Spinner } from '../components/ui';
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

  useEffect(() => {
    setLoading(true);
    setError(null);
    users
      .list()
      .then(setList)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los usuarios');
      })
      .finally(() => setLoading(false));
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
    <div>
      <header className="mb-8 border-b border-ink/15 pb-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Administración · cuentas</p>
            <h1 className="display-lg mt-2">Usuarios</h1>
            <p className="mt-2 max-w-xl text-sm text-ink-500 text-pretty">
              Cambiá nombre, correo o rol. Los cambios de rol afectan qué puede ver y hacer la
              cuenta en la mesa de ayuda.
            </p>
          </div>
          <Link to="/" className="btn-secondary">
            ← Tickets
          </Link>
        </div>
      </header>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {loading ? (
        <Spinner label="Cargando cuentas" />
      ) : list.length === 0 ? (
        <EmptyState title="No hay cuentas registradas" />
      ) : (
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink/15 bg-paper-100/60 px-4 py-2.5">
            <span className="eyebrow">Cuenta</span>
            <span className="serial">
              {list.length} registro{list.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="hidden sm:table-header-group">
                <tr className="border-b border-ink/10 text-left">
                  <th className="px-4 py-2">
                    <span className="eyebrow">Nombre</span>
                  </th>
                  <th className="px-4 py-2">
                    <span className="eyebrow">Correo</span>
                  </th>
                  <th className="px-4 py-2">
                    <span className="eyebrow">Rol</span>
                  </th>
                  <th className="px-4 py-2 text-right">
                    <span className="eyebrow">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => {
                  const isEditing = editingId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-ink/10 last:border-b-0 ${
                        isEditing ? 'bg-paper-100/70' : 'hover:bg-paper-100/50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            className="input"
                            value={edit.name}
                            onChange={(e) =>
                              setEdit((prev) => ({ ...prev, name: e.target.value }))
                            }
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-display text-base font-semibold tracking-tight text-ink">
                              {item.name}
                            </span>
                            {currentUser?.id === item.id && <span className="serial">(vos)</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            className="input"
                            type="email"
                            value={edit.email}
                            onChange={(e) =>
                              setEdit((prev) => ({ ...prev, email: e.target.value }))
                            }
                          />
                        ) : (
                          <span className="font-mono text-[12px] text-ink-500">{item.email}</span>
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
                                className="btn-ghost btn-sm"
                                onClick={() => setEditingId(null)}
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                className="btn-primary btn-sm"
                                disabled={saving}
                                onClick={() => void handleSave(item)}
                              >
                                {saving ? 'Guardando…' : 'Guardar'}
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              onClick={() => startEdit(item)}
                            >
                              Editar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
