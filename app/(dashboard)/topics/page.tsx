'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Copy,
  Check,
  Download,
  FileText,
  BarChart3,
  Sparkles,
  Home,
  ChevronRight,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

// Mock full topics data
const mockFullTopics = {
  partA: Array.from({ length: 40 }, (_, i) => ({
    name: `Topic ${i + 1} - Part A`,
    count: Math.floor(Math.random() * 45) + 5,
    studied: false
  })).sort((a, b) => b.count - a.count),
  partB: Array.from({ length: 25 }, (_, i) => ({
    name: `Topic ${i + 1} - Part B`,
    count: Math.floor(Math.random() * 22) + 5,
    studied: false
  })).sort((a, b) => b.count - a.count)
}

export default function TopicsViewPage() {
  const searchParams = useSearchParams()
  const [topics, setTopics] = useState(mockFullTopics)
  const [sortBy, setSortBy] = useState<'count' | 'alpha'>('count')
  const [filterLimit, setFilterLimit] = useState<'all' | '10' | '20'>('all')
  const [copiedA, setCopiedA] = useState(false)
  const [copiedB, setCopiedB] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const filters = {
    college: searchParams.get('college') || '',
    subject: searchParams.get('subject') || '',
    semester: searchParams.get('semester') || '',
    branch: searchParams.get('branch') || '',
    examType: searchParams.get('examType') || '',
  }

  const examTypeLimits = {
    semester: { partA: 40, partB: 25 },
    midterm1: { partA: 25, partB: 10 },
    midterm2: { partA: 25, partB: 10 }
  }

  const limits = examTypeLimits[filters.examType as keyof typeof examTypeLimits] || examTypeLimits.semester

  const toggleStudied = (part: 'partA' | 'partB', index: number) => {
    setTopics(prev => ({
      ...prev,
      [part]: prev[part].map((topic, i) => 
        i === index ? { ...topic, studied: !topic.studied } : topic
      )
    }))
  }

  const getFilteredTopics = (topicsList: typeof topics.partA) => {
    let filtered = [...topicsList]
    
    if (sortBy === 'alpha') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      filtered.sort((a, b) => b.count - a.count)
    }

    if (filterLimit !== 'all') {
      filtered = filtered.slice(0, parseInt(filterLimit))
    }

    return filtered
  }

  const getCountColor = (count: number, maxCount: number) => {
    const percentage = (count / maxCount) * 100
    if (percentage >= 80) return 'bg-red-500'
    if (percentage >= 50) return 'bg-orange-500'
    return 'bg-blue-500'
  }

  const generatePrompt = (part: 'A' | 'B') => {
    const topicsList = part === 'A' ? topics.partA : topics.partB
    const topicNames = topicsList.map(t => t.name)
    
    let prompt: any = {
      instruction: '',
      format: '',
      topics: topicNames,
      constraints: {}
    }

    if (part === 'A' && (filters.examType === 'semester' || filters.examType.startsWith('midterm'))) {
      prompt.instruction = "You are an expert educator. Generate concise answers for the following examination topics. Each answer should be minimum 20 words."
      prompt.format = "For each topic, provide: 1) Clear definition, 2) Key points, 3) Simple example where applicable"
      prompt.constraints = { minWords: 20, includeExample: true }
    } else if (part === 'B' && filters.examType.startsWith('midterm')) {
      prompt.instruction = "You are an expert educator. Generate detailed answers for the following examination topics. Each answer should be 250 words with diagram descriptions and examples."
      prompt.format = "For each topic, provide: 1) Detailed explanation, 2) Diagram description (describe what should be drawn), 3) Real-world example, 4) Key takeaways"
      prompt.constraints = { wordCount: 250, includeDiagram: true, includeExample: true }
    } else if (part === 'B' && filters.examType === 'semester') {
      prompt.instruction = "You are an expert educator. Generate comprehensive answers for the following examination topics. Each answer should be 400 words with detailed diagram descriptions and multiple examples."
      prompt.format = "For each topic, provide: 1) Comprehensive explanation, 2) Multiple diagram descriptions, 3) Real-world examples, 4) Applications, 5) Summary. Total 6 pages of content."
      prompt.constraints = { wordCount: 400, includeDiagrams: true, includeMultipleExamples: true, totalPages: 6 }
    }

    return JSON.stringify(prompt, null, 2)
  }

  const copyPrompt = async (part: 'A' | 'B') => {
    const prompt = generatePrompt(part)
    await navigator.clipboard.writeText(prompt)
    if (part === 'A') {
      setCopiedA(true)
      setTimeout(() => setCopiedA(false), 2000)
    } else {
      setCopiedB(true)
      setTimeout(() => setCopiedB(false), 2000)
    }
  }

  const copyAllTopics = async () => {
    const allTopics = [
      'Part A Topics:',
      ...topics.partA.map((t, i) => `${i + 1}. ${t.name} (${t.count} times)`),
      '',
      'Part B Topics:',
      ...topics.partB.map((t, i) => `${i + 1}. ${t.name} (${t.count} times)`)
    ].join('\n')
    
    await navigator.clipboard.writeText(allTopics)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const exportData = (format: 'pdf' | 'csv' | 'json') => {
    setIsGenerating(true)
    
    setTimeout(() => {
      if (format === 'json') {
        const data = {
          filters,
          partA: topics.partA,
          partB: topics.partB,
          exportedAt: new Date().toISOString()
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `topics-${filters.subject}-${new Date().toISOString().split('T')[0]}.json`
        a.click()
      } else if (format === 'csv') {
        const csvRows = [
          'Part,Rank,Topic,Count',
          ...topics.partA.map((t, i) => `A,${i + 1},"${t.name}",${t.count}`),
          ...topics.partB.map((t, i) => `B,${i + 1},"${t.name}",${t.count}`)
        ]
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `topics-${filters.subject}-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
      }
      
      setIsGenerating(false)
    }, 1000)
  }

  const filteredPartA = getFilteredTopics(topics.partA)
  const filteredPartB = getFilteredTopics(topics.partB)
  const studiedCountA = topics.partA.filter(t => t.studied).length
  const studiedCountB = topics.partB.filter(t => t.studied).length

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <Home className="w-4 h-4 mr-1" />
          Home
        </Link>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <Link href="/search/topics" className="text-muted-foreground hover:text-foreground transition-colors">
          Search Topics
        </Link>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <span className="text-foreground font-medium">Topics View</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Important Topics</h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{filters.college}</Badge>
          <Badge variant="secondary">{filters.subject}</Badge>
          <Badge variant="secondary">Sem {filters.semester}</Badge>
          <Badge variant="secondary">{filters.branch}</Badge>
          <Badge variant="secondary">
            {filters.examType === 'semester' ? 'Semester Exam' : 
             filters.examType === 'midterm1' ? 'Midterm 1' : 'Midterm 2'}
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Sort by:</label>
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="alpha">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Show:</label>
                <Select value={filterLimit} onValueChange={(v: any) => setFilterLimit(v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    <SelectItem value="10">Top 10</SelectItem>
                    <SelectItem value="20">Top 20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyAllTopics}>
                {copiedAll ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copiedAll ? 'Copied!' : 'Copy All'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportData('json')}>
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topics Tabs */}
      <Tabs defaultValue="partA" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="partA">
            Part-A ({limits.partA} topics)
          </TabsTrigger>
          <TabsTrigger value="partB">
            Part-B ({limits.partB} topics)
          </TabsTrigger>
        </TabsList>

        {/* Part A Content */}
        <TabsContent value="partA" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Part-A Topics
                  </CardTitle>
                  <CardDescription>
                    Short answer questions - {studiedCountA}/{topics.partA.length} studied
                  </CardDescription>
                </div>
                <Button onClick={() => copyPrompt('A')} size="sm" className="gap-2">
                  {copiedA ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  {copiedA ? 'Copied!' : 'Copy AI Prompt'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredPartA.map((topic, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                      topic.studied ? 'bg-muted/50 border-border' : 'bg-card border-border hover:border-primary/30'
                    }`}
                  >
                    <Checkbox
                      checked={topic.studied}
                      onCheckedChange={() => toggleStudied('partA', topics.partA.indexOf(topic))}
                    />
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${topic.studied ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {topic.name}
                      </p>
                    </div>
                    <Badge className={`${getCountColor(topic.count, 50)} text-white shrink-0`}>
                      {topic.count}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Part B Content */}
        <TabsContent value="partB" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    Part-B Topics
                  </CardTitle>
                  <CardDescription>
                    Long answer questions - {studiedCountB}/{topics.partB.length} studied
                  </CardDescription>
                </div>
                <Button onClick={() => copyPrompt('B')} size="sm" className="gap-2">
                  {copiedB ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  {copiedB ? 'Copied!' : 'Copy AI Prompt'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredPartB.map((topic, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                      topic.studied ? 'bg-muted/50 border-border' : 'bg-card border-border hover:border-primary/30'
                    }`}
                  >
                    <Checkbox
                      checked={topic.studied}
                      onCheckedChange={() => toggleStudied('partB', topics.partB.indexOf(topic))}
                    />
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${topic.studied ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {topic.name}
                      </p>
                    </div>
                    <Badge className={`${getCountColor(topic.count, 25)} text-white shrink-0`}>
                      {topic.count}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}