'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Search,
  Upload,
  Heart,
  Crown,
  Loader2
} from 'lucide-react'
import { usersApi } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import type { ILeaderboardEntry } from '@/types'

export default function LeaderboardPage() {
  const { user: currentUser } = useAuthStore()
  const [filter, setFilter] = useState<'global' | 'college' | 'subject'>('global')
  const [period, setPeriod] = useState<'all' | 'month' | 'week'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [leaderboard, setLeaderboard] = useState<ILeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 50

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await usersApi.getLeaderboard(filter, period)
        if (response.success && response.data) {
          setLeaderboard(response.data)
        } else {
          setError(response.error || 'Failed to load leaderboard')
        }
      } catch (err) {
        setError('Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [filter, period])

  const filteredLeaderboard = leaderboard.filter(entry =>
    entry.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.user?.college?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currentUserRank = currentUser ? leaderboard.findIndex(entry => entry.user?._id === currentUser._id) + 1 : 0

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />
    return null
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30'
    if (rank === 3) return 'bg-gradient-to-r from-orange-600/20 to-red-600/20 border-orange-600/30'
    return 'bg-card border-border'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Top contributors on Exam Ready
          </p>
        </div>

        {currentUserRank > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Your Rank</p>
                  <p className="text-2xl font-bold text-primary">#{currentUserRank}</p>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Uploads</p>
                  <p className="text-lg font-bold text-foreground">
                    {leaderboard[currentUserRank - 1]?.totalUploads || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filter Tabs */}
            <div className="flex-1">
              <Tabs value={filter} onValueChange={(v: any) => setFilter(v)}>
                <TabsList className="w-full">
                  <TabsTrigger value="global" className="flex-1">Global</TabsTrigger>
                  <TabsTrigger value="college" className="flex-1">My College</TabsTrigger>
                  <TabsTrigger value="subject" className="flex-1">By Subject</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Period Select */}
            <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative flex-1 md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
        {/* 2nd Place */}
        {leaderboard[1] && leaderboard[1].user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-3xl font-bold text-white">
                {leaderboard[1].user?.name?.charAt(0) || '?'}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center border-4 border-background">
                <span className="text-xs font-bold text-white">2</span>
              </div>
            </div>
            <p className="font-semibold text-center text-sm mb-1">{leaderboard[1].user?.name || 'Unknown'}</p>
            <p className="text-xs text-muted-foreground mb-2">{leaderboard[1].user?.college || ''}</p>
            <Badge variant="secondary" className="gap-1">
              <Upload className="w-3 h-3" />
              {leaderboard[1].totalUploads}
            </Badge>
          </motion.div>
        )}

        {/* 1st Place */}
        {leaderboard[0] && leaderboard[0].user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center -mt-6"
          >
            <Crown className="w-8 h-8 text-yellow-500 mb-2 animate-bounce" />
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-4xl font-bold text-white border-4 border-yellow-300">
                {leaderboard[0].user?.name?.charAt(0) || '?'}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center border-4 border-background">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="font-bold text-center mb-1">{leaderboard[0].user?.name || 'Unknown'}</p>
            <p className="text-xs text-muted-foreground mb-2">{leaderboard[0].user?.college || ''}</p>
            <Badge className="bg-yellow-500 hover:bg-yellow-600 gap-1">
              <Upload className="w-3 h-3" />
              {leaderboard[0].totalUploads}
            </Badge>
          </motion.div>
        )}

        {/* 3rd Place */}
        {leaderboard[2] && leaderboard[2].user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center text-3xl font-bold text-white">
                {leaderboard[2].user?.name?.charAt(0) || '?'}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center border-4 border-background">
                <span className="text-xs font-bold text-white">3</span>
              </div>
            </div>
            <p className="font-semibold text-center text-sm mb-1">{leaderboard[2].user?.name || 'Unknown'}</p>
            <p className="text-xs text-muted-foreground mb-2">{leaderboard[2].user?.college || ''}</p>
            <Badge variant="secondary" className="gap-1">
              <Upload className="w-3 h-3" />
              {leaderboard[2].totalUploads}
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">User</div>
            <div className="col-span-2 text-center">Uploads</div>
            <div className="col-span-2 text-center">Likes</div>
            <div className="col-span-2 text-center">Badges</div>
            <div className="col-span-1 text-center">Trend</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {filteredLeaderboard.slice(0, itemsPerPage).map((entry, index) => (
              <motion.div
                key={entry.user._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors ${entry.rank <= 3 ? getRankColor(entry.rank) + ' border-l-4' : ''
                  } ${currentUser && entry.user?._id === currentUser._id ? 'bg-primary/5' : ''}`}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center gap-2">
                  {getRankIcon(entry.rank)}
                  <span className={`font-bold ${entry.rank <= 3 ? 'text-lg' : ''}`}>
                    {entry.rank}
                  </span>
                </div>

                {/* User */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {entry.user?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{entry.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{entry.user?.college || ''}</p>
                  </div>
                </div>

                {/* Uploads */}
                <div className="col-span-2 text-center">
                  <Badge variant="secondary" className="gap-1">
                    <Upload className="w-3 h-3" />
                    {entry.totalUploads}
                  </Badge>
                </div>

                {/* Likes */}
                <div className="col-span-2 text-center">
                  <Badge variant="secondary" className="gap-1">
                    <Heart className="w-3 h-3" />
                    {entry.totalLikes}
                  </Badge>
                </div>

                {/* Badges */}
                <div className="col-span-2 text-center">
                  <Badge variant="secondary" className="gap-1">
                    <Award className="w-3 h-3" />
                    {entry.badges?.length || 0}
                  </Badge>
                </div>

                {/* Credits Placeholder */}
                <div className="col-span-1 flex justify-center">
                  <span className="text-sm text-muted-foreground">-</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredLeaderboard.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No users found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}