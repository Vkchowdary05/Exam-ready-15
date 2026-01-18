'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { collegeOptions, branchOptions, semesterOptions, subjectOptions, examTypeOptions } from '@/lib/mock-data'
import { Search, TrendingUp, FileText, Loader2, AlertCircle } from 'lucide-react'
import type { ITopicFilters } from '@/types'

const topicSearchSchema = z.object({
  college: z.string().min(1, 'Please select a college'),
  subject: z.string().min(1, 'Please select a subject'),
  semester: z.string().min(1, 'Please select a semester'),
  branch: z.string().min(1, 'Please select a branch'),
  examType: z.string().min(1, 'Please select an exam type'),
})

type TopicSearchFormData = z.infer<typeof topicSearchSchema>

// Mock topic results
const mockTopicResults = {
  partA: {
    topics: [
      { name: 'Binary Search Trees', count: 45 },
      { name: 'Hashing Techniques', count: 38 },
      { name: 'Sorting Algorithms', count: 34 },
      { name: 'Graph Traversal', count: 31 },
      { name: 'Dynamic Programming', count: 28 },
    ],
    total: 40
  },
  partB: {
    topics: [
      { name: 'Dijkstra\'s Algorithm', count: 22 },
      { name: 'B+ Tree Implementation', count: 19 },
      { name: 'Red-Black Trees', count: 18 },
      { name: 'Greedy Algorithms', count: 16 },
      { name: 'Backtracking', count: 14 },
    ],
    total: 25
  }
}

export default function SearchTopicsPage() {
  const router = useRouter()
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState<typeof mockTopicResults | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<TopicSearchFormData>({
    resolver: zodResolver(topicSearchSchema),
    mode: 'onChange',
    defaultValues: {
      college: '',
      subject: '',
      semester: '',
      branch: '',
      examType: '',
    },
  })

  const onSubmit = async (data: TopicSearchFormData) => {
    setIsSearching(true)
    setHasSearched(false)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // In production, call: topicsApi.search(data)
    setResults(mockTopicResults)
    setHasSearched(true)
    setIsSearching(false)
  }

  const viewAllTopics = (part: 'A' | 'B') => {
    const params = new URLSearchParams()
    Object.entries(control._formValues).forEach(([key, value]) => {
      if (value) params.append(key, value as string)
    })
    params.append('part', part)
    router.push(`/topics?${params.toString()}`)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Find Important Topics</h1>
        <p className="text-muted-foreground mt-1">
          Discover frequently-repeated exam topics to focus your preparation
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Criteria
          </CardTitle>
          <CardDescription>
            All fields are required to analyze topic frequency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* College */}
              <div className="space-y-2">
                <Label>College *</Label>
                <Controller
                  name="college"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select college" />
                      </SelectTrigger>
                      <SelectContent>
                        {collegeOptions.map((college) => (
                          <SelectItem key={college} value={college}>
                            {college}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.college && (
                  <p className="text-sm text-destructive">{errors.college.message}</p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectOptions.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subject && (
                  <p className="text-sm text-destructive">{errors.subject.message}</p>
                )}
              </div>

              {/* Semester */}
              <div className="space-y-2">
                <Label>Semester *</Label>
                <Controller
                  name="semester"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesterOptions.map((sem) => (
                          <SelectItem key={sem} value={sem}>
                            {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.semester && (
                  <p className="text-sm text-destructive">{errors.semester.message}</p>
                )}
              </div>

              {/* Branch */}
              <div className="space-y-2">
                <Label>Branch *</Label>
                <Controller
                  name="branch"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branchOptions.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.branch && (
                  <p className="text-sm text-destructive">{errors.branch.message}</p>
                )}
              </div>

              {/* Exam Type */}
              <div className="space-y-2 md:col-span-2">
                <Label>Exam Type *</Label>
                <Controller
                  name="examType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam type" />
                      </SelectTrigger>
                      <SelectContent>
                        {examTypeOptions.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.examType && (
                  <p className="text-sm text-destructive">{errors.examType.message}</p>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full gap-2" 
              size="lg"
              disabled={!isValid || isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Topics...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search Topics
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Part A Topics */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Part-A Topics
                  </CardTitle>
                  <CardDescription>Short answer questions</CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  {results.partA.total}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 mb-6">
                {results.partA.topics.map((topic, index) => (
                  <div 
                    key={topic.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-foreground">{topic.name}</span>
                    </div>
                    <Badge 
                      className={`
                        ${topic.count >= 40 ? 'bg-red-500' : ''}
                        ${topic.count >= 30 && topic.count < 40 ? 'bg-orange-500' : ''}
                        ${topic.count < 30 ? 'bg-blue-500' : ''}
                      `}
                    >
                      {topic.count}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => viewAllTopics('A')}
              >
                View All {results.partA.total} Topics
                <TrendingUp className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Part B Topics */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    Part-B Topics
                  </CardTitle>
                  <CardDescription>Long answer questions</CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  {results.partB.total}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 mb-6">
                {results.partB.topics.map((topic, index) => (
                  <div 
                    key={topic.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-foreground">{topic.name}</span>
                    </div>
                    <Badge 
                      className={`
                        ${topic.count >= 20 ? 'bg-red-500' : ''}
                        ${topic.count >= 15 && topic.count < 20 ? 'bg-orange-500' : ''}
                        ${topic.count < 15 ? 'bg-blue-500' : ''}
                      `}
                    >
                      {topic.count}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => viewAllTopics('B')}
              >
                View All {results.partB.total} Topics
                <TrendingUp className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!hasSearched && !isSearching && (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Select Criteria to Begin
            </h3>
            <p className="text-muted-foreground max-w-md">
              Fill in all required fields above and click "Search Topics" to discover frequently-repeated exam topics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}