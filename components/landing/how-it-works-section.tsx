'use client'

import { motion } from 'framer-motion'
import { Upload, Sparkles, Search, Trophy, ArrowRight } from 'lucide-react'

const steps = [
  {
    step: 1,
    title: 'Upload Papers',
    description: 'Snap a photo or upload PDF of your exam papers. Our system accepts multiple formats.',
    icon: Upload,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    step: 2,
    title: 'AI Extraction',
    description: 'Advanced OCR technology identifies questions, topics, and metadata with high accuracy.',
    icon: Sparkles,
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    step: 3,
    title: 'Discover Topics',
    description: 'Search by subject to find frequently repeated topics and focus your preparation.',
    icon: Search,
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    step: 4,
    title: 'Ace Your Exams',
    description: 'Study smarter with AI-generated prompts and topic summaries. Share and earn rewards!',
    icon: Trophy,
    color: 'bg-amber-500/10 text-amber-600',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
            From Upload to Excellence
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to transform your exam preparation and join a community of successful students.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector Line (hidden on last item and mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[calc(100%-20%)] h-px bg-border">
                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  </div>
                )}

                {/* Card */}
                <div className="relative bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
