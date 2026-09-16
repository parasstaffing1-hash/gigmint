"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  Clock,
  Briefcase,
  Globe,
  Github,
  Linkedin,
  Twitter,
  ExternalLink,
  Edit,
  Shield,
  Award,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

const profile = {
  id: "1",
  name: "Sarah Chen",
  role: "Senior Full-Stack Developer",
  bio: "Passionate full-stack developer with 8+ years of experience building scalable web applications. I specialize in React, Node.js, and cloud infrastructure. I love turning complex problems into elegant, user-friendly solutions.",
  avatar_url: null,
  location: "San Francisco, CA",
  hourly_rate: 120,
  skills: [
    "React",
    "TypeScript",
    "Node.js",
    "PostgreSQL",
    "AWS",
    "Docker",
    "GraphQL",
    "Tailwind CSS",
  ],
  availability: "available" as const,
  completed_jobs: 52,
  total_earned: 185000,
  rating: 4.9,
  review_count: 47,
  member_since: "2023",
  social_links: {
    website: "https://sarahchen.dev",
    github: "github.com/sarahchen",
    linkedin: "linkedin.com/in/sarahchen",
    twitter: "twitter.com/sarahchen",
  },
  languages: ["English", "Mandarin"],
  portfolio: [
    {
      id: "1",
      title: "E-Commerce Platform",
      description: "Built a full-stack e-commerce platform with Next.js, Stripe, and PostgreSQL.",
      type: "web",
    },
    {
      id: "2",
      title: "Analytics Dashboard",
      description: "Real-time analytics dashboard with D3.js and WebSocket integration.",
      type: "web",
    },
    {
      id: "3",
      title: "Mobile Banking App",
      description: "React Native mobile app with biometric authentication and real-time transactions.",
      type: "mobile",
    },
  ],
  reviews: [
    {
      id: "1",
      reviewer: "TechCorp Inc.",
      rating: 5,
      comment:
        "Sarah delivered exceptional work on our SaaS dashboard. Her technical skills and communication were outstanding. Highly recommended!",
      date: "2 weeks ago",
    },
    {
      id: "2",
      reviewer: "StartupXYZ",
      rating: 5,
      comment:
        "Working with Sarah was a pleasure. She understood our requirements perfectly and delivered ahead of schedule.",
      date: "1 month ago",
    },
  ],
  stats: {
    response_time: "< 1 hour",
    completion_rate: "100%",
    on_time_delivery: "98%",
  },
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border bg-secondary/50 overflow-hidden">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20" />

            <CardContent className="relative px-6 pb-6">
              {/* Avatar */}
              <div className="absolute -top-12 left-6">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    SC
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-4">
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              {/* Info */}
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <Shield className="h-5 w-5 text-[#2383e2]" />
                </div>
                <p className="text-muted-foreground mt-1">{profile.role}</p>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Member since {profile.member_since}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-[#dfab01] text-[#dfab01]" />
                    {profile.rating} ({profile.review_count} reviews)
                  </span>
                </div>

                {/* Availability */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-green-400">Available for work</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-border bg-secondary/50">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {profile.bio}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-border bg-secondary/50">
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Portfolio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border bg-secondary/50">
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-border bg-secondary/50 hover:border-border transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="border-border bg-secondary/50">
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {profile.reviews.map((review) => (
                    <div key={review.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {review.reviewer}
                        </span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-3 w-3 fill-[#dfab01] text-[#dfab01]"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {review.date}
                      </span>
                      <Separator className="mt-4 bg-border" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-border bg-secondary/50">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {formatCurrency(profile.hourly_rate)}
                    </div>
                    <div className="text-sm text-muted-foreground">/hour</div>
                  </div>
                  <Button className="w-full">Contact</Button>
                  <Separator className="bg-border" />
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        Jobs Completed
                      </span>
                      <span className="font-medium">{profile.completed_jobs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        Total Earned
                      </span>
                      <span className="font-medium">
                        {formatCurrency(profile.total_earned)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Response Time
                      </span>
                      <span className="font-medium">
                        {profile.stats.response_time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Completion Rate
                      </span>
                      <span className="font-medium">
                        {profile.stats.completion_rate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        On-Time Delivery
                      </span>
                      <span className="font-medium">
                        {profile.stats.on_time_delivery}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Languages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-border bg-secondary/50">
                <CardHeader>
                  <CardTitle className="text-base">Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {profile.languages.map((lang) => (
                      <div key={lang} className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{lang}</span>
                        <span className="text-muted-foreground ml-auto">
                          Native
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border bg-secondary/50">
                <CardHeader>
                  <CardTitle className="text-base">Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {profile.social_links.website && (
                      <a
                        href={profile.social_links.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </a>
                    )}
                    {profile.social_links.github && (
                      <a
                        href={`https://${profile.social_links.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Github className="h-4 w-4" />
                        GitHub
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </a>
                    )}
                    {profile.social_links.linkedin && (
                      <a
                        href={`https://${profile.social_links.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </a>
                    )}
                    {profile.social_links.twitter && (
                      <a
                        href={`https://${profile.social_links.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Twitter className="h-4 w-4" />
                        Twitter
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
