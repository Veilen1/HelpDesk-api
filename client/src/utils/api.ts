const API_BASE = (
  import.meta.env.VITE_API_BASE || 'https://help-desk-api-inky.vercel.app'
).replace(/\/+$/, '');

export { API_BASE };

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
  creatorId: string;
  assignedToId?: string | null;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  author?: User;
}

export interface AuditLog {
  id: string;
  action: string;
  details?: string | null;
  createdAt: string;
  userId?: string | null;
  user?: User | null;
}

export interface PaginatedTickets {
  data: Ticket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) {
        message = Array.isArray(body.message)
          ? body.message.join(', ')
          : body.message;
      }
    } catch {
      // respuesta sin JSON: se deja el mensaje por defecto
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

function authHeaders(json = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export const auth = {
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ name, email, password }),
    });
    saveSession(data);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ email, password }),
    });
    saveSession(data);
    return data;
  },

  async me(): Promise<User> {
    return request<User>('/api/auth/me', { headers: authHeaders() });
  },

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

function saveSession(data: AuthResponse) {
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('user', JSON.stringify(data.user));
}

export const tickets = {
  async list(
    page = 1,
    limit = 20,
    status?: string,
    priority?: string,
  ): Promise<PaginatedTickets> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    return request<PaginatedTickets>(`/api/tickets?${params}`, {
      headers: authHeaders(),
    });
  },

  async create(title: string, description: string): Promise<Ticket> {
    return request<Ticket>('/api/tickets', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ title, description }),
    });
  },

  async get(id: string): Promise<Ticket> {
    return request<Ticket>(`/api/tickets/${id}`, { headers: authHeaders() });
  },

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
    },
  ): Promise<Ticket> {
    return request<Ticket>(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });
  },

  async changeStatus(id: string, status: string): Promise<Ticket> {
    return request<Ticket>(`/api/tickets/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(true),
      body: JSON.stringify({ status }),
    });
  },

  async assign(id: string, agentId: string): Promise<Ticket> {
    return request<Ticket>(`/api/tickets/${id}/assign`, {
      method: 'PATCH',
      headers: authHeaders(true),
      body: JSON.stringify({ agentId }),
    });
  },
};

export const comments = {
  async list(ticketId: string): Promise<Comment[]> {
    return request<Comment[]>(`/api/tickets/${ticketId}/comments`, {
      headers: authHeaders(),
    });
  },

  async create(ticketId: string, content: string): Promise<Comment> {
    return request<Comment>(`/api/tickets/${ticketId}/comments`, {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ content }),
    });
  },
};

export const audit = {
  async list(ticketId: string): Promise<AuditLog[]> {
    return request<AuditLog[]>(`/api/tickets/${ticketId}/audit`, {
      headers: authHeaders(),
    });
  },
};

export const users = {
  async list(): Promise<User[]> {
    return request<User[]>('/api/users', { headers: authHeaders() });
  },
};