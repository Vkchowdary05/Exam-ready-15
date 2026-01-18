"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  FileText,
  Loader2,
  ChevronDown,
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
import { papersApi, statsApi } from "@/lib/api";
import { getColleges, getAllBranches, getAllSubjects, semesters as dropdownSemesters, examTypes as dropdownExamTypes } from "@/lib/dropdown-data";
import type { IPaper, IFilters, IPaperFilters } from "@/types";

const semesters = dropdownSemesters.map(s => s.replace('Sem ', '').replace(/[a-z]/g, '') + (s.includes('1') ? 'st' : s.includes('2') ? 'nd' : s.includes('3') ? 'rd' : 'th'));
const examTypes = [
  { value: "semester", label: "Semester Exam" },
  { value: "mid1", label: "Mid-1" },
  { value: "mid2", label: "Mid-2" },
];
const sortOptions = [
  { value: "recent", label: "Most Recent" },
  { value: "liked", label: "Most Liked" },
  { value: "verified", label: "Verified First" },
  { value: "oldest", label: "Oldest" },
];

const Loading = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <Loader2 className="w-12 h-12 animate-spin text-primary" />
  </div>
);

function SearchPapersPageContent() {
  const searchParams = useSearchParams();
  const [papers, setPapers] = useState<IPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter options - merge static data with API
  const [collegeOptions, setCollegeOptions] = useState<string[]>(getColleges());
  const [subjectOptions, setSubjectOptions] = useState<string[]>(getAllSubjects());
  const [branchOptions, setBranchOptions] = useState<string[]>(getAllBranches());
  const [optionsLoading, setOptionsLoading] = useState(false);

  const [filters, setFilters] = useState<IFilters>({
    colleges: [],
    subjects: [],
    semesters: [],
    branches: [],
    examTypes: [],
    yearRange: { min: 2018, max: 2025 },
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  });

  // Optionally merge with API data for any database-only entries
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [collegesRes, subjectsRes, branchesRes] = await Promise.all([
          statsApi.getColleges(),
          statsApi.getSubjects(),
          statsApi.getBranches()
        ]);

        // Merge with static data
        if (collegesRes.success && collegesRes.data) {
          setCollegeOptions(prev => [...new Set([...prev, ...(collegesRes.data || [])])]);
        }
        if (subjectsRes.success && subjectsRes.data) {
          setSubjectOptions(prev => [...new Set([...prev, ...(subjectsRes.data || [])])]);
        }
        if (branchesRes.success && branchesRes.data) {
          setBranchOptions(prev => [...new Set([...prev, ...(branchesRes.data || [])])]);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch papers from API
  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true);
      try {
        const apiFilters: IPaperFilters = {
          college: filters.colleges.length > 0 ? filters.colleges : undefined,
          subject: filters.subjects.length > 0 ? filters.subjects : undefined,
          semester: filters.semesters.length > 0 ? filters.semesters : undefined,
          branch: filters.branches.length > 0 ? filters.branches : undefined,
          examType: filters.examTypes.length > 0 ? filters.examTypes : undefined,
          sortBy: sortBy as 'recent' | 'liked' | 'verified' | 'oldest',
        };

        const response = await papersApi.search(apiFilters, pagination.page, pagination.pageSize);

        if (response.success && response.data) {
          // Handle the response - check if it's paginated data
          const data = response.data as any;
          if (Array.isArray(data)) {
            setPapers(data);
            setPagination(prev => ({ ...prev, totalCount: data.length }));
          } else if (data.data && Array.isArray(data.data)) {
            setPapers(data.data);
            setPagination(prev => ({
              ...prev,
              totalCount: data.totalCount || data.data.length,
              totalPages: data.totalPages || 1
            }));
          } else {
            setPapers([]);
          }
        } else {
          console.error('Failed to fetch papers:', response.error);
          setPapers([]);
        }
      } catch (error) {
        console.error('Error fetching papers:', error);
        setPapers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [filters, sortBy, pagination.page, pagination.pageSize]);

  // Filter papers by search query (client-side)
  const filteredPapers = papers.filter(paper => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      paper.subject?.toLowerCase().includes(query) ||
      paper.college?.toLowerCase().includes(query) ||
      paper.branch?.toLowerCase().includes(query)
    );
  });

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

  const FilterSection = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
      <div className="border-b border-neutral-200 dark:border-neutral-800 py-4 last:border-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left mb-2 group"
        >
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-1 pb-2">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const FilterContent = () => (
    <div className="space-y-1">
      {/* Colleges */}
      <FilterSection title="College">
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
          {optionsLoading ? (
            <div className="flex items-center gap-2 text-neutral-500 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : collegeOptions.length === 0 ? (
            <p className="text-sm text-neutral-500 py-2">No colleges found</p>
          ) : (
            collegeOptions.map((college) => (
              <label
                key={college}
                className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Checkbox
                  className="mt-0.5 border-neutral-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  checked={filters.colleges.includes(college)}
                  onCheckedChange={() => toggleFilter("colleges", college)}
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400 leading-tight">{college}</span>
              </label>
            ))
          )}
        </div>
      </FilterSection>

      {/* Subjects */}
      <FilterSection title="Subject">
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
          {optionsLoading ? (
            <div className="flex items-center gap-2 text-neutral-500 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : subjectOptions.length === 0 ? (
            <p className="text-sm text-neutral-500 py-2">No subjects found</p>
          ) : (
            subjectOptions.map((subject) => (
              <label
                key={subject}
                className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Checkbox
                  className="mt-0.5 border-neutral-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  checked={filters.subjects.includes(subject)}
                  onCheckedChange={() => toggleFilter("subjects", subject)}
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400 leading-tight">{subject}</span>
              </label>
            ))
          )}
        </div>
      </FilterSection>

      {/* Semesters */}
      <FilterSection title="Semester">
        <div className="flex flex-wrap gap-2">
          {semesters.map((sem) => (
            <button
              key={sem}
              onClick={() => toggleFilter("semesters", sem)}
              className={`h-9 min-w-[36px] px-2.5 rounded-lg text-sm font-medium transition-all ${filters.semesters.includes(sem)
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:border-indigo-300 hover:text-indigo-600"
                }`}
            >
              {sem.replace(/[a-z]/g, '')}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Branches */}
      <FilterSection title="Branch" defaultOpen={false}>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
          {optionsLoading ? (
            <div className="flex items-center gap-2 text-neutral-500 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : branchOptions.length === 0 ? (
            <p className="text-sm text-neutral-500 py-2">No branches found</p>
          ) : (
            branchOptions.map((branch) => (
              <label
                key={branch}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Checkbox
                  className="border-neutral-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  checked={filters.branches.includes(branch)}
                  onCheckedChange={() => toggleFilter("branches", branch)}
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{branch}</span>
              </label>
            ))
          )}
        </div>
      </FilterSection>

      {/* Exam Type */}
      <FilterSection title="Exam Type" defaultOpen={false}>
        <div className="space-y-2">
          {examTypes.map((type) => (
            <label
              key={type.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Checkbox
                className="border-neutral-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                checked={filters.examTypes.includes(type.value)}
                onCheckedChange={() => toggleFilter("examTypes", type.value)}
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">{type.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="w-full mt-4 text-neutral-500 hover:text-destructive hover:bg-destructive/5"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-neutral-50/50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">Find Your Papers</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">
              Search through thousands of exam papers from various colleges and semesters
            </p>
          </div>

          {/* Search & Controls */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                placeholder="Search by subject, college, or branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 pl-11 shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filters */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 px-4 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 lg:hidden rounded-xl"
                  >
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge className="ml-2 bg-indigo-600 hover:bg-indigo-700">{activeFilterCount}</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-12 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-8 items-start">
            {/* Desktop Sidebar */}
            <aside className="hidden w-72 shrink-0 lg:block sticky top-24">
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold text-neutral-900 dark:text-white">Filters</h2>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Reset</button>
                  )}
                </div>
                <FilterContent />
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              {/* Active Filters Display */}
              <AnimatePresence>
                {activeFilterCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 flex flex-wrap gap-2"
                  >
                    {[...filters.colleges, ...filters.subjects, ...filters.semesters, ...filters.branches].map((filter, i) => (
                      <Badge
                        key={`${filter}-${i}`}
                        variant="secondary"
                        className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200 pl-3 pr-1 py-1 gap-1 text-sm font-normal cursor-pointer"
                        onClick={() => {
                          // Naive removal - in real app would need to know type or iterate types. 
                          // For UI demo, Clear All is easier, but here we can try:
                          if (filters.colleges.includes(filter)) toggleFilter("colleges", filter);
                          else if (filters.subjects.includes(filter)) toggleFilter("subjects", filter);
                          else if (filters.semesters.includes(filter)) toggleFilter("semesters", filter);
                          else if (filters.branches.includes(filter)) toggleFilter("branches", filter);
                        }}
                      >
                        {filter}
                        <X className="h-3.5 w-3.5 text-neutral-400 hover:text-neutral-600" />
                      </Badge>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 animate-pulse" />
                  ))}
                </div>
              ) : filteredPapers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-24 text-center rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 border-dashed"
                >
                  <div className="mb-6 rounded-full bg-neutral-50 dark:bg-neutral-800 p-8">
                    <Search className="h-12 w-12 text-neutral-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">No papers found</h3>
                  <p className="max-w-md text-neutral-500 dark:text-neutral-400">
                    We couldn't find any papers matching your filters. Try adjusting your search criteria.
                  </p>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="link"
                      onClick={clearFilters}
                      className="mt-4 text-indigo-600"
                    >
                      Clear all filters
                    </Button>
                  )}
                </motion.div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredPapers.map((paper, index) => (
                    <PaperCard key={paper._id} paper={paper} variant="minimal" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SearchPapersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchPapersPageContent />
    </Suspense>
  );
}
