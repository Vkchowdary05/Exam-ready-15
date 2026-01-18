'use client'

import { motion } from 'framer-motion'
import { 
  Upload, 
  Heart, 
  CheckCircle, 
  Flame, 
  Crown, 
  Star,
  Zap,
  Target
} from 'lucide-react'

const badges = [
  {
    name: 'First Upload',
    description: 'Upload your first exam paper',
    icon: Upload,
    color: 'from-blue-400 to-blue-600',
    requirement: '1 upload',
  },
  {
    name: 'Active Contributor',
    description: 'Upload 10 exam papers',
    icon: Zap,
    color: 'from-purple-400 to-purple-600',
    requirement: '10 uploads',
  },
  {
    name: 'Popular',
    description: 'Receive 50 likes on your papers',
    icon: Heart,
    color: 'from-pink-400 to-pink-600',
    requirement: '50 likes',
  },
  {
    name: 'Trusted Source',
    description: 'Have 5 papers verified by admins',
    icon: CheckCircle,
    color: 'from-emerald-400 to-emerald-600',
    requirement: '5 verified',
  },
  {
    name: 'Weekly Warrior',
    description: 'Upload papers for 7 consecutive days',
    icon: Flame,
    color: 'from-orange-400 to-orange-600',
    requirement: '7-day streak',
  },
  {
    name: 'College Champion',
    description: 'Be the top contributor from your college',
    icon: Crown,
    color: 'from-yellow-400 to-yellow-600',
    requirement: '#1 in college',
  },
  {
    name: 'Rising Star',
    description: 'Reach the top 100 on global leaderboard',
    icon: Star,
    color: 'from-cyan-400 to-cyan-600',
    requirement: 'Top 100',
  },
  {
    name: 'Sharpshooter',
    description: 'Have 95%+ OCR accuracy on uploads',
    icon: Target,
    color: 'from-red-400 to-red-600',
    requirement: '95% accuracy',
  },
]

export function BadgesSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Gamification
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
            Earn Badges & Rewards
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Contribute to the community and unlock exclusive badges. Climb the leaderboard and showcase your achievements.
          </p>
        </motion.div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="group cursor-pointer"
              >
                <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center">
                  {/* Badge Icon */}
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Badge Info */}
                  <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">
                    {badge.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {badge.description}
                  </p>
                  <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {badge.requirement}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            Start contributing today and unlock all badges!
          </p>
        </motion.div>
      </div>
    </section>
  )
}
