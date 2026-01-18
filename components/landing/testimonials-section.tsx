'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Computer Science, 4th Year',
    college: 'IIT Delhi',
    avatar: 'PS',
    avatarBg: 'bg-purple-500',
    content: 'Exam Ready completely changed how I prepare for exams. The topic frequency analysis helped me focus on what matters most. Scored 9.2 GPA last semester!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Electrical Engineering, 3rd Year',
    college: 'Stanford University',
    avatar: 'MC',
    avatarBg: 'bg-blue-500',
    content: 'The OCR feature is incredibly accurate. I uploaded 20 papers and the extracted topics were spot on. This platform is a game-changer for students.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Emma Williams',
    role: 'Information Technology, 2nd Year',
    college: 'MIT',
    avatar: 'EW',
    avatarBg: 'bg-emerald-500',
    content: 'Love the gamification! Earning badges while helping others is so motivating. The community here is supportive and the papers are high quality.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Rahul Patel',
    role: 'Mechanical Engineering, Final Year',
    college: 'Georgia Tech',
    avatar: 'RP',
    avatarBg: 'bg-orange-500',
    content: 'Found papers from 5 years back for my subject. The AI-generated study prompts saved me hours of preparation time. Highly recommend!',
    rating: 5,
  },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const goToPrev = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
            Loved by Students
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what students from top universities are saying about Exam Ready.
          </p>
        </motion.div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-card rounded-3xl border border-border p-8 md:p-12 shadow-xl">
            {/* Quote Icon */}
            <div className="absolute -top-6 left-8 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Quote className="w-6 h-6 text-primary-foreground" />
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="pt-4"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-xl md:text-2xl text-foreground font-medium leading-relaxed mb-8">
                  "{currentTestimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full ${currentTestimonial.avatarBg} flex items-center justify-center text-white font-bold text-lg`}>
                    {currentTestimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{currentTestimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{currentTestimonial.role}</div>
                    <div className="text-sm text-primary">{currentTestimonial.college}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="absolute right-8 bottom-8 flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrev}
                className="rounded-full bg-transparent"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                className="rounded-full bg-transparent"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false)
                  setCurrentIndex(index)
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
