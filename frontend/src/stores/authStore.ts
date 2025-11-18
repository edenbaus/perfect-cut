import { create } from 'zustand'

interface AuthState {
  token: string | null
  user: any | null
  setAuth: (token: string, user: any) => void
  logout: () => void
}

// Simple localStorage persistence
const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem('auth-storage')
    return stored ? JSON.parse(stored) : { token: null, user: null }
  } catch {
    return { token: null, user: null }
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...getStoredAuth(),
  setAuth: (token, user) => {
    localStorage.setItem('auth-storage', JSON.stringify({ token, user }))
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem('auth-storage')
    set({ token: null, user: null })
  },
}))
