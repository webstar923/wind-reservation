import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  isAuthenticated: boolean;
  userRole: string;
  accessToken: string | null;
  setAuth: (token: string) => void;
  clearAuth: () => void;
  checkAuth: () => boolean;
}

interface JwtPayload {
  role: string;
  exp: number;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userRole: '',
      accessToken: null,

      setAuth: (token: string) => {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            set({ 
              isAuthenticated: false, 
              userRole: '', 
              accessToken: null 
            });
            return;
          }
          
          set({ 
            isAuthenticated: true,
            userRole: decoded.role,
            accessToken: token
          });
        } catch (error) {
          console.error('Error decoding token:', error);
          set({ 
            isAuthenticated: false, 
            userRole: '', 
            accessToken: null 
          });
        }
      },

      clearAuth: () => {
        set({ 
          isAuthenticated: false, 
          userRole: '', 
          accessToken: null 
        });
      },

      checkAuth: () => {
        const token = get().accessToken;
        if (!token) {
          set({ isAuthenticated: false, userRole: '' });
          return false;
        }

        try {
          const decoded = jwtDecode<JwtPayload>(token);
          const isValid = decoded.exp * 1000 > Date.now();
          
          if (!isValid) {
            set({ 
              isAuthenticated: false, 
              userRole: '', 
              accessToken: null 
            });
          }
          
          return isValid;
        } catch {
          set({ 
            isAuthenticated: false, 
            userRole: '', 
            accessToken: null 
          });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({
        accessToken: state.accessToken,
        userRole: state.userRole,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);