"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderKanban,
  MessageSquare,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { EscrowWidget } from "@/components/payments/escrow-widget";

const spendingData = [
  { month: "Jan", amount: 2400 },
  { month: "Feb", amount: 1398 },
  { month: "Mar", amount: 3800 },
  { month: "Apr", amount: 3908 },
  { month: "May", amount: 4800 },
  { month: "Jun", amount: 5800 },
];

const recentProjects = [
  {
    id: "1",
    title: "SaaS Dashboard Development",
    status: "in_progress",
    budget: 8000,
    bids: 12,
    posted: "2h ago",
  },
  {
    id: "2",
    title: "Mobile App UI/UX Design",
    status: "open",
    budget: 5000,
    bids: 8,
    posted: "5h ago",
  },
  {
    id: "3",
    title: "AI Content Platform",
    status: "open",
    budget: 20000,
    bids: 24,
    posted: "1d ago",
  },
];

const newBids = [
  {
    id: "1",
    freelancer: "Sarah Chen",
    project: "SaaS Dashboard Development",
    price: 7500,
    rating: 4.9,
    submitted: "30m ago",
  },
  {
    id: "2",
    freelancer: "Marcus Rodriguez",
    project: "Mobile App UI/UX Design",
    price: 4800,
    rating: 5.0,
    submitted: "1h ago",
  },
  {
    id: "3",
    freelancer: "David Kim",
    project: "SaaS Dashboard Development",
    price: 7200,
    rating: 4.9,
    submitted: "2h ago",
  },
];

const statusColors: Record<string, string> = {
  open: "bg-[#edf3ec] text-[#0f7b6c]",
  in_progress: "bg-[#e7f3f8] text-[#2383e2]",
  completed: "bg-[#edf3ec] text-[#0f7b6c]",
};

const stats = [
  { label: "Active Projects", value: "3", icon: FolderKanban, change: "+1 this week" },
  { label: "Total Spent", value: "$24,500", icon: DollarSign, change: "+$3,200 this month" },
  { label: "New Bids", value: "7", icon: Users, change: "+3 today" },
  { label: "Unread Messages", value: "4", icon: MessageSquare, change: "2 urgent" },
];

export default function ClientDashboard() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Welcome back, Alex</h1>
        <p className="mt-2 text-muted-foreground">
          Here&apos;s what&apos;s happening with your projects
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border bg-secondary/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                  <Badge variant="success" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Spending Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="border-border bg-secondary/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Spending Overview</CardTitle>
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendingData}>
                    <defs>
                      <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="month"
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                      tickFormatter={(v) => `$${v / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#ffffff",
                        border: "1px solid rgba(55,53,47,0.09)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Spent"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#spendGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* New Bids */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <EscrowWidget actor="client" />
          <Card className="border-border bg-secondary/50 h-full mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>New Bids</CardTitle>
              <Badge>{newBids.length} new</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {newBids.map((bid) => (
                <div key={bid.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {bid.freelancer.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{bid.freelancer}</div>
                        <div className="text-xs text-muted-foreground">{bid.project}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatCurrency(bid.price)}
                      </div>
                      <div className="text-xs text-muted-foreground">{bid.submitted}</div>
                    </div>
                  </div>
                  <Separator className="bg-border" />
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/client/dashboard">View All Bids</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-border bg-secondary/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Projects</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/client/projects">
                View All
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FolderKanban className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{project.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {project.bids} proposals • {project.posted}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {formatCurrency(project.budget)}
                    </span>
                    <Badge className={statusColors[project.status]}>
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
