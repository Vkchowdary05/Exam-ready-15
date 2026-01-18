"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Share2,
  Download,
  Printer,
  Flag,
  ChevronRight,
  Home,
  Search,
  CheckCircle,
  Calendar,
  Eye,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { PaperCard } from "@/components/papers/paper-card";
import { mockPapers } from "@/lib/mock-data";
import type { IPaper } from "@/types";

const examTypeLabels = {
  semester: "Semester Exam",
  midterm1: "Midterm 1",
  midterm2: "Midterm 2",
};

const Loading = () => null;

export default function PaperViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [paper, setPaper] = useState<IPaper | null>(null);
  const [relatedPapers, setRelatedPapers] = useState<IPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [imageZoom, setImageZoom] = useState(100);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const found = mockPapers.find((p) => p._id === params.id);
      if (found) {
        setPaper(found);
        setLikeCount(found.likes);
        // Get related papers (same subject, different years)
        const related = mockPapers
          .filter((p) => p.subject === found.subject && p._id !== found._id)
          .slice(0, 4);
        setRelatedPapers(related);
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [params.id]);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h2 className="mb-2 text-2xl font-bold text-white">Paper Not Found</h2>
        <p className="mb-6 text-neutral-400">
          The paper you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/search/papers">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Search className="mr-2 h-4 w-4" />
            Browse Papers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="flex items-center text-neutral-400 transition-colors hover:text-white"
        >
          <Home className="mr-1 h-4 w-4" />
          Home
        </Link>
        <ChevronRight className="h-4 w-4 text-neutral-600" />
        <Link
          href="/search/papers"
          className="text-neutral-400 transition-colors hover:text-white"
        >
          Search
        </Link>
        <ChevronRight className="h-4 w-4 text-neutral-600" />
        <span className="truncate text-white">{paper.subject}</span>
      </nav>

      {/* Paper Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{paper.subject}</h1>
              {paper.verified && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="mr-1 h-3.5 w-3.5" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-lg text-neutral-400">{paper.college}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleLike}
              className={`border-white/10 bg-transparent ${
                liked
                  ? "border-pink-500/50 text-pink-400"
                  : "text-neutral-300 hover:bg-white/5"
              }`}
            >
              <Heart className={`mr-2 h-4 w-4 ${liked ? "fill-current" : ""}`} />
              {likeCount}
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="border-white/10 bg-transparent text-neutral-300 hover:bg-white/5"
            >
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-emerald-400" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              {copied ? "Copied!" : "Share"}
            </Button>
            <Button
              variant="outline"
              className="border-white/10 bg-transparent text-neutral-300 hover:bg-white/5"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              className="border-white/10 bg-transparent text-neutral-300 hover:bg-white/5"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              className="border-white/10 bg-transparent text-neutral-300 hover:bg-white/5"
            >
              <Flag className="mr-2 h-4 w-4" />
              Report
            </Button>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
            {examTypeLabels[paper.examType]}
          </Badge>
          <Badge variant="outline" className="border-white/10 bg-white/5 text-neutral-300">
            Semester {paper.semester}
          </Badge>
          <Badge variant="outline" className="border-white/10 bg-white/5 text-neutral-300">
            {paper.branch}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-neutral-400">
            <Calendar className="h-4 w-4" />
            {paper.month} {paper.year}
          </div>
          <div className="flex items-center gap-1 text-sm text-neutral-400">
            <Eye className="h-4 w-4" />
            {paper.viewCount} views
          </div>
        </div>
      </motion.div>

      {/* Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="formatted" className="mb-12">
          <TabsList className="mb-6 bg-white/5">
            <TabsTrigger value="formatted" className="data-[state=active]:bg-indigo-600">
              Formatted Text
            </TabsTrigger>
            <TabsTrigger value="original" className="data-[state=active]:bg-indigo-600">
              Original Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="formatted">
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-6 md:p-8">
                {/* Part A */}
                {paper.formattedText?.partA && paper.formattedText.partA.length > 0 && (
                  <div className="mb-8">
                    <h2 className="mb-4 border-b border-white/10 pb-2 text-xl font-bold text-white">
                      Part A - Short Answer Questions
                    </h2>
                    <div className="space-y-4">
                      {paper.formattedText.partA.map((q, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-white/5 bg-white/5 p-4"
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <span className="text-sm font-medium text-indigo-400">
                              Q{q.questionNumber}
                            </span>
                            <Badge
                              variant="outline"
                              className="border-amber-500/20 bg-amber-500/10 text-amber-400"
                            >
                              {q.marks} marks
                            </Badge>
                          </div>
                          <p className="font-serif text-lg leading-relaxed text-neutral-200">
                            {q.question}
                          </p>
                          {q.topic && (
                            <Badge className="mt-3 bg-indigo-500/10 text-indigo-400">
                              Topic: {q.topic}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Part B */}
                {paper.formattedText?.partB && paper.formattedText.partB.length > 0 && (
                  <div>
                    <h2 className="mb-4 border-b border-white/10 pb-2 text-xl font-bold text-white">
                      Part B - Long Answer Questions
                    </h2>
                    <div className="space-y-4">
                      {paper.formattedText.partB.map((q, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-white/5 bg-white/5 p-4"
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <span className="text-sm font-medium text-indigo-400">
                              Q{q.questionNumber}
                            </span>
                            <Badge
                              variant="outline"
                              className="border-amber-500/20 bg-amber-500/10 text-amber-400"
                            >
                              {q.marks} marks
                            </Badge>
                          </div>
                          <p className="font-serif text-lg leading-relaxed text-neutral-200">
                            {q.question}
                          </p>
                          {q.topic && (
                            <Badge className="mt-3 bg-indigo-500/10 text-indigo-400">
                              Topic: {q.topic}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="original">
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-4">
                {/* Zoom Controls */}
                <div className="mb-4 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImageZoom((z) => Math.max(50, z - 25))}
                    disabled={imageZoom <= 50}
                    className="border-white/10 bg-transparent text-neutral-300 hover:bg-white/5"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[3rem] text-center text-sm text-neutral-400">
                    {imageZoom}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImageZoom((z) => Math.min(200, z + 25))}
                    disabled={imageZoom >= 200}
                    className="border-white/10 bg-transparent text-neutral-300 hover:bg-white/5"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>

                {/* Image */}
                <div className="overflow-auto rounded-lg bg-neutral-900">
                  <div
                    className="relative min-h-[400px] transition-transform duration-200"
                    style={{ transform: `scale(${imageZoom / 100})`, transformOrigin: "top left" }}
                  >
                    <Image
                      src={paper.originalImage || "/placeholder.svg"}
                      alt={`${paper.subject} exam paper`}
                      width={800}
                      height={1000}
                      className="h-auto w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Related Papers */}
      {relatedPapers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mb-6 text-2xl font-bold text-white">Related Papers</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedPapers.map((p, idx) => (
              <PaperCard key={p._id} paper={p} index={idx} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export { Loading };
