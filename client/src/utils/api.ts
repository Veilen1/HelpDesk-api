const API_BASE = import.meta.env.VITE_API_BASE || 'https://help-desk-api-rho.vercel.app';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'AGENT' | 'ADMIN';
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  userId: string;
  agentId?: string;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
}

export const auth = {
  async register(name: string, email: string, password: string): Promise<User> {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) throw new Error('Error en el registro');
    return res.json();
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Error en el login');
    return res.json();
  },

  async me(): Promise<User> {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!res.ok) throw new Error('No autenticado');
    return res.json();
  },

  async logout() {
    localStorage.removeItem('token');
  },
};

export const tickets = {
  async list(page = 1, limit = 20, status?: string, priority?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    const res = await fetch(`${API_BASE}/api/tickets?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!res.ok) throw new Error('Error al obtener tickets');
    return res.json();
  },

  async create(title: string, description: string): Promise<Ticket> {
    const res = await fetch(`${API_BASE}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) throw new Error('Error al crear ticket');
    return res.json();
  },

  async get(id: string): Promise<Ticket> {
    const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!res.ok) throw new Error('Error al obtener ticket');
    return res.json();
  },

  async update(id: string, data: { title?: string; description?: string; status?: string; priority?: string }) {
    const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar ticket');
    return res.json();
  },

  async changeStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE}/api/tickets/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Error al cambiar estado');
    return res.json();
  },

  async assign(id: string, agentId: string) {
    const res = await fetch(`${API_BASE}/api/tickets/${id}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ agentId }),
    });
    if (!res.ok) throw new Error('Error al asignar ticket');
    return res.json();
  },
};

export const comments = {
  async list(ticketId: string): Promise<Comment[]> {
    const res = await fetch(`${API_BASE}/api/tickets/${ticketId}/comments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!res.ok) throw new Error('Error al obtener comentarios');
    return res.json();
  },

  async create(ticketId: string, text: string): Promise<Comment> {
    const res = await fetch(`${API_BASE}/api/tickets/${ticketId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Error al crear comentario');
    return res.json();
  },
};

export const audit = {
  async list(ticketId: string) {
    const res = await fetch(`${API_BASE}/api/tickets/${ticketId}/audit`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!res.ok) throw new Error('Error al obtener auditoría');
    return res.json();
  },
};