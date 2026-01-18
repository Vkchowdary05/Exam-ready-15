'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Heart, Eye } from 'lucide-react'
import type { IPaper } from '@/types'

export function PaperCard({ paper, variant = 'standard' }: { paper: IPaper, variant?: 'standard' | 'minimal' }) {
  const isMinimal = variant === 'minimal'

  return (
    <motion.div
      whileHover={{ y: isMinimal ? -4 : -4 }}
      className={`group relative overflow-hidden rounded-xl transition-all cursor-pointer ${isMinimal
          ? 'bg-white dark:bg-neutral-900 border border-transparent shadow-sm hover:shadow-md hover:ring-1 hover:ring-indigo-500/20'
          : 'border border-white/10 bg-neutral-950 p-4 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20'
        }`}
    >
      <Link href={`/papers/${paper._id}`} className={isMinimal ? 'block p-5' : 'block'}>
        <div className="flex items-start justify-between mb-3">
          <Badge
            variant={isMinimal ? "secondary" : "outline"}
            className={`text-xs ${isMinimal
                ? 'rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
                : 'border-white/20 text-neutral-300 transition-colors group-hover:border-indigo-500/50 group-hover:text-indigo-300'
              }`}
          >
            {paper.examType === 'semester' ? 'Semester' : `Midterm ${paper.examType?.slice(-1)}`}
          </Badge>
          {paper.verified && (
            <Badge className={`${isMinimal
                ? 'rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'bg-emerald-500/20 text-emerald-400 border-0'
              } text-xs`}>
              Verified
            </Badge>
          )}
        </div>

        <h3 className={`font-semibold mb-1 transition-colors line-clamp-1 ${isMinimal
            ? 'text-neutral-900 group-hover:text-indigo-600 dark:text-neutral-100 dark:group-hover:text-indigo-400 text-lg'
            : 'text-white group-hover:text-indigo-400'
          }`}>
          {paper.subject}
        </h3>

        <p className={`text-sm mb-4 line-clamp-1 ${isMinimal ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-400 mb-3'
          }`}>
          {paper.college?.split(' - ')[0]} • {paper.semester} Sem
        </p>

        <div className={`flex items-center justify-between text-sm ${isMinimal ? 'text-neutral-400 dark:text-neutral-500 pt-3 border-t border-neutral-100 dark:border-neutral-800' : 'text-neutral-500 group-hover:text-neutral-300'
          }`}>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 transition-colors hover:text-pink-500">
              <Heart className={`w-4 h-4 ${isMinimal ? '' : 'text-neutral-600 group-hover:text-pink-500'}`} />
              <span className="font-medium">{paper.likes || 0}</span>
            </span>
            <span className="flex items-center gap-1.5 transition-colors hover:text-indigo-500">
              <Eye className={`w-4 h-4 ${isMinimal ? '' : 'text-neutral-600 group-hover:text-indigo-500'}`} />
              <span className="font-medium">{paper.viewCount || 0}</span>
            </span>
          </div>
          <span className="font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-xs">
            {paper.year}
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
