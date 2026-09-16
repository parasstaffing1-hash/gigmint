"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Fuse from "fuse.js";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn, formatCurrency } from "@/lib/utils";
import { CATEGORIES, EXPERIENCE_LEVELS, BUDGET_RANGES } from "@/config/constants";
import type { Project, ProjectFilters } from "@/types";

// Mock data — replace with Supabase queries
const mockProjects: (Project & { client_name: string })[] = [
  {
    id: "1",
    client_id: "c1",
    title: "Build a SaaS Dashboard with Real-Time Analytics",
    description: "Looking for an experienced developer to build a modern SaaS dashboard...",
    category: "Web Development",
    budget_min: 5000,
    budget_max: 10000,
    project_type: "fixed",
    status: "open",
    experience_level: "intermediate",
    skills: ["React", "TypeScript", "D3.js", "PostgreSQL"],
    deadline: null,
    location: "San Francisco, CA",
    attachments: [],
    visibility: "public",
    bid_count: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client_name: "TechCorp Inc.",
  },
  {
    id: "2",
    client_id: "c2",
    title: "Design a Premium Mobile App UI/UX",
    description: "We need a talented designer for our mobile app...",
    category: "UI/UX Design",
    budget_min: 3000,
    budget_max: 6000,
    project_type: "fixed",
    status: "open",
    experience_level: "expert",
    skills: ["Figma", "Prototyping", "iOS Design"],
    deadline: null,
    location: "New York, NY",
    attachments: [],
    visibility: "public",
    bid_count: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client_name: "StartupXYZ",
  },
  {
    id: "3",
    client_id: "c3",
    title: "AI-Powered Content Generation Platform",
    description: "Build an AI content platform using GPT-4...",
    category: "AI & Machine Learning",
    budget_min: 15000,
    budget_max: 25000,
    project_type: "fixed",
    status: "open",
    experience_level: "expert",
    skills: ["Python", "OpenAI", "FastAPI", "React"],
    deadline: null,
    location: "Remote",
    attachments: [],
    visibility: "public",
    bid_count: 24,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client_name: "InnovateLabs",
  },
  {
    id: "4",
    client_id: "c4",
    title: "E-commerce Website Redesign",
    description: "Complete redesign of our existing e-commerce platform...",
    category: "Web Development",
    budget_min: 8000,
    budget_max: 15000,
    project_type: "hourly",
    status: "open",
    experience_level: "intermediate",
    skills: ["Next.js", "Tailwind CSS", "Stripe"],
    deadline: null,
    location: "London, UK",
    attachments: [],
    visibility: "public",
    bid_count: 16,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client_name: "RetailPro",
  },
  {
    id: "5",
    client_id: "c5",
    title: "Mobile App for Fitness Tracking",
    description: "Cross-platform fitness tracking app with social features...",
    category: "Mobile Development",
    budget_min: 10000,
    budget_max: 20000,
    project_type: "fixed",
    status: "open",
    experience_level: "intermediate",
    skills: ["React Native", "Firebase", "UI Design"],
    deadline: null,
    location: "Remote",
    attachments: [],
    visibility: "public",
    bid_count: 19,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client_name: "FitLife Co.",
  },
  {
    id: "6",
    client_id: "c6",
    title: "Brand Identity & Logo Design",
    description: "Complete brand identity package for a new tech startup...",
    category: "Graphic Design",
    budget_min: 2000,
    budget_max: 4000,
    project_type: "fixed",
    status: "open",
    experience_level: "entry",
    skills: ["Logo Design", "Branding", "Illustrator"],
    deadline: null,
    location: "Toronto, Canada",
    attachments: [],
    visibility: "public",
    bid_count: 31,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client_name: "NewTech Startup",
  },
];

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<ProjectFilters>({
    search: "",
    category: [],
    budget_min: null,
    budget_max: null,
    project_type: null,
    experience_level: null,
    location: null,
  });
  const [showFilters, setShowFilters] = React.useState(false);

  // Fuse.js search
  const fuse = React.useMemo(
    () =>
      new Fuse(mockProjects, {
        keys: ["title", "description", "skills", "category", "client_name"],
        threshold: 0.3,
      }),
    []
  );

  const filteredProjects = React.useMemo(() => {
    let results = searchQuery
      ? fuse.search(searchQuery).map((r) => r.item)
      : mockProjects;

    if (filters.category.length > 0) {
      results = results.filter((p) => filters.category.includes(p.category));
    }
    if (filters.project_type) {
      results = results.filter((p) => p.project_type === filters.project_type);
    }
    if (filters.experience_level) {
      results = results.filter(
        (p) => p.experience_level === filters.experience_level
      );
    }
    if (filters.budget_min) {
      results = results.filter((p) => p.budget_max >= filters.budget_min!);
    }
    if (filters.budget_max) {
      results = results.filter((p) => p.budget_min <= filters.budget_max!);
    }

    return results;
  }, [searchQuery, filters, fuse]);

  const activeFilterCount =
    filters.category.length +
    (filters.project_type ? 1 : 0) +
    (filters.experience_level ? 1 : 0) +
    (filters.budget_min || filters.budget_max ? 1 : 0);

  function clearFilters() {
    setFilters({
      search: "",
      category: [],
      budget_min: null,
      budget_max: null,
      project_type: null,
      experience_level: null,
      location: null,
    });
    setSearchQuery("");
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">Browse Projects</h1>
          <p className="mt-2 text-muted-foreground">
            Find your next opportunity from {mockProjects.length}+ projects
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by title, skill, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Filter Projects</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Category Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Category</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {CATEGORIES.map((cat) => (
                      <div key={cat} className="flex items-center gap-2">
                        <Checkbox
                          id={cat}
                          checked={filters.category.includes(cat)}
                          onCheckedChange={(checked) => {
                            setFilters((prev) => ({
                              ...prev,
                              category: checked
                                ? [...prev.category, cat]
                                : prev.category.filter((c) => c !== cat),
                            }));
                          }}
                        />
                        <Label htmlFor={cat} className="text-sm cursor-pointer">
                          {cat}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Project Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Project Type</Label>
                  <div className="flex gap-3">
                    {["fixed", "hourly"].map((type) => (
                      <Button
                        key={type}
                        variant={filters.project_type === type ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            project_type:
                              prev.project_type === type ? null : (type as "fixed" | "hourly"),
                          }))
                        }
                      >
                        {type === "fixed" ? "Fixed Price" : "Hourly"}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Experience Level */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Experience Level</Label>
                  <Select
                    value={filters.experience_level || ""}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        experience_level: value as "entry" | "intermediate" | "expert" | null,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Level</SelectItem>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Budget Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Budget Range</Label>
                  <div className="space-y-2">
                    {BUDGET_RANGES.map((range) => (
                      <Button
                        key={range.label}
                        variant={
                          filters.budget_min === range.min ? "default" : "outline"
                        }
                        size="sm"
                        className="w-full justify-start"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            budget_min: prev.budget_min === range.min ? null : range.min,
                            budget_max: prev.budget_min === range.min ? null : range.max,
                          }))
                        }
                      >
                        {range.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFilterCount > 0 && (
                  <Button variant="ghost" className="w-full" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </motion.div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.category.map((cat) => (
              <Badge key={cat} variant="secondary" className="gap-1">
                {cat}
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      category: prev.category.filter((c) => c !== cat),
                    }))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {filters.project_type && (
              <Badge variant="secondary" className="gap-1">
                {filters.project_type === "fixed" ? "Fixed Price" : "Hourly"}
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, project_type: null }))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No projects found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/projects/${project.id}`}>
                  <Card className="border-border bg-background hover:bg-secondary">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="info" className="text-xs">
                              {project.category}
                            </Badge>
                            <Badge variant={project.project_type === "fixed" ? "default" : "secondary"} className="text-xs">
                              {project.project_type === "fixed" ? "Fixed Price" : "Hourly"}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold line-clamp-1 mb-2">
                            {project.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {project.skills.slice(0, 4).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {project.skills.length > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{project.skills.length - 4}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {formatCurrency(project.budget_min)} -{" "}
                              {formatCurrency(project.budget_max)}
                            </span>
                            {project.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {project.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {project.bid_count} bids
                            </span>
                          </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {project.client_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{project.client_name}</span>
                          </div>
                          <Badge variant="success" className="text-xs">
                            {project.experience_level}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
