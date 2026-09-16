"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Globe,
  CreditCard,
  MessageSquare,
  BarChart3,
} from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Verified Professionals",
    description:
      "Every freelancer is vetted. Work with verified, top-tier talent you can trust.",
  },
  {
    icon: Zap,
    title: "Fast Matching",
    description:
      "AI-powered matching connects you with the perfect freelancer in hours, not weeks.",
  },
  {
    icon: Globe,
    title: "Global Talent Pool",
    description:
      "Access 50,000+ professionals across 190+ countries. The world's best talent, at your fingertips.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Escrow-protected payments. Release funds only when you're satisfied with the work.",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Collaboration",
    description:
      "Built-in messaging, file sharing, and project management. Everything you need in one place.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track spending, monitor progress, and make data-driven decisions with real-time analytics.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function Benefits() {
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
            Why choose <span className="text-primary">Gigmint</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            We've reimagined freelancing from the ground up. Here's what makes
            us different.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.title}
              variants={itemVariants}
              className="group relative rounded-lg border border-border bg-background p-6 transition-colors duration-150 hover:bg-secondary"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-4 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                <benefit.icon className="h-6 w-6 text-[#2383e2]" />
              </div>
              <h3 className="text-lg font-semibold">{benefit.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
