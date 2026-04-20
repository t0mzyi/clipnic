import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: { id: 'mock-id-123', email: 'clipper@clipnic.com', role: 'user', name: 'John Doe' }, // Mocking user for now
  token: 'mock-jwt-token',
  isAuthenticated: true,
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
