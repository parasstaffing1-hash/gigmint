"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  DollarSign,
  Eye,
  Users,
  MessageSquare,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { EscrowWidget } from "@/components/payments/escrow-widget";

const earningsData = [
  { month: "Jan", amount: 3200 },
  { month: "Feb", amount: 4500 },
  { month: "Mar", amount: 3800 },
  { month: "Apr", amount: 6200 },
  { month: "May", amount: 5400 },
  { month: "Jun", amount: 7800 },
];

const applications = [
  {
    id: "1",
    project: "SaaS Dashboard Development",
    client: "TechCorp Inc.",
    price: 7500,
    status: "pending",
    submitted: "2h ago",
  },
  {
    id: "2",
    project: "Mobile App UI/UX Design",
    client: "StartupXYZ",
    price: 4800,
    status: "shortlisted",
    submitted: "1d ago",
  },
  {
    id: "3",
    project: "E-commerce Website Redesign",
    client: "RetailPro",
    price: 12000,
    status: "accepted",
    submitted: "3d ago",
  },
];

const invitations = [
  {
    id: "1",
    project: "Build a Chat Application",
    client: "SocialMedia Co.",
    budget: "$5,000 - $10,000",
    posted: "5h ago",
  },
  {
    id: "2",
    project: "DevOps Pipeline Setup",
    client: "CloudFirst Inc.",
    budget: "$3,000 - $6,000",
    posted: "1d ago",
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-[#fbf3db] text-[#a87900]",
  shortlisted: "bg-[#e7f3f8] text-[#2383e2]",
  accepted: "bg-[#edf3ec] text-[#0f7b6c]",
  rejected: "bg-[#fdebec] text-[#e03e3e]",
};

const stats = [
  { label: "Active Applications", value: "5", icon: FileText, change: "+2 this week" },
  { label: "Total Earnings", value: "$38,200", icon: DollarSign, change: "+$7,800 this month" },
  { label: "Profile Views", value: "142", icon: Eye, change: "+23 today" },
  { label: "Invitations", value: "2", icon: Users, change: "New" },
];

export default function FreelancerDashboard() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Welcome back, Sarah</h1>
        <p className="mt-2 text-muted-foreground">
          Here&apos;s an overview of your freelance activity
        </p>
      </motion.div>

      {/* Stats */}
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
                  <Badge variant="success" className="text-xs">{stat.change}</Badge>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Earnings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="border-border bg-secondary/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Earnings Overview</CardTitle>
              <Button variant="ghost" size="sm">
                View Details
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earningsData}>
                    <defs>
                      <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
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
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Earned"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#earnGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Invitations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <EscrowWidget actor="freelancer" />
          <Card className="border-border bg-secondary/50 h-full mt-6">
            <CardHeader>
              <CardTitle>Invitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invitations.map((inv) => (
                <div key={inv.id} className="p-3 rounded-lg border border-border bg-secondary/50">
                  <div className="font-medium text-sm">{inv.project}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {inv.client} • {inv.budget}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1">Accept</Button>
                    <Button size="sm" variant="outline" className="flex-1">Decline</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Applications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-border bg-secondary/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/freelancer/projects">
                View All
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{app.project}</div>
                      <div className="text-sm text-muted-foreground">
                        {app.client} • Submitted {app.submitted}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {formatCurrency(app.price)}
                    </span>
                    <Badge className={statusColors[app.status]}>
                      {app.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
