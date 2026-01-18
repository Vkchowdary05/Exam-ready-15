'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { currentUser, samplePapers, sampleTopics, badges } from '@/lib/mock-data'
import {
  Upload,
  Search,
  BookOpen,
  TrendingUp,
  Heart,
  Eye,
  Award,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
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
  color
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  change?: string
  color: string
}) {
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

// Paper Card Component
function PaperCard({ paper }: { paper: typeof samplePapers[0] }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-card rounded-xl border border-border p-4 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group"
    >
      <Link href={`/papers/${paper._id}`}>
        <div className="flex items-start justify-between mb-3">
          <Badge variant="secondary" className="text-xs">
            {paper.examType === 'semester' ? 'Semester' : `Midterm ${paper.examType.slice(-1)}`}
          </Badge>
          {paper.verified && (
            <Badge className="bg-green-500/10 text-green-600 text-xs">Verified</Badge>
          )}
        </div>
        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {paper.subject}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          {paper.college.split(' - ')[0]} • {paper.semester} Sem
        </p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {paper.likes}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {paper.viewCount}
            </span>
          </div>
          <span>{paper.year}</span>
        </div>
      </Link>
    </motion.div>
  )
}

// Topic Item Component
function TopicItem({ topic, rank }: { topic: typeof sampleTopics[0]; rank: number }) {
  const getColor = () => {
    if (topic.count >= 40) return 'bg-red-500'
    if (topic.count >= 30) return 'bg-orange-500'
    return 'bg-blue-500'
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{topic.name}</p>
      </div>
      <Badge className={`${getColor()} text-white text-xs`}>
        {topic.count}
      </Badge>
    </div>
  )
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const user = currentUser
  const recentPapers = samplePapers.slice(0, 3)
  const trendingTopics = sampleTopics.slice(0, 5)

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
              Welcome back, {user.name.split(' ')[0]}!
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
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[140px] rounded-xl" />
            ))
          ) : (
            <>
              <StatCard
                icon={FileText}
                label="Papers Uploaded"
                value={user.badges.length * 5}
                change="+3 this week"
                color="bg-blue-500"
              />
              <StatCard
                icon={Heart}
                label="Total Likes"
                value={142}
                change="+12%"
                color="bg-pink-500"
              />
              <StatCard
                icon={Sparkles}
                label="Credits Earned"
                value={user.credits}
                color="bg-purple-500"
              />
              <StatCard
                icon={Award}
                label="Badges Earned"
                value={user.badges.length}
                color="bg-amber-500"
              />
            </>
          )}
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
          {/* Recommended Papers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recommended for You</CardTitle>
                  <CardDescription>Papers matching your profile</CardDescription>
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
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentPapers.map((paper) => (
                      <PaperCard key={paper._id} paper={paper} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Trending Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Trending Topics</CardTitle>
                  <CardDescription>Most asked questions</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/search/topics">
                    View all
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="px-2 pb-2">
                    {trendingTopics.map((topic, index) => (
                      <TopicItem key={topic.name} topic={topic} rank={index + 1} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
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
                {badges.slice(0, 6).map((badge, index) => {
                  const isUnlocked = index < user.badges.length
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
