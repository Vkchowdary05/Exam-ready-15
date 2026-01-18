'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Shield,
  Users,
  FileText,
  Flag,
  TrendingUp,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Trash2,
  UserX,
  Activity,
  AlertTriangle,
  BarChart3
} from 'lucide-react'
import { samplePapers } from '@/lib/mock-data'

// Mock admin data
const mockAdminStats = {
  totalUsers: 12847,
  totalPapers: 48932,
  verifiedPapers: 42108,
  flaggedPapers: 23,
  activeToday: 1248,
  newUsersThisWeek: 342
}

const mockFlaggedPapers = samplePapers.slice(0, 5).map(paper => ({
  ...paper,
  flagReason: 'Inappropriate content',
  flaggedBy: 'user-123',
  flaggedAt: new Date(),
  reviewStatus: 'pending' as const
}))

const mockUsers = Array.from({ length: 20 }, (_, i) => ({
  _id: `user-${i}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  college: 'MIT',
  role: i === 0 ? 'admin' : 'user',
  status: i % 4 === 0 ? 'banned' : 'active',
  uploads: Math.floor(Math.random() * 50),
  joinedAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
}))

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'banned'>('all')

  const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = userFilter === 'all' || user.status === userFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users, content, and platform settings
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <Activity className="w-4 h-4" />
          System Healthy
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="flagged">
            Flagged Papers
            {mockFlaggedPapers.length > 0 && (
              <Badge className="ml-2 bg-red-500">{mockFlaggedPapers.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            <StatCard
              icon={Users}
              label="Total Users"
              value={mockAdminStats.totalUsers}
              trend="+342 this week"
              color="bg-blue-500"
            />
            <StatCard
              icon={FileText}
              label="Total Papers"
              value={mockAdminStats.totalPapers}
              trend="+128 this week"
              color="bg-purple-500"
            />
            <StatCard
              icon={CheckCircle}
              label="Verified Papers"
              value={mockAdminStats.verifiedPapers}
              color="bg-green-500"
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start gap-2">
                  <Flag className="w-4 h-4" />
                  Review Flagged Content ({mockFlaggedPapers.length})
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Users className="w-4 h-4" />
                  Manage User Roles
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <BarChart3 className="w-4 h-4" />
                  View Analytics
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  System Health Check
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: 'New user registered', user: 'alex@example.com', time: '5 mins ago' },
                  { action: 'Paper verified', paper: 'DSA Semester Exam 2024', time: '12 mins ago' },
                  { action: 'Content flagged', paper: 'DBMS Midterm', time: '1 hour ago' },
                  { action: 'Badge unlocked', user: 'sarah@example.com', time: '2 hours ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="font-medium text-foreground">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.user || activity.paper}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flagged Papers Tab */}
        <TabsContent value="flagged" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-600" />
                Flagged Papers for Review
              </CardTitle>
              <CardDescription>
                Review and moderate flagged content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mockFlaggedPapers.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">All Clear!</h3>
                  <p className="text-muted-foreground">No flagged papers to review</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockFlaggedPapers.map((paper) => (
                    <motion.div
                      key={paper._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">{paper.subject}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary">{paper.examType}</Badge>
                            <span>•</span>
                            <span>{paper.college}</span>
                          </div>
                        </div>
                        <Badge variant="destructive">Flagged</Badge>
                      </div>
                      
                      <div className="mb-4 p-3 bg-background rounded-lg">
                        <p className="text-sm font-medium text-foreground mb-1">Flag Reason:</p>
                        <p className="text-sm text-muted-foreground">Inappropriate content</p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                          Review Paper
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2 text-green-600 border-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2 text-red-600 border-red-600">
                          <XCircle className="w-4 h-4" />
                          Reject & Remove
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={userFilter} onValueChange={(v: any) => setUserFilter(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-3 bg-muted text-sm font-medium text-muted-foreground">
                  <div className="col-span-4">User</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Uploads</div>
                  <div className="col-span-2">Actions</div>
                </div>
                <div className="divide-y divide-border">
                  {filteredUsers.map((user, index) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-muted/30 transition-colors"
                    >
                      <div className="col-span-4">
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="col-span-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'}>
                          {user.status}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm font-medium">{user.uploads}</span>
                      </div>
                      <div className="col-span-2 flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {user.status === 'active' ? (
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <UserX className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" className="text-green-600">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Platform Analytics
              </CardTitle>
              <CardDescription>Insights and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed analytics and charts would be displayed here
                </p>
                <p className="text-sm text-muted-foreground">
                  Integration with analytics service pending
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}