"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Marquee } from "@/components/magicui/marquee";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  type: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Emily Watson",
    role: "CEO, TechStart",
    content:
      "Gigmint completely changed how we hire. We found our lead developer in 48 hours, and the quality was exceptional. The escrow system gave us peace of mind.",
    rating: 5,
    type: "Client",
  },
  {
    name: "James Park",
    role: "Full-Stack Developer",
    content:
      "I've tried every freelance platform. Gigmint is the only one where I feel valued as a professional. The clients are serious, the pay is fair, and the tools are incredible.",
    rating: 5,
    type: "Freelancer",
  },
  {
    name: "Maria Santos",
    role: "Product Manager, InnovateCo",
    content:
      "The quality of freelancers on Gigmint is unmatched. We've built our entire engineering team through this platform. The matching algorithm is genuinely smart.",
    rating: 5,
    type: "Client",
  },
  {
    name: "David Chen",
    role: "Motion Designer",
    content:
      "Proposal to payout in one week. The milestone system keeps everything transparent, and clients here actually respect craft. I've doubled my rate since joining.",
    rating: 5,
    type: "Freelancer",
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="h-full border-border bg-secondary/50">
      <CardContent className="p-6">
        <Quote className="h-8 w-8 text-[#2383e2]/30 mb-4" />
        <p className="text-sm leading-relaxed mb-6">{testimonial.content}</p>
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-[#dfab01] text-[#dfab01]"
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {testimonial.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">{testimonial.name}</div>
            <div className="text-xs text-muted-foreground">{testimonial.role}</div>
          </div>
          <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
            {testimonial.type}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function Testimonials() {
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
          <h2 className="text-3xl sm:text-4xl font-bold">Loved by thousands</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't take our word for it. Here's what our community says.
          </p>
        </motion.div>

        <Marquee pauseOnHover>
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
