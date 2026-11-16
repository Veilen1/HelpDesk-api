const API_BASE = (
  import.meta.env.VITE_API_BASE || 'https://help-desk-api-inky.vercel.app'
).replace(/\/+$/, '');

export { API_BASE };

export type Role = 'CUSTOMER' | 'AGENT' | 'ADMIN';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  assignedToId?: string | null;
  creator?: User | null;
  assignedTo?: User | null;
  _count?: { comments: number };
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

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
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
      // respuesta sin JSON
    }
    if (res.status === 401) {
      clearSession();
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

export function saveSession(data: AuthResponse) {
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('user', JSON.stringify(data.user));
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export const auth = {
  register(name: string, email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ name, email, password }),
    });
  },

  login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ email, password }),
    });
  },

  me(): Promise<User> {
    return request<User>('/api/auth/me', { headers: authHeaders() });
  },

  logout() {
    clearSession();
  },
};

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  assignedToId?: string;
}

export const tickets = {
  list(filters: TicketFilters = {}): Promise<PaginatedTickets> {
    const { page = 1, limit = 20, status, priority, assignedToId } = filters;
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (status) params.set('status', status);
    if (priority) params.set('priority', priority);
    if (assignedToId) params.set('assignedToId', assignedToId);
    return request<PaginatedTickets>(`/api/tickets?${params}`, {
      headers: authHeaders(),
    });
  },

  create(data: {
    title: string;
    description: string;
    priority?: TicketPriority;
  }): Promise<Ticket> {
    return request<Ticket>('/api/tickets', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });
  },

  get(id: string): Promise<Ticket> {
    return request<Ticket>(`/api/tickets/${id}`, { headers: authHeaders() });
  },

  update(
    id: string,
    data: {
      title?: string;
      description?: string;
      priority?: TicketPriority;
      status?: TicketStatus;
    },
  ): Promise<Ticket> {
    return request<Ticket>(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });
  },

  changeStatus(id: string, status: TicketStatus): Promise<Ticket> {
    return request<Ticket>(`/api/tickets/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(true),
      body: JSON.stringify({ status }),
    });
  },

  assign(id: string, assignedToId: string): Promise<Ticket> {
    return request<Ticket>(`/api/tickets/${id}/assign`, {
      method: 'PATCH',
      headers: authHeaders(true),
      body: JSON.stringify({ assignedToId }),
    });
  },
};

export const comments = {
  list(ticketId: string): Promise<Comment[]> {
    return request<Comment[]>(`/api/tickets/${ticketId}/comments`, {
      headers: authHeaders(),
    });
  },

  create(ticketId: string, content: string): Promise<Comment> {
    return request<Comment>(`/api/tickets/${ticketId}/comments`, {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ content }),
    });
  },
};

export const audit = {
  list(ticketId: string): Promise<AuditLog[]> {
    return request<AuditLog[]>(`/api/tickets/${ticketId}/audit`, {
      headers: authHeaders(),
    });
  },
};

export const users = {
  list(): Promise<User[]> {
    return request<User[]>('/api/users', { headers: authHeaders() });
  },

  get(id: string): Promise<User> {
    return request<User>(`/api/users/${id}`, { headers: authHeaders() });
  },

  update(id: string, data: UpdateUserPayload): Promise<User> {
    return request<User>(`/api/users/${id}`, {
      method: 'PATCH',
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });
  },
};