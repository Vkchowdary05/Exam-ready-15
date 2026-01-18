"use client";

import { motion } from "framer-motion";
import { Heart, Eye, CheckCircle, Calendar, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IPaper } from "@/types";
import Link from "next/link";

interface PaperCardProps {
  paper: IPaper;
  index?: number;
}

const examTypeColors = {
  semester: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  midterm1: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  midterm2: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const examTypeLabels = {
  semester: "Semester",
  midterm1: "Midterm 1",
  midterm2: "Midterm 2",
};

export function PaperCard({ paper, index = 0 }: PaperCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/papers/${paper._id}`}>
        <Card className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30 hover:bg-white/10 hover:shadow-xl hover:shadow-indigo-500/5">
          <CardContent className="p-5">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-1 line-clamp-1 text-lg font-semibold text-white transition-colors group-hover:text-indigo-400">
                  {paper.subject}
                </h3>
                <p className="line-clamp-1 text-sm text-neutral-400">
                  {paper.college}
                </p>
              </div>
              {paper.verified && (
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">Verified</span>
                </div>
              )}
            </div>

            {/* Meta Info */}
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="outline" className={examTypeColors[paper.examType]}>
                {examTypeLabels[paper.examType]}
              </Badge>
              <Badge variant="outline" className="border-white/10 bg-white/5 text-neutral-300">
                Sem {paper.semester}
              </Badge>
              <Badge variant="outline" className="border-white/10 bg-white/5 text-neutral-300">
                {paper.branch}
              </Badge>
            </div>

            {/* Year & Month */}
            <div className="mb-4 flex items-center gap-2 text-sm text-neutral-400">
              <Calendar className="h-4 w-4" />
              <span>{paper.month} {paper.year}</span>
            </div>

            {/* Footer Stats */}
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">{paper.likes}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">{paper.viewCount}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-400">
                <GraduationCap className="h-4 w-4" />
                <span className="text-xs">{paper.uploadedBy?.name || "Anonymous"}</span>
              </div>
            </div>
          </CardContent>

          {/* Hover Glow Effect */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
