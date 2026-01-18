'use client'

import { motion } from 'framer-motion'
import { 
  Scan, 
  BarChart3, 
  Users, 
  Bot, 
  Award, 
  Download,
  Zap,
  Shield,
  Globe
} from 'lucide-react'

const features = [
  {
    title: 'Smart OCR Extraction',
    description: 'Our AI accurately extracts questions, topics, and metadata from uploaded exam papers with over 95% accuracy.',
    icon: Scan,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Topic Frequency Analysis',
    description: 'Discover which topics appear most frequently across years and semesters. Focus your study time efficiently.',
    icon: BarChart3,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Collaborative Library',
    description: 'Access thousands of papers shared by students from colleges worldwide. Together we learn better.',
    icon: Users,
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'AI Study Prompts',
    description: 'Generate comprehensive study guides and answers using AI for any topic. Get exam-ready content instantly.',
    icon: Bot,
    gradient: 'from-orange-500 to-red-500',
  },
  {
    title: 'Gamified Learning',
    description: 'Earn badges, climb leaderboards, and unlock rewards as you contribute to the community.',
    icon: Award,
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    title: 'Multi-format Export',
    description: 'Download papers and topics as PDF, CSV, or JSON for offline studying and printing.',
    icon: Download,
    gradient: 'from-teal-500 to-cyan-500',
  },
]

const additionalFeatures = [
  { icon: Zap, text: 'Lightning fast search' },
  { icon: Shield, text: 'Verified papers' },
  { icon: Globe, text: '150+ colleges' },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
            Everything You Need to Excel
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed specifically for students who want to study smarter and achieve better results.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="h-full bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                  {/* Icon with gradient background */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Additional Features Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center items-center gap-6 md:gap-12 py-8 px-6 bg-card rounded-2xl border border-border"
        >
          {additionalFeatures.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.text} className="flex items-center gap-2 text-muted-foreground">
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
