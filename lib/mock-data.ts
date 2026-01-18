import type {
  IUser,
  IPaper,
  ITopic,
  IBadge,
  INotification,
  IPlatformStats,
  ILeaderboardEntry
} from '@/types'

// Platform Stats
export const platformStats: IPlatformStats = {
  totalUsers: 12847,
  totalColleges: 156,
  totalPapers: 48932,
  totalTopics: 8456
}

// Sample Badges
export const badges: IBadge[] = [
  {
    badgeId: 'first-upload',
    name: 'First Upload',
    icon: '/badges/first-upload.svg',
    description: 'Upload your first exam paper',
    requiredCount: 1
  },
  {
    badgeId: 'contributor-10',
    name: 'Active Contributor',
    icon: '/badges/contributor.svg',
    description: 'Upload 10 exam papers',
    requiredCount: 10
  },
  {
    badgeId: 'popular-50',
    name: 'Popular Contributor',
    icon: '/badges/popular.svg',
    description: 'Receive 50 likes on your papers',
    requiredCount: 50
  },
  {
    badgeId: 'verified-5',
    name: 'Trusted Source',
    icon: '/badges/trusted.svg',
    description: 'Have 5 papers verified by admins',
    requiredCount: 5
  },
  {
    badgeId: 'streak-7',
    name: 'Weekly Warrior',
    icon: '/badges/streak.svg',
    description: 'Upload papers for 7 consecutive days',
    requiredCount: 7
  },
  {
    badgeId: 'top-college',
    name: 'College Champion',
    icon: '/badges/champion.svg',
    description: 'Be the top contributor from your college',
    requiredCount: 1
  }
]

// Sample User
export const currentUser: IUser = {
  _id: 'user-1',
  name: 'Alex Johnson',
  email: 'alex@university.edu',
  college: 'MIT - Massachusetts Institute of Technology',
  branch: 'Computer Science',
  semester: '6th',
  profilePicture: '/avatars/alex.jpg',
  bio: 'CS student passionate about sharing knowledge and helping peers succeed in exams.',
  socialLinks: {
    linkedin: 'https://linkedin.com/in/alexjohnson',
    github: 'https://github.com/alexj'
  },
  credits: 1250,
  badges: [badges[0], badges[1]],
  theme: 'modern',
  role: 'user',
  createdAt: new Date('2024-08-15'),
  updatedAt: new Date()
}

// Sample Papers
export const samplePapers: IPaper[] = [
  {
    _id: 'paper-1',
    uploadedBy: currentUser,
    college: 'MIT - Massachusetts Institute of Technology',
    subject: 'Data Structures & Algorithms',
    semester: '3rd',
    branch: 'Computer Science',
    examType: 'semester',
    year: 2024,
    month: 'December',
    originalImage: '/papers/dsa-2024.jpg',
    formattedText: {
      partA: [
        { questionNumber: 1, question: 'Define Big-O notation', marks: 2, topic: 'Asymptotic Analysis' },
        { questionNumber: 2, question: 'What is a binary search tree?', marks: 2, topic: 'Trees' },
        { questionNumber: 3, question: 'Explain hashing', marks: 2, topic: 'Hashing' }
      ],
      partB: [
        { questionNumber: 1, question: 'Implement quicksort with analysis', marks: 10, topic: 'Sorting Algorithms' },
        { questionNumber: 2, question: 'Explain Dijkstra algorithm', marks: 10, topic: 'Graph Algorithms' }
      ]
    },
    likes: 142,
    likedBy: ['user-2', 'user-3'],
    viewCount: 1580,
    verified: true,
    flagged: false,
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date()
  },
  {
    _id: 'paper-2',
    uploadedBy: 'user-2',
    college: 'Stanford University',
    subject: 'Database Management Systems',
    semester: '4th',
    branch: 'Computer Science',
    examType: 'midterm1',
    year: 2024,
    month: 'October',
    originalImage: '/papers/dbms-2024.jpg',
    formattedText: {
      partA: [
        { questionNumber: 1, question: 'Define ACID properties', marks: 2, topic: 'Transaction Management' },
        { questionNumber: 2, question: 'What is normalization?', marks: 2, topic: 'Normalization' }
      ],
      partB: [
        { questionNumber: 1, question: 'Explain B+ tree indexing', marks: 10, topic: 'Indexing' }
      ]
    },
    likes: 89,
    likedBy: ['user-1'],
    viewCount: 945,
    verified: true,
    flagged: false,
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date()
  },
  {
    _id: 'paper-3',
    uploadedBy: 'user-3',
    college: 'Harvard University',
    subject: 'Operating Systems',
    semester: '5th',
    branch: 'Computer Science',
    examType: 'semester',
    year: 2024,
    month: 'May',
    originalImage: '/papers/os-2024.jpg',
    formattedText: {
      partA: [
        { questionNumber: 1, question: 'Define deadlock', marks: 2, topic: 'Deadlock' },
        { questionNumber: 2, question: 'What is virtual memory?', marks: 2, topic: 'Memory Management' }
      ],
      partB: [
        { questionNumber: 1, question: 'Explain page replacement algorithms', marks: 10, topic: 'Memory Management' }
      ]
    },
    likes: 67,
    likedBy: [],
    viewCount: 723,
    verified: false,
    flagged: false,
    createdAt: new Date('2024-05-20'),
    updatedAt: new Date()
  }
]

// Sample Topics
export const sampleTopics: ITopic[] = [
  { name: 'Sorting Algorithms', count: 45, lastOccurred: new Date('2024-12-20'), papers: ['paper-1'] },
  { name: 'Binary Trees', count: 38, lastOccurred: new Date('2024-12-15'), papers: ['paper-1', 'paper-2'] },
  { name: 'Graph Algorithms', count: 34, lastOccurred: new Date('2024-12-10'), papers: ['paper-1'] },
  { name: 'Dynamic Programming', count: 31, lastOccurred: new Date('2024-11-28'), papers: ['paper-2'] },
  { name: 'Hashing', count: 28, lastOccurred: new Date('2024-11-20'), papers: ['paper-1', 'paper-3'] },
  { name: 'Linked Lists', count: 25, lastOccurred: new Date('2024-11-15'), papers: ['paper-2'] },
  { name: 'Stack and Queue', count: 22, lastOccurred: new Date('2024-11-10'), papers: ['paper-3'] },
  { name: 'Recursion', count: 19, lastOccurred: new Date('2024-10-28'), papers: ['paper-1'] }
]

// Sample Notifications
export const sampleNotifications: INotification[] = [
  {
    _id: 'notif-1',
    type: 'like',
    title: 'New Like',
    message: 'Your DSA paper received a new like!',
    read: false,
    link: '/papers/paper-1',
    createdAt: new Date()
  },
  {
    _id: 'notif-2',
    type: 'badge',
    title: 'Badge Unlocked!',
    message: 'You earned the "Active Contributor" badge!',
    read: false,
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    _id: 'notif-3',
    type: 'system',
    title: 'Welcome to Exam Ready',
    message: 'Start by uploading your first exam paper!',
    read: true,
    link: '/upload',
    createdAt: new Date(Date.now() - 172800000)
  }
]

// Sample Leaderboard
export const sampleLeaderboard: ILeaderboardEntry[] = [
  {
    rank: 1,
    user: { _id: 'user-10', name: 'Sarah Chen', profilePicture: '/avatars/sarah.jpg', college: 'MIT' },
    totalUploads: 156,
    totalLikes: 2340,
    badges: badges.slice(0, 5)
  },
  {
    rank: 2,
    user: { _id: 'user-11', name: 'James Wilson', profilePicture: '/avatars/james.jpg', college: 'Stanford' },
    totalUploads: 134,
    totalLikes: 1980,
    badges: badges.slice(0, 4)
  },
  {
    rank: 3,
    user: { _id: 'user-12', name: 'Emily Parker', profilePicture: '/avatars/emily.jpg', college: 'Harvard' },
    totalUploads: 128,
    totalLikes: 1756,
    badges: badges.slice(0, 4)
  }
]

// Dropdown Options
export const collegeOptions = [
  'MIT - Massachusetts Institute of Technology',
  'Stanford University',
  'Harvard University',
  'UC Berkeley',
  'Carnegie Mellon University',
  'Georgia Tech',
  'University of Michigan',
  'Cornell University',
  'Princeton University',
  'Yale University'
]

export const branchOptions = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Biotechnology',
  'Aerospace Engineering'
]

export const semesterOptions = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']

export const subjectOptions = [
  'Data Structures & Algorithms',
  'Database Management Systems',
  'Operating Systems',
  'Computer Networks',
  'Software Engineering',
  'Machine Learning',
  'Artificial Intelligence',
  'Web Development',
  'Compiler Design',
  'Computer Architecture'
]

export const examTypeOptions: { value: string; label: string }[] = [
  { value: 'semester', label: 'Semester Exam' },
  { value: 'midterm1', label: 'Midterm 1' },
  { value: 'midterm2', label: 'Midterm 2' }
]

// Testimonials
export const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Computer Science, 4th Year',
    college: 'IIT Delhi',
    avatar: '/avatars/priya.jpg',
    content: 'Exam Ready completely changed how I prepare for exams. The topic frequency analysis helped me focus on what matters most. Scored 9.2 GPA last semester!'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Electrical Engineering, 3rd Year',
    college: 'Stanford University',
    avatar: '/avatars/michael.jpg',
    content: 'The OCR feature is incredibly accurate. I uploaded 20 papers and the extracted topics were spot on. This platform is a game-changer for students.'
  },
  {
    id: 3,
    name: 'Emma Williams',
    role: 'Information Technology, 2nd Year',
    college: 'MIT',
    avatar: '/avatars/emma.jpg',
    content: 'Love the gamification! Earning badges while helping others is so motivating. The community here is supportive and the papers are high quality.'
  }
]

// How It Works Steps
export const howItWorksSteps = [
  {
    step: 1,
    title: 'Upload Papers',
    description: 'Snap a photo or upload PDF of your exam papers. Our AI extracts all the important details automatically.',
    icon: 'Upload'
  },
  {
    step: 2,
    title: 'AI Extraction',
    description: 'Advanced OCR technology identifies questions, topics, and metadata with high accuracy.',
    icon: 'Sparkles'
  },
  {
    step: 3,
    title: 'Discover Topics',
    description: 'Search by subject to find frequently repeated topics and focus your preparation.',
    icon: 'Search'
  },
  {
    step: 4,
    title: 'Ace Your Exams',
    description: 'Study smarter with AI-generated prompts and topic summaries. Share and earn rewards!',
    icon: 'Trophy'
  }
]

// Features
export const features = [
  {
    title: 'Smart OCR Extraction',
    description: 'Our AI accurately extracts questions, topics, and metadata from uploaded exam papers.',
    icon: 'Scan'
  },
  {
    title: 'Topic Frequency Analysis',
    description: 'Discover which topics appear most frequently across years and focus your study time.',
    icon: 'BarChart3'
  },
  {
    title: 'Collaborative Library',
    description: 'Access thousands of papers shared by students from colleges worldwide.',
    icon: 'Users'
  },
  {
    title: 'AI Study Prompts',
    description: 'Generate comprehensive study guides and answers using AI for any topic.',
    icon: 'Bot'
  },
  {
    title: 'Gamified Learning',
    description: 'Earn badges, climb leaderboards, and unlock rewards as you contribute.',
    icon: 'Award'
  },
  {
    title: 'Multi-format Export',
    description: 'Download papers and topics as PDF, CSV, or JSON for offline studying.',
    icon: 'Download'
  }
]

// Export aliases for compatibility
export const mockPapers = samplePapers
export const mockColleges = collegeOptions
export const mockSubjects = subjectOptions
export const mockBranches = branchOptions
