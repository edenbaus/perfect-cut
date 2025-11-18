import apiClient from './client'

export interface RegisterData {
  email: string
  password: string
  name?: string
}

export interface LoginData {
  email: string
  password: string
}

export const authApi = {
  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  login: async (data: LoginData) => {
    const response = await apiClient.post('/auth/login', data)
    return response.data
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },
}
