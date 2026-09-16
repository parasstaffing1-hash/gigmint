"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Users,
  FolderKanban,
  DollarSign,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Eye,
  Ban,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

const analyticsData = [
  { month: "Jan", users: 400, revenue: 12400 },
  { month: "Feb", users: 520, revenue: 15800 },
  { month: "Mar", users: 680, revenue: 22400 },
  { month: "Apr", users: 840, revenue: 28000 },
  { month: "May", users: 1020, revenue: 35200 },
  { month: "Jun", users: 1200, revenue: 42000 },
];

const recentUsers = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah@example.com",
    role: "freelancer",
    status: "active",
    joined: "2d ago",
  },
  {
    id: "2",
    name: "TechCorp Inc.",
    email: "admin@techcorp.com",
    role: "client",
    status: "active",
    joined: "5d ago",
  },
  {
    id: "3",
    name: "Marcus Rodriguez",
    email: "marcus@example.com",
    role: "freelancer",
    status: "pending_verification",
    joined: "1d ago",
  },
  {
    id: "4",
    name: "SpamBot 3000",
    email: "spam@bot.com",
    role: "freelancer",
    status: "suspended",
    joined: "3d ago",
  },
  {
    id: "5",
    name: "InnovateLabs",
    email: "hello@innovate.co",
    role: "client",
    status: "active",
    joined: "1w ago",
  },
];

const pendingReviews = [
  {
    id: "1",
    type: "company_verification",
    title: "Company Verification: RetailPro",
    description: "RetailPro has submitted documents for verification",
    status: "pending",
  },
  {
    id: "2",
    type: "project_report",
    title: "Report: Suspicious project listing",
    description: "User reported a project as potentially fraudulent",
    status: "pending",
  },
  {
    id: "3",
    type: "user_report",
    title: "Report: Inappropriate content",
    description: "A freelancer profile was reported for inappropriate content",
    status: "pending",
  },
];

const stats = [
  { label: "Total Users", value: "12,458", icon: Users, change: "+12%" },
  { label: "Active Projects", value: "3,247", icon: FolderKanban, change: "+8%" },
  { label: "Monthly Revenue", value: "$42K", icon: DollarSign, change: "+24%" },
  { label: "Pending Reviews", value: "3", icon: AlertTriangle, change: "Needs attention" },
];

const statusColors: Record<string, string> = {
  active: "bg-[#edf3ec] text-[#0f7b6c]",
  pending_verification: "bg-[#fbf3db] text-[#a87900]",
  suspended: "bg-[#fdebec] text-[#e03e3e]",
};

export default function AdminDashboard() {
  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your marketplace
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
                    <Badge variant="info" className="text-xs">{stat.change}</Badge>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Analytics Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="border-border bg-secondary/50">
            <CardHeader>
              <CardTitle>Platform Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "#ffffff",
                        border: "1px solid rgba(55,53,47,0.09)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border bg-secondary/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Users</CardTitle>
                <Button variant="ghost" size="sm">View All</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {user.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[user.status]}>
                          {user.status.replace("_", " ")}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              Verify
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-border bg-secondary/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pending Reviews</CardTitle>
                <Badge>{pendingReviews.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingReviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-3 rounded-lg border border-border bg-secondary/50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium">{review.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {review.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
