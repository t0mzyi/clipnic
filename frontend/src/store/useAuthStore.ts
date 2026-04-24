import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  instagramHandles?: string[];
  tiktokVerified?: boolean;
  tiktokHandle?: string;
  bio?: string;
  created_at?: string;
  user_metadata?: any;
  onboardingCompleted?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  settings: Record<string, any>;
  login: (user: User, token: string, settings?: Record<string, any>) => void;
  updateUser: (data: Partial<User>) => void;
  setSettings: (settings: Record<string, any>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
      updateUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
      })),
      setSettings: (settings) => set((state) => ({ 
        settings: { ...state.settings, ...settings } 
      })),
      logout: () => set({ user: null, token: null, isAuthenticated: false, settings: {} }),
    }),
    {
      name: 'clipnic-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
