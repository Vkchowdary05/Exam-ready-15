'use client'

import React from "react"

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Users, Building2, FileText, Tag } from 'lucide-react'
import { platformStats } from '@/lib/mock-data'

interface StatItemProps {
  icon: React.ReactNode
  value: number
  label: string
  suffix?: string
  delay: number
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!isInView) return

    const duration = 2000
    const steps = 60
    const stepValue = value / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += stepValue
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isInView, value])

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K'
    }
    return num.toLocaleString()
  }

  return (
    <span ref={ref} className="tabular-nums">
      {formatNumber(count)}{suffix}
    </span>
  )
}

function StatItem({ icon, value, label, suffix, delay }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className="text-center p-6"
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
    </motion.div>
  )
}

export function StatsSection() {
  const stats = [
    {
      icon: <Users className="w-7 h-7 text-primary" />,
      value: platformStats.totalUsers,
      label: 'Active Students',
      suffix: '+',
    },
    {
      icon: <Building2 className="w-7 h-7 text-primary" />,
      value: platformStats.totalColleges,
      label: 'Partner Colleges',
      suffix: '',
    },
    {
      icon: <FileText className="w-7 h-7 text-primary" />,
      value: platformStats.totalPapers,
      label: 'Papers Shared',
      suffix: '+',
    },
    {
      icon: <Tag className="w-7 h-7 text-primary" />,
      value: platformStats.totalTopics,
      label: 'Topics Indexed',
      suffix: '+',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Trusted by Students Worldwide
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join a growing community of students who are studying smarter, not harder.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, index) => (
            <StatItem
              key={stat.label}
              {...stat}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
