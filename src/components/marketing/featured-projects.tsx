"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";

// Mock data — replace with Supabase queries
const featuredProjects = [
  {
    id: "1",
    title: "Build a SaaS Dashboard with Real-Time Analytics",
    category: "Web Development",
    budget_min: 5000,
    budget_max: 10000,
    project_type: "fixed" as const,
    skills: ["React", "TypeScript", "D3.js", "PostgreSQL"],
    client_name: "TechCorp Inc.",
    location: "San Francisco, CA",
    posted_at: "2h ago",
    bid_count: 12,
  },
  {
    id: "2",
    title: "Design a Premium Mobile App UI/UX",
    category: "UI/UX Design",
    budget_min: 3000,
    budget_max: 6000,
    project_type: "fixed" as const,
    skills: ["Figma", "Prototyping", "iOS Design", "Motion Design"],
    client_name: "StartupXYZ",
    location: "New York, NY",
    posted_at: "5h ago",
    bid_count: 8,
  },
  {
    id: "3",
    title: "AI-Powered Content Generation Platform",
    category: "AI & Machine Learning",
    budget_min: 15000,
    budget_max: 25000,
    project_type: "fixed" as const,
    skills: ["Python", "OpenAI", "FastAPI", "React"],
    client_name: "InnovateLabs",
    location: "Remote",
    posted_at: "1d ago",
    bid_count: 24,
  },
];

export function FeaturedProjects() {
  return (
    <section className="py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Featured Projects
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              High-quality projects from verified clients
            </p>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link href="/projects">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/projects/${project.id}`}>
                <Card className="h-full border-border bg-secondary/50 hover:border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge variant="info">{project.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {project.posted_at}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold line-clamp-2 mb-3">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(project.budget_min)} -{" "}
                        {formatCurrency(project.budget_max)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {project.location}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {project.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {project.client_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          {project.client_name}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {project.bid_count} bids
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" asChild>
            <Link href="/projects">
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
