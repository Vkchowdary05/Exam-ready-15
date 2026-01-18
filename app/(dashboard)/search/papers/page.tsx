"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PaperCard } from "@/components/papers/paper-card";
import { mockPapers, mockColleges, mockSubjects, mockBranches } from "@/lib/mock-data";
import type { IPaper, IFilters } from "@/types";

const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
const examTypes = [
  { value: "semester", label: "Semester Exam" },
  { value: "midterm1", label: "Midterm 1" },
  { value: "midterm2", label: "Midterm 2" },
];
const sortOptions = [
  { value: "recent", label: "Most Recent" },
  { value: "liked", label: "Most Liked" },
  { value: "verified", label: "Verified First" },
  { value: "oldest", label: "Oldest" },
];

const Loading = () => null;

export default function SearchPapersPage() {
  const searchParams = useSearchParams();
  const [papers, setPapers] = useState<IPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<IFilters>({
    colleges: [],
    subjects: [],
    semesters: [],
    branches: [],
    examTypes: [],
    yearRange: { min: 2018, max: 2025 },
  });

  // Simulate fetching papers
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let filtered = [...mockPapers];

      // Apply filters
      if (filters.colleges.length > 0) {
        filtered = filtered.filter((p) => filters.colleges.includes(p.college));
      }
      if (filters.subjects.length > 0) {
        filtered = filtered.filter((p) => filters.subjects.includes(p.subject));
      }
      if (filters.semesters.length > 0) {
        filtered = filtered.filter((p) => filters.semesters.includes(p.semester));
      }
      if (filters.branches.length > 0) {
        filtered = filtered.filter((p) => filters.branches.includes(p.branch));
      }
      if (filters.examTypes.length > 0) {
        filtered = filtered.filter((p) => filters.examTypes.includes(p.examType));
      }

      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.subject.toLowerCase().includes(query) ||
            p.college.toLowerCase().includes(query) ||
            p.branch.toLowerCase().includes(query)
        );
      }

      // Apply sort
      switch (sortBy) {
        case "liked":
          filtered.sort((a, b) => b.likes - a.likes);
          break;
        case "verified":
          filtered.sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0));
          break;
        case "oldest":
          filtered.sort((a, b) => a.year - b.year);
          break;
        default:
          filtered.sort((a, b) => b.year - a.year);
      }

      setPapers(filtered);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, searchQuery, sortBy]);

  const toggleFilter = useCallback(
    (type: keyof Omit<IFilters, "yearRange">, value: string) => {
      setFilters((prev) => {
        const current = prev[type] as string[];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [type]: updated };
      });
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({
      colleges: [],
      subjects: [],
      semesters: [],
      branches: [],
      examTypes: [],
      yearRange: { min: 2018, max: 2025 },
    });
  }, []);

  const activeFilterCount =
    filters.colleges.length +
    filters.subjects.length +
    filters.semesters.length +
    filters.branches.length +
    filters.examTypes.length;

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-400">
        {title}
      </h3>
      {children}
    </div>
  );

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Colleges */}
      <FilterSection title="College">
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
          {mockColleges.map((college) => (
            <label
              key={college}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
            >
              <Checkbox
                checked={filters.colleges.includes(college)}
                onCheckedChange={() => toggleFilter("colleges", college)}
              />
              <span className="text-sm text-neutral-300 truncate">{college}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Subjects */}
      <FilterSection title="Subject">
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
          {mockSubjects.map((subject) => (
            <label
              key={subject}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
            >
              <Checkbox
                checked={filters.subjects.includes(subject)}
                onCheckedChange={() => toggleFilter("subjects", subject)}
              />
              <span className="text-sm text-neutral-300 truncate">{subject}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Semesters */}
      <FilterSection title="Semester">
        <div className="flex flex-wrap gap-2">
          {semesters.map((sem) => (
            <Button
              key={sem}
              variant="outline"
              size="sm"
              onClick={() => toggleFilter("semesters", sem)}
              className={`h-9 w-9 ${filters.semesters.includes(sem)
                  ? "border-indigo-500 bg-indigo-500/20 text-indigo-400"
                  : "border-white/10 bg-transparent text-neutral-400 hover:bg-white/5"
                }`}
            >
              {sem}
            </Button>
          ))}
        </div>
      </FilterSection>

      {/* Branches */}
      <FilterSection title="Branch">
        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
          {mockBranches.map((branch) => (
            <label
              key={branch}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
            >
              <Checkbox
                checked={filters.branches.includes(branch)}
                onCheckedChange={() => toggleFilter("branches", branch)}
              />
              <span className="text-sm text-neutral-300">{branch}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Exam Type */}
      <FilterSection title="Exam Type">
        <div className="space-y-2">
          {examTypes.map((type) => (
            <label
              key={type.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
            >
              <Checkbox
                checked={filters.examTypes.includes(type.value)}
                onCheckedChange={() => toggleFilter("examTypes", type.value)}
              />
              <span className="text-sm text-neutral-300">{type.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full border-white/10 bg-transparent text-neutral-400 hover:bg-white/5"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">Search Papers</h1>
          <p className="text-neutral-400">
            Browse and discover exam papers from students across colleges
          </p>
        </div>

        {/* Search & Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              placeholder="Search by subject, college, or branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-neutral-500"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filters */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="border-white/10 bg-transparent text-neutral-300 hover:bg-white/5 lg:hidden"
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 bg-indigo-500">{activeFilterCount}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 border-white/10 bg-neutral-900">
                <SheetHeader>
                  <SheetTitle className="text-white">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] border-white/10 bg-white/5 text-neutral-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-neutral-900">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        <AnimatePresence>
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex flex-wrap gap-2"
            >
              {filters.colleges.map((college) => (
                <Badge
                  key={college}
                  variant="secondary"
                  className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 cursor-pointer"
                  onClick={() => toggleFilter("colleges", college)}
                >
                  {college}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
              {filters.subjects.map((subject) => (
                <Badge
                  key={subject}
                  variant="secondary"
                  className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 cursor-pointer"
                  onClick={() => toggleFilter("subjects", subject)}
                >
                  {subject}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
              {filters.semesters.map((sem) => (
                <Badge
                  key={sem}
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                  onClick={() => toggleFilter("semesters", sem)}
                >
                  Semester {sem}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
              {filters.branches.map((branch) => (
                <Badge
                  key={branch}
                  variant="secondary"
                  className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 cursor-pointer"
                  onClick={() => toggleFilter("branches", branch)}
                >
                  {branch}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
              {filters.examTypes.map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 cursor-pointer"
                  onClick={() => toggleFilter("examTypes", type)}
                >
                  {examTypes.find((t) => t.value === type)?.label}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-white">Filters</h2>
                {activeFilterCount > 0 && (
                  <Badge className="bg-indigo-500">{activeFilterCount}</Badge>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : papers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="mb-4 rounded-full bg-white/5 p-6">
                  <FileText className="h-12 w-12 text-neutral-500" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">No papers found</h3>
                <p className="max-w-md text-neutral-400">
                  Try adjusting your filters or search query to find what you&apos;re looking for.
                </p>
                {activeFilterCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-4 border-white/10 bg-transparent text-neutral-300 hover:bg-white/5"
                  >
                    Clear All Filters
                  </Button>
                )}
              </motion.div>
            ) : (
              <>
                <div className="mb-4 text-sm text-neutral-400">
                  Showing {papers.length} papers
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {papers.map((paper, index) => (
                    <PaperCard key={paper._id} paper={paper} index={index} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
