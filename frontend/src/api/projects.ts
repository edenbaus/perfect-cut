import apiClient from './client'

export interface Sheet {
  width: number
  height: number
  quantity: number
  material_type?: string
  thickness?: number
  has_grain?: boolean
  cost_per_sheet?: number
}

export interface Piece {
  label?: string
  width: number
  height: number
  quantity: number
  grain_direction?: string
  priority?: number
}

export interface Project {
  id?: string
  name: string
  description?: string
  unit_system?: 'imperial' | 'metric'
  settings?: any
  sheets: Sheet[]
  pieces: Piece[]
}

export interface OptimizeRequest {
  sheets: Sheet[]
  pieces: Piece[]
  settings: {
    optimization_mode: string
    kerf_width: number
    min_usable_offcut: number
    grain_importance: string
  }
}

export const projectsApi = {
  getAll: async () => {
    const response = await apiClient.get('/projects')
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/projects/${id}`)
    return response.data
  },

  create: async (data: Project) => {
    const response = await apiClient.post('/projects', data)
    return response.data
  },

  update: async (id: string, data: Partial<Project>) => {
    const response = await apiClient.put(`/projects/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/projects/${id}`)
    return response.data
  },

  addPiece: async (projectId: string, piece: Piece) => {
    const response = await apiClient.post(`/projects/${projectId}/pieces`, piece)
    return response.data
  },

  deletePiece: async (projectId: string, pieceId: string) => {
    const response = await apiClient.delete(`/projects/${projectId}/pieces/${pieceId}`)
    return response.data
  },

  optimize: async (data: OptimizeRequest) => {
    const response = await apiClient.post('/optimize', data)
    return response.data
  },
}
