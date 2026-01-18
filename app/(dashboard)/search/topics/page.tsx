'use client'

import { useState, useEffect } from 'react'
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
import { topicsApi, statsApi } from '@/lib/api'
import { Search, TrendingUp, FileText, Loader2, AlertCircle, Copy, Check } from 'lucide-react'
import type { ITopicFilters, ITopicResult } from '@/types'
import { toast } from 'sonner'

const topicSearchSchema = z.object({
  college: z.string().min(1, 'Please select a college'),
  subject: z.string().min(1, 'Please select a subject'),
  semester: z.string().min(1, 'Please select a semester'),
  branch: z.string().min(1, 'Please select a branch'),
  examType: z.string().min(1, 'Please select an exam type'),
})

type TopicSearchFormData = z.infer<typeof topicSearchSchema>

const semesterOptions = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8']
const examTypeOptions = [
  { value: 'semester', label: 'Semester Exam' },
  { value: 'midterm1', label: 'Midterm 1' },
  { value: 'midterm2', label: 'Midterm 2' },
]

export default function SearchTopicsPage() {
  const router = useRouter()
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState<ITopicResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Dynamic filter options from API
  const [collegeOptions, setCollegeOptions] = useState<string[]>([])
  const [subjectOptions, setSubjectOptions] = useState<string[]>([])
  const [branchOptions, setBranchOptions] = useState<string[]>([])
  const [optionsLoading, setOptionsLoading] = useState(true)

  // Fetch filter options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      setOptionsLoading(true)
      try {
        const [collegesRes, subjectsRes, branchesRes] = await Promise.all([
          statsApi.getColleges(),
          statsApi.getSubjects(),
          statsApi.getBranches()
        ])

        if (collegesRes.success && collegesRes.data) {
          setCollegeOptions(collegesRes.data)
        }
        if (subjectsRes.success && subjectsRes.data) {
          setSubjectOptions(subjectsRes.data)
        }
        if (branchesRes.success && branchesRes.data) {
          setBranchOptions(branchesRes.data)
        }
      } catch (err) {
        console.error('Error fetching filter options:', err)
      } finally {
        setOptionsLoading(false)
      }
    }

    fetchOptions()
  }, [])

  const {
    control,
    handleSubmit,
    getValues,
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
    setError(null)

    try {
      // Exclude branch for top topics aggregation
      // We want topics for this Subject/Semester/ExamType across ALL branches (or specific if strictly filtered, 
      // but new endpoint aggregates). 
      // The getTop endpoint expects: college, subject, semester, examType
      const { branch, ...filters } = {
        college: data.college,
        subject: data.subject,
        semester: data.semester,
        branch: data.branch,
        examType: data.examType,
      }

      const response = await topicsApi.getTop(filters)

      if (response.success && response.data) {
        setResults(response.data)
        setHasSearched(true)
      } else {
        setError(response.error || 'Failed to search topics')
        setResults(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setResults(null)
    } finally {
      setIsSearching(false)
      setHasSearched(true)
    }
  }

  const viewAllTopics = (part: 'A' | 'B') => {
    const values = getValues()
    const params = new URLSearchParams()
    Object.entries(values).forEach(([key, value]) => {
      if (value) params.append(key, value as string)
    })
    params.append('part', part)
    router.push(`/topics?${params.toString()}`)
  }

  const generateLLMPrompt = () => {
    if (!results) return

    const values = getValues()
    const isSemester = values.examType === 'semester'
    const isMidterm = values.examType === 'midterm1' || values.examType === 'midterm2'

    const prompt = {
      context: {
        subject: values.subject,
        semester: values.semester,
        branch: values.branch,
        college: values.college,
        examType: values.examType === 'semester' ? 'Semester Exam' : values.examType === 'midterm1' ? 'Midterm 1' : 'Midterm 2'
      },
      instructions: `You are an expert teacher. Answer the following exam topics for ${values.subject}. Follow these STRICT rules:\n\n**PART-A (Short Answer Questions):**\n- Each answer should be exactly 20 words\n- Be concise and to the point\n\n**PART-B (Long Answer Questions):**\n${isMidterm
        ? '- Each answer should be approximately 250 words\n- Include ONE practical example\n- Include ONE diagram (describe it in text format like [DIAGRAM: description])'
        : '- Each answer should be approximately 400 words\n- Include ONE practical example\n- Include ONE detailed diagram (describe it in text format like [DIAGRAM: description])'}`,
      partA: {
        title: 'Part-A Topics (Short Answer - 20 words each)',
        topics: results.partA.topics.map(t => t.name)
      },
      partB: {
        title: `Part-B Topics (Long Answer - ${isMidterm ? '250' : '400'} words each with example and diagram)`,
        topics: results.partB.topics.map(t => t.name)
      }
    }

    const promptText = JSON.stringify(prompt, null, 2)

    navigator.clipboard.writeText(promptText).then(() => {
      setCopied(true)
      toast.success('Prompt copied to clipboard! Paste it in ChatGPT, Gemini, or any LLM.')
      setTimeout(() => setCopied(false), 3000)
    }).catch(() => {
      toast.error('Failed to copy to clipboard')
    })
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
                        <SelectValue placeholder={optionsLoading ? "Loading..." : "Select college"} />
                      </SelectTrigger>
                      <SelectContent>
                        {collegeOptions.length === 0 && !optionsLoading ? (
                          <SelectItem value="no-data" disabled>No colleges found</SelectItem>
                        ) : (
                          collegeOptions.map((college) => (
                            <SelectItem key={college} value={college}>
                              {college}
                            </SelectItem>
                          ))
                        )}
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
                        <SelectValue placeholder={optionsLoading ? "Loading..." : "Select subject"} />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectOptions.length === 0 && !optionsLoading ? (
                          <SelectItem value="no-data" disabled>No subjects found</SelectItem>
                        ) : (
                          subjectOptions.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))
                        )}
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
                        <SelectValue placeholder={optionsLoading ? "Loading..." : "Select branch"} />
                      </SelectTrigger>
                      <SelectContent>
                        {branchOptions.length === 0 && !optionsLoading ? (
                          <SelectItem value="no-data" disabled>No branches found</SelectItem>
                        ) : (
                          branchOptions.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))
                        )}
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

      {/* Error State */}
      {error && hasSearched && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

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
              {results.partA.topics.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No topics found for this combination</p>
              ) : (
                <div className="space-y-2 mb-4 max-h-[500px] overflow-y-auto pr-2">
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
                          ${topic.count >= 10 ? 'bg-red-500' : ''}
                          ${topic.count >= 5 && topic.count < 10 ? 'bg-orange-500' : ''}
                          ${topic.count < 5 ? 'bg-blue-500' : ''}
                        `}
                      >
                        {topic.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

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
              {results.partB.topics.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No topics found for this combination</p>
              ) : (
                <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto pr-2">
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
                          ${topic.count >= 5 ? 'bg-red-500' : ''}
                          ${topic.count >= 3 && topic.count < 5 ? 'bg-orange-500' : ''}
                          ${topic.count < 3 ? 'bg-blue-500' : ''}
                        `}
                      >
                        {topic.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Copy Prompt Button - Only shows when results have topics */}
      {hasSearched && results && (results.partA.topics.length > 0 || results.partB.topics.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button
            onClick={generateLLMPrompt}
            size="lg"
            variant="outline"
            className="gap-2 border-primary/50 hover:bg-primary/10"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-green-500" />
                Copied! Paste in ChatGPT/Gemini
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy LLM Prompt for Answers
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Empty State - No Search Yet */}
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

      {/* Empty Results State */}
      {hasSearched && results && results.partA.topics.length === 0 && results.partB.topics.length === 0 && (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Topics Found
            </h3>
            <p className="text-muted-foreground max-w-md">
              No topics were found for this combination. Try different filter criteria or upload papers to build the topic database.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}