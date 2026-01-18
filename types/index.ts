// types/index.ts

// ============================================
// USER TYPES
// ============================================

export interface IUser {
  _id: string
  name: string
  email: string
  college: string
  branch: string
  semester: string
  profilePicture?: string
  bio?: string
  socialLinks?: {
    linkedin?: string
    github?: string
    twitter?: string
  }
  credits: number
  badges: IBadge[]
  theme: 'simple' | 'modern' | 'tech' | 'nerdy'
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export interface IBadge {
  badgeId: string
  name: string
  icon: string
  description?: string
  requiredCount?: number
  unlockedAt?: Date
}

export interface IUserStats {
  totalUploads: number
  totalLikes: number
  totalViews: number
  badgeCount: number
  rank: number
  credits: number
  badges: IBadge[]
}

// ============================================
// PAPER TYPES
// ============================================

export type ExamType = 'semester' | 'midterm1' | 'midterm2'

export interface IQuestion {
  questionNumber: number
  question: string
  marks: number
  topic: string
}

export interface IPaper {
  _id: string
  uploadedBy: IUser | string
  college: string
  subject: string
  semester: string
  branch: string
  examType: ExamType
  year: number
  month: string
  originalImage: string
  formattedText?: {
    partA: IQuestion[]
    partB: IQuestion[]
  }
  likes: number
  likedBy: string[]
  viewCount: number
  verified: boolean
  flagged: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IPaperFilters {
  college?: string[]
  subject?: string[]
  semester?: string[]
  branch?: string[]
  examType?: string[]
  yearStart?: number
  yearEnd?: number
  sortBy?: 'recent' | 'liked' | 'verified' | 'oldest'
}

export interface IFilters {
  colleges: string[]
  subjects: string[]
  semesters: string[]
  branches: string[]
  examTypes: string[]
  yearRange: { min: number; max: number }
}

// ============================================
// TOPIC TYPES
// ============================================

export interface ITopic {
  name: string
  count: number
  lastOccurred: Date
  papers?: string[]
}

export interface ITopicFilters {
  college: string
  subject: string
  semester: string
  branch: string
  examType: string
}

export interface ITopicResult {
  partA: {
    topics: ITopic[]
    total: number
  }
  partB: {
    topics: ITopic[]
    total: number
  }
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'like' | 'comment' | 'badge' | 'verify' | 'system'

export interface INotification {
  _id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  link?: string
  createdAt: Date
}

// ============================================
// LEADERBOARD TYPES
// ============================================

export interface ILeaderboardEntry {
  rank: number
  user: {
    _id: string
    name: string
    profilePicture?: string
    college: string
  }
  totalUploads: number
  totalLikes: number
  badges: IBadge[]
}

// ============================================
// STATISTICS TYPES
// ============================================

export interface IPlatformStats {
  totalUsers: number
  totalColleges: number
  totalPapers: number
  totalTopics: number
}

// ============================================
// AUTH TYPES
// ============================================

export interface ILoginCredentials {
  email: string
  password: string
}

export interface IRegisterData {
  name: string
  email: string
  password: string
  college: string
  branch: string
  semester: string
}

export interface IAuthResponse {
  user: IUser
  token: string
}

// ============================================
// OCR TYPES
// ============================================

export interface IOCRMetadata {
  college: string
  subject: string
  semester: string
  branch: string
  examType: ExamType
  year: number
  month: string
  confidence: {
    college: number
    subject: number
    semester: number
    branch: number
    examType: number
    year: number
    month: number
  }
}

export interface IOCRResult {
  paperId: string
  metadata: IOCRMetadata
  formattedText: {
    partA: IQuestion[]
    partB: IQuestion[]
  }
  originalImage: string
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface IApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface IPaginatedResponse<T> {
  data: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================
// ADMIN TYPES
// ============================================

export interface IFlaggedPaper extends IPaper {
  flagReason: string
  flaggedBy: string
  flaggedAt: Date
  reviewStatus: 'pending' | 'approved' | 'rejected'
}

export interface IAdminStats {
  totalUsers: number
  totalPapers: number
  verifiedPapers: number
  flaggedPapers: number
  activeToday: number
  newUsersThisWeek: number
}

// ============================================
// FORM TYPES
// ============================================

export interface IUploadFormData {
  college: string
  subject: string
  semester: string
  branch: string
  examType: ExamType
  year: number
  month: string
}

export interface IProfileFormData {
  name: string
  bio: string
  linkedinUrl?: string
  githubUrl?: string
  twitterUrl?: string
}

export interface IPasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// ============================================
// UI TYPES
// ============================================

export type Theme = 'simple' | 'modern' | 'tech' | 'nerdy'

export interface IUIPreferences {
  theme: Theme
  notifications: {
    likes: boolean
    comments: boolean
    badges: boolean
    weekly: boolean
  }
  privacy: {
    profileVisible: boolean
    showStats: boolean
  }
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface IPaperCardProps {
  paper: IPaper
  index?: number
  onLike?: (paperId: string) => void
  onDelete?: (paperId: string) => void
}

export interface ITopicsListProps {
  topics: ITopic[]
  part: 'A' | 'B'
  examType: ExamType
  onCopyPrompt?: () => void
  onExport?: (format: 'pdf' | 'csv' | 'json') => void
}

export interface IBadgeCardProps {
  badge: IBadge
  isUnlocked: boolean
  progress?: number
}

// ============================================
// UTILITY TYPES
// ============================================

export type SortOrder = 'asc' | 'desc'

export type FilterOption<T> = {
  value: T
  label: string
  count?: number
}

export type PaginationParams = {
  page: number
  pageSize: number
}

export type DateRange = {
  start: Date
  end: Date
}

// ============================================
// EXPORT DEFAULT TYPES
// ============================================

export type {
  // Re-export all main types for convenience
  IUser as User,
  IPaper as Paper,
  ITopic as Topic,
  INotification as Notification,
  IBadge as Badge,
}