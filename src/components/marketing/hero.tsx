"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberTicker } from "@/components/magicui/number-ticker";

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Subtle Notion-style background: faint warm texture */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, rgba(35,131,226,0.04), transparent 40%), radial-gradient(circle at 80% 90%, rgba(15,123,108,0.04), transparent 40%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-[#dfab01]" />
            The future of freelancing
          </span>
        </motion.div>

        {/* Headline — Notion editorial style */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-8 text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.02em] text-[#37352f]"
        >
          <span className="block">Find top talent.</span>
          <span className="block mt-2 text-primary">
            Build the future.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed"
        >
          Connect with world-class freelancers or land your dream project.
          Premium quality, transparent pricing, real results.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="mt-10 mx-auto max-w-xl"
        >
          <div className="relative flex items-center rounded-md border border-input bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <Search className="absolute left-3.5 h-4.5 w-4.5 text-muted-foreground" />
            <Input
              placeholder="Search projects, skills, or freelancers..."
              className="flex-1 border-0 bg-transparent pl-10 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button size="lg" className="rounded px-5" asChild>
              <Link href="/projects">
                Search
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="mt-14 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: 50000, suffix: "+", label: "Freelancers" },
            { value: 2, prefix: "$", suffix: "B+", label: "Earned" },
            { value: 98, suffix: "%", label: "Satisfaction" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl sm:text-3xl font-bold text-[#37352f]">
                <NumberTicker
                  value={stat.value}
                  prefix={stat.prefix ?? ""}
                  suffix={stat.suffix}
                />
              </div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button size="lg" className="px-6" asChild>
            <Link href="/register?role=freelancer">
              Start Freelancing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="px-6" asChild>
            <Link href="/register?role=client">
              Hire Talent
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
