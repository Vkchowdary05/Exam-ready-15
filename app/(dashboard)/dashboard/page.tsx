'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-store'
import { papersApi, usersApi, statsApi } from '@/lib/api'
import { badges as defaultBadges } from '@/lib/mock-data'
import type { IPaper, IUserStats, IPlatformStats } from '@/types'
import {
  Upload,
  Search,
  BookOpen,
  TrendingUp,
  Heart,
  Eye,
  Award,
  FileText,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Loader2,
} from 'lucide-react'

// Loading Component
function Loading() {
  return null
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  change,
  color,
  loading = false
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  change?: string
  color: string
  loading?: boolean
}) {
  if (loading) {
    return <Skeleton className="h-[140px] rounded-xl" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <Badge variant="secondary" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            {change}
          </Badge>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </div>
    </motion.div>
  )
}

import { PaperCard } from '@/components/papers/paper-card'

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [recentPapers, setRecentPapers] = useState<IPaper[]>([])
  const [userStats, setUserStats] = useState<IUserStats | null>(null)
  const [platformStats, setPlatformStats] = useState<IPlatformStats | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Fetch data in parallel
        const [papersRes, statsRes, platformRes] = await Promise.all([
          papersApi.search({}, 1, 6),
          isAuthenticated ? usersApi.getStats() : Promise.resolve({ success: false }),
          statsApi.getPlatformStats()
        ])

        // Handle papers response
        if (papersRes.success && papersRes.data) {
          const data = papersRes.data as any
          if (Array.isArray(data)) {
            setRecentPapers(data.slice(0, 3))
          } else if (data.data && Array.isArray(data.data)) {
            setRecentPapers(data.data.slice(0, 3))
          }
        }

        // Handle user stats
        if (statsRes.success && statsRes.data) {
          setUserStats(statsRes.data)
        }

        // Handle platform stats
        if (platformRes.success && platformRes.data) {
          setPlatformStats(platformRes.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAuthenticated])

  const displayName = user?.name?.split(' ')[0] || 'there'
  const userCredits = user?.credits || userStats?.totalUploads ? (userStats?.totalUploads || 0) * 10 : 0
  const userBadgeCount = user?.badges?.length || userStats?.badgeCount || 0

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Welcome back, {displayName}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your exam preparation today.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/search/papers">
                <Search className="w-4 h-4 mr-2" />
                Search Papers
              </Link>
            </Button>
            <Button asChild>
              <Link href="/upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload Paper
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Papers Uploaded"
            value={userStats?.totalUploads || 0}
            loading={isLoading}
            color="bg-blue-500"
          />
          <StatCard
            icon={Heart}
            label="Total Likes"
            value={userStats?.totalLikes || 0}
            loading={isLoading}
            color="bg-pink-500"
          />
          <StatCard
            icon={Sparkles}
            label="Credits Earned"
            value={user?.credits || userCredits}
            loading={isLoading}
            color="bg-purple-500"
          />
          <StatCard
            icon={Award}
            label="Badges Earned"
            value={userBadgeCount}
            loading={isLoading}
            color="bg-amber-500"
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common tasks to help you get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/upload" className="group">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Upload Paper</p>
                      <p className="text-sm text-muted-foreground">Share exam papers</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
                <Link href="/search/papers" className="group">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                      <Search className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Search Papers</p>
                      <p className="text-sm text-muted-foreground">Find past papers</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
                <Link href="/search/topics" className="group">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                      <BookOpen className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Find Topics</p>
                      <p className="text-sm text-muted-foreground">Important topics</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Papers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Papers</CardTitle>
                  <CardDescription>Recently uploaded papers</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/search/papers">
                    View all
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-[160px] rounded-xl" />
                    ))}
                  </div>
                ) : recentPapers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-foreground mb-2">No papers yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Be the first to upload an exam paper!
                    </p>
                    <Button asChild>
                      <Link href="/upload">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Paper
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentPapers.map((paper) => (
                      <PaperCard key={paper._id} paper={paper} variant="minimal" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Platform Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Stats</CardTitle>
                <CardDescription>Our growing community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <>
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-12 rounded-lg" />
                    ))}
                  </>
                ) : platformStats ? (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground">Total Users</span>
                      <span className="font-bold text-foreground">{platformStats.totalUsers?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground">Total Papers</span>
                      <span className="font-bold text-foreground">{platformStats.totalPapers?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground">Colleges</span>
                      <span className="font-bold text-foreground">{platformStats.totalColleges?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground">Topics Analyzed</span>
                      <span className="font-bold text-foreground">{platformStats.totalTopics?.toLocaleString() || 0}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Unable to load platform stats
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Badges</CardTitle>
              <CardDescription>Achievements you've unlocked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {defaultBadges.slice(0, 6).map((badge, index) => {
                  const isUnlocked = index < (user?.badges?.length || 0)
                  return (
                    <div
                      key={badge.badgeId}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${isUnlocked
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border bg-muted/30 opacity-50'
                        }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isUnlocked ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                        <Award className={`w-7 h-7 ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <span className="text-xs font-medium text-center">{badge.name}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Suspense>
  )
}
