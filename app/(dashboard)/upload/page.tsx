'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { collegeOptions, branchOptions, semesterOptions, subjectOptions, examTypeOptions } from '@/lib/mock-data'
import type { ExamType } from '@/types'
import {
  Upload,
  FileImage,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Eye,
  FileText,
} from 'lucide-react'

const uploadSchema = z.object({
  college: z.string().min(1, 'Please select a college'),
  subject: z.string().min(1, 'Please select a subject'),
  semester: z.string().min(1, 'Please select a semester'),
  branch: z.string().min(1, 'Please select a branch'),
  examType: z.string().min(1, 'Please select an exam type'),
  year: z.string().min(1, 'Please enter the year'),
  month: z.string().min(1, 'Please select the month'),
})

type UploadFormData = z.infer<typeof uploadSchema>

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

interface UploadedFile {
  id: string
  file: File
  preview: string
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
}

interface OCRConfidence {
  college: number
  subject: number
  semester: number
  branch: number
  examType: number
  year: number
  month: number
}

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [step, setStep] = useState<'upload' | 'review' | 'success'>('upload')
  const [isProcessing, setIsProcessing] = useState(false)
  const [confidence, setConfidence] = useState<OCRConfidence | null>(null)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      college: '',
      subject: '',
      semester: '',
      branch: '',
      examType: '',
      year: new Date().getFullYear().toString(),
      month: '',
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'uploading' as const,
    }))
    setFiles((prev) => [...prev, ...newFiles])

    // Simulate upload progress
    newFiles.forEach((uploadedFile) => {
      const interval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.id === uploadedFile.id) {
              const newProgress = Math.min(f.progress + 10, 100)
              return {
                ...f,
                progress: newProgress,
                status: newProgress === 100 ? 'complete' : 'uploading',
              }
            }
            return f
          })
        )
      }, 200)

      setTimeout(() => clearInterval(interval), 2200)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
  })

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file) URL.revokeObjectURL(file.preview)
      return prev.filter((f) => f.id !== id)
    })
  }

  const handleProcessOCR = async () => {
    if (files.length === 0) return

    setIsProcessing(true)

    // Simulate OCR processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulated OCR results with confidence scores
    const mockConfidence: OCRConfidence = {
      college: 0.92,
      subject: 0.88,
      semester: 0.95,
      branch: 0.85,
      examType: 0.90,
      year: 0.98,
      month: 0.75,
    }

    setConfidence(mockConfidence)

    // Auto-fill form with detected values
    setValue('college', collegeOptions[0])
    setValue('subject', subjectOptions[0])
    setValue('semester', '3rd')
    setValue('branch', branchOptions[0])
    setValue('examType', 'semester')
    setValue('year', '2024')
    setValue('month', 'December')

    setIsProcessing(false)
    setStep('review')
  }

  const onSubmit = async (data: UploadFormData) => {
    setIsProcessing(true)
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsProcessing(false)
    setStep('success')
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-500/10'
    if (score >= 0.7) return 'text-yellow-600 bg-yellow-500/10'
    return 'text-red-600 bg-red-500/10'
  }

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'High'
    if (score >= 0.7) return 'Medium'
    return 'Low'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Upload Exam Paper</h1>
        <p className="text-muted-foreground mt-1">
          Share exam papers to help fellow students and earn credits
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {['Upload', 'Review', 'Complete'].map((label, index) => {
          const stepIndex = ['upload', 'review', 'success'].indexOf(step)
          const isActive = index <= stepIndex
          const isCurrent = index === stepIndex
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index < stepIndex ? <CheckCircle className="w-5 h-5" /> : index + 1}
              </div>
              <span className={`text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                {label}
              </span>
              {index < 2 && <div className="w-8 h-px bg-border ml-2" />}
            </div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Upload Step */}
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>
                  Upload images or PDFs of exam papers (max 10 files, 10MB each)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground">
                        {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse from your device
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">PNG</Badge>
                      <Badge variant="secondary">JPG</Badge>
                      <Badge variant="secondary">PDF</Badge>
                    </div>
                  </div>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-foreground">Uploaded Files</h3>
                    {files.map((uploadedFile) => (
                      <div
                        key={uploadedFile.id}
                        className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card"
                      >
                        {/* Preview */}
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          {uploadedFile.file.type.startsWith('image/') ? (
                            <img
                              src={uploadedFile.preview || "/placeholder.svg"}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {uploadedFile.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {uploadedFile.status === 'uploading' && (
                            <Progress value={uploadedFile.progress} className="h-1 mt-2" />
                          )}
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                          {uploadedFile.status === 'uploading' && (
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                          )}
                          {uploadedFile.status === 'complete' && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {uploadedFile.status === 'error' && (
                            <AlertCircle className="w-5 h-5 text-destructive" />
                          )}
                          <button
                            onClick={() => removeFile(uploadedFile.id)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Process Button */}
                <Button
                  onClick={handleProcessOCR}
                  disabled={files.length === 0 || files.some((f) => f.status === 'uploading') || isProcessing}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Process with AI OCR
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Review Step */}
        {step === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Original Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[3/4] rounded-lg bg-muted overflow-hidden">
                    {files[0] && (
                      <img
                        src={files[0].preview || "/placeholder.svg"}
                        alt="Uploaded exam paper"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Metadata Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Paper Details</CardTitle>
                  <CardDescription>
                    Review and edit the extracted metadata
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* College */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>College</Label>
                        {confidence && (
                          <Badge className={getConfidenceColor(confidence.college)}>
                            {getConfidenceLabel(confidence.college)} ({Math.round(confidence.college * 100)}%)
                          </Badge>
                        )}
                      </div>
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
                                <SelectItem key={college} value={college}>{college}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Subject</Label>
                        {confidence && (
                          <Badge className={getConfidenceColor(confidence.subject)}>
                            {getConfidenceLabel(confidence.subject)} ({Math.round(confidence.subject * 100)}%)
                          </Badge>
                        )}
                      </div>
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
                                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {/* Semester & Branch */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Semester</Label>
                        <Controller
                          name="semester"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Semester" />
                              </SelectTrigger>
                              <SelectContent>
                                {semesterOptions.map((sem) => (
                                  <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Branch</Label>
                        <Controller
                          name="branch"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Branch" />
                              </SelectTrigger>
                              <SelectContent>
                                {branchOptions.map((branch) => (
                                  <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    {/* Exam Type */}
                    <div className="space-y-2">
                      <Label>Exam Type</Label>
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
                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {/* Year & Month */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Year</Label>
                        <Controller
                          name="year"
                          control={control}
                          render={({ field }) => (
                            <Input {...field} type="number" min="2000" max="2030" />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Month</Label>
                        <Controller
                          name="month"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Month" />
                              </SelectTrigger>
                              <SelectContent>
                                {months.map((month) => (
                                  <SelectItem key={month} value={month}>{month}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep('upload')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button type="submit" disabled={isProcessing} className="flex-1 gap-2">
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Submit Paper
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Paper Uploaded Successfully!
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Thank you for contributing. You've earned 50 credits for this upload!
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => {
                setStep('upload')
                setFiles([])
                setConfidence(null)
              }}>
                Upload Another
              </Button>
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
