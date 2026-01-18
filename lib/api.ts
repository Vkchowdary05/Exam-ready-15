import type {
  IApiResponse,
  IPaginatedResponse,
  IUser,
  IPaper,
  ITopicResult,
  IPlatformStats,
  IUserStats,
  IAuthResponse,
  ILoginCredentials,
  IRegisterData,
  IPaperFilters,
  ITopicFilters,
  INotification,
  ILeaderboardEntry,
  IOCRResult
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Token management
let authToken: string | null = null

export const setAuthToken = (token: string | null) => {
  authToken = token
  if (token) {
    localStorage.setItem('exam_ready_token', token)
  } else {
    localStorage.removeItem('exam_ready_token')
  }
}

export const getAuthToken = (): string | null => {
  if (authToken) return authToken
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('exam_ready_token')
  }
  return authToken
}

// Base fetch wrapper with auth
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<IApiResponse<T>> {
  const token = getAuthToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'An error occurred',
        message: data.message
      }
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      message: 'Failed to connect to server'
    }
  }
}

// Auth API
export const authApi = {
  login: (credentials: ILoginCredentials) =>
    fetchWithAuth<IAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  register: (data: IRegisterData) =>
    fetchWithAuth<IAuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  logout: () => {
    setAuthToken(null)
    return Promise.resolve({ success: true })
  },

  refreshToken: () =>
    fetchWithAuth<{ token: string }>('/auth/refresh', {
      method: 'POST'
    }),

  getMe: () => fetchWithAuth<IUser>('/auth/me')
}

// Users API
export const usersApi = {
  getProfile: () => fetchWithAuth<IUser>('/users/profile'),

  updateProfile: (updates: Partial<IUser>) =>
    fetchWithAuth<IUser>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  getStats: () => fetchWithAuth<IUserStats>('/users/stats'),

  getLeaderboard: (filter: 'global' | 'college' | 'subject' = 'global', period: 'all' | 'month' | 'week' = 'all') =>
    fetchWithAuth<ILeaderboardEntry[]>(`/users/leaderboard?filter=${filter}&period=${period}`),

  updateSettings: (settings: Record<string, unknown>) =>
    fetchWithAuth<IUser>('/users/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    fetchWithAuth<void>('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    })
}

// Papers API
export const papersApi = {
  search: (filters: IPaperFilters, page = 1, pageSize = 20) => {
    const params = new URLSearchParams()

    if (filters.college?.length) filters.college.forEach(c => params.append('college[]', c))
    if (filters.subject?.length) filters.subject.forEach(s => params.append('subject[]', s))
    if (filters.semester?.length) filters.semester.forEach(s => params.append('semester[]', s))
    if (filters.branch?.length) filters.branch.forEach(b => params.append('branch[]', b))
    if (filters.examType?.length) filters.examType.forEach(e => params.append('examType[]', e))
    if (filters.yearStart) params.append('yearStart', filters.yearStart.toString())
    if (filters.yearEnd) params.append('yearEnd', filters.yearEnd.toString())
    if (filters.sortBy) params.append('sortBy', filters.sortBy)

    params.append('page', page.toString())
    params.append('pageSize', pageSize.toString())

    return fetchWithAuth<IPaginatedResponse<IPaper>>(`/papers?${params.toString()}`)
  },

  getById: (id: string) => fetchWithAuth<IPaper>(`/papers/${id}`),

  getRecommended: () => fetchWithAuth<IPaper[]>('/papers?recommended=true'),

  getMyUploads: () => fetchWithAuth<IPaper[]>('/papers/my-uploads'),

  getRelated: (id: string) => fetchWithAuth<IPaper[]>(`/papers/${id}/related`),

  upload: async (file: File): Promise<IApiResponse<IOCRResult>> => {
    const formData = new FormData()
    formData.append('file', file)

    const token = getAuthToken()
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${API_BASE_URL}/papers/upload`, {
        method: 'POST',
        headers,
        body: formData
      })

      const data = await response.json()
      return {
        success: response.ok,
        data: data.data,
        error: data.error,
        message: data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  },

  confirm: (paperId: string, metadata: Partial<IPaper>) =>
    fetchWithAuth<IPaper>(`/papers/${paperId}/confirm`, {
      method: 'POST',
      body: JSON.stringify(metadata)
    }),

  like: (id: string) =>
    fetchWithAuth<{ liked: boolean; likes: number }>(`/papers/${id}/like`, {
      method: 'POST'
    }),

  delete: (id: string) =>
    fetchWithAuth<void>(`/papers/${id}`, {
      method: 'DELETE'
    }),

  report: (id: string, reason: string) =>
    fetchWithAuth<void>(`/papers/${id}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
}

// Topics API
export const topicsApi = {
  search: (filters: ITopicFilters) => {
    const params = new URLSearchParams()
    params.append('college', filters.college)
    params.append('subject', filters.subject)
    params.append('semester', filters.semester)
    params.append('branch', filters.branch)
    params.append('examType', filters.examType)

    return fetchWithAuth<ITopicResult>(`/topics?${params.toString()}`)
  },

  getTop: (filters: Omit<ITopicFilters, 'branch'>) => {
    const params = new URLSearchParams()
    params.append('college', filters.college)
    params.append('subject', filters.subject)
    params.append('semester', filters.semester)
    params.append('examType', filters.examType)

    return fetchWithAuth<ITopicResult>(`/topics/top?${params.toString()}`)
  },

  generatePrompt: (part: 'A' | 'B', examType: string, topics: string[]) =>
    fetchWithAuth<{ prompt: string }>('/topics/prompt', {
      method: 'POST',
      body: JSON.stringify({ part, examType, topics })
    })
}

// Stats API
export const statsApi = {
  getPlatformStats: () => fetchWithAuth<IPlatformStats>('/stats'),

  getColleges: () => fetchWithAuth<string[]>('/stats/colleges'),

  getSubjects: () => fetchWithAuth<string[]>('/stats/subjects'),

  getBranches: () => fetchWithAuth<string[]>('/stats/branches'),
  getSemesters: () => fetchWithAuth<string[]>('/stats/semesters')
}

// Notifications API
export const notificationsApi = {
  getAll: () => fetchWithAuth<INotification[]>('/notifications'),

  markAsRead: (id: string) =>
    fetchWithAuth<void>(`/notifications/${id}/read`, {
      method: 'PUT'
    }),

  markAllAsRead: () =>
    fetchWithAuth<void>('/notifications/read-all', {
      method: 'PUT'
    })
}
