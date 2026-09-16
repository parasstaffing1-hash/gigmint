"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";

const featuredFreelancers = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Senior Full-Stack Developer",
    hourly_rate: 120,
    rating: 4.9,
    reviews: 47,
    location: "San Francisco, CA",
    skills: ["React", "Node.js", "TypeScript", "AWS"],
    completed_jobs: 52,
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    role: "UI/UX Design Lead",
    hourly_rate: 95,
    rating: 5.0,
    reviews: 38,
    location: "New York, NY",
    skills: ["Figma", "Design Systems", "Prototyping"],
    completed_jobs: 41,
  },
  {
    id: "3",
    name: "Aiko Tanaka",
    role: "AI/ML Engineer",
    hourly_rate: 150,
    rating: 4.8,
    reviews: 29,
    location: "Tokyo, Japan",
    skills: ["Python", "TensorFlow", "PyTorch", "LLMs"],
    completed_jobs: 33,
  },
  {
    id: "4",
    name: "David Kim",
    role: "Mobile Developer",
    hourly_rate: 85,
    rating: 4.9,
    reviews: 62,
    location: "Seoul, South Korea",
    skills: ["React Native", "Flutter", "Swift", "Kotlin"],
    completed_jobs: 67,
  },
];

export function FeaturedFreelancers() {
  return (
    <section className="py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Top Freelancers
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Work with the best talent in the industry
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredFreelancers.map((freelancer, index) => (
            <motion.div
              key={freelancer.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/profile/${freelancer.id}`}>
                <Card className="h-full border-border bg-secondary/50 hover:border-border text-center">
                  <CardContent className="p-6">
                    <Avatar className="h-16 w-16 mx-auto mb-4">
                      <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                        {freelancer.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold">{freelancer.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {freelancer.role}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Star className="h-4 w-4 fill-[#dfab01] text-[#dfab01]" />
                      <span className="text-sm font-medium">
                        {freelancer.rating}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({freelancer.reviews})
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {freelancer.location}
                    </div>
                    <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                      {freelancer.skills.slice(0, 2).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <span className="text-lg font-bold">
                        {formatCurrency(freelancer.hourly_rate)}
                      </span>
                      <span className="text-sm text-muted-foreground">/hr</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
