import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name?: string;
  avatarUrl?: string;
  discordVerified?: boolean;
  discordId?: string;
  youtubeVerified?: boolean;
  youtubeHandle?: string;
  youtubeChannels?: any[];
  instagramVerified?: boolean;
  instagramHandle?: string;
  bio?: string;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  settings: Record<string, any>;
  login: (user: User, token: string, settings?: Record<string, any>) => void;
  setSettings: (settings: Record<string, any>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  settings: {},
  login: (user, token, settings = {}) => set({ 
    user, 
    token, 
    isAuthenticated: true, 
    settings: Object.keys(settings).length > 0 ? settings : {} 
  }),
  setSettings: (settings) => set((state) => ({ 
    settings: { ...state.settings, ...settings } 
  })),
  logout: () => set({ user: null, token: null, isAuthenticated: false, settings: {} }),
}));
