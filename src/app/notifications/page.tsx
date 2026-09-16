"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  FileText,
  MessageSquare,
  DollarSign,
  Star,
  CheckCircle2,
  AlertCircle,
  Settings,
  Check,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn, formatRelativeTime } from "@/lib/utils";

const notifications = [
  {
    id: "1",
    type: "new_bid",
    title: "New proposal received",
    message: "Sarah Chen submitted a proposal for SaaS Dashboard Development",
    read: false,
    link: "/projects/1",
    time: "5m ago",
  },
  {
    id: "2",
    type: "message_received",
    title: "New message",
    message: "TechCorp Inc. sent you a message",
    read: false,
    link: "/messages",
    time: "15m ago",
  },
  {
    id: "3",
    type: "bid_accepted",
    title: "Proposal accepted!",
    message: "Your proposal for E-commerce Website Redesign was accepted",
    read: false,
    link: "/projects/4",
    time: "1h ago",
  },
  {
    id: "4",
    type: "review_received",
    title: "New review",
    message: "RetailPro left you a 5-star review",
    read: true,
    link: "/profile/me",
    time: "3h ago",
  },
  {
    id: "5",
    type: "project_updated",
    title: "Project updated",
    message: "Mobile App UI/UX Design project requirements were updated",
    read: true,
    link: "/projects/2",
    time: "5h ago",
  },
  {
    id: "6",
    type: "payment_received",
    title: "Payment received",
    message: "You received $4,800 for Mobile App UI/UX Design",
    read: true,
    link: "/freelancer/earnings",
    time: "1d ago",
  },
];

const iconMap: Record<string, React.ElementType> = {
  new_bid: FileText,
  message_received: MessageSquare,
  bid_accepted: CheckCircle2,
  review_received: Star,
  project_updated: AlertCircle,
  payment_received: DollarSign,
};

const colorMap: Record<string, string> = {
  new_bid: "bg-[#e7f3f8] text-[#2383e2]",
  message_received: "bg-[#f6f3f9] text-[#6940a5]",
  bid_accepted: "bg-[#edf3ec] text-[#0f7b6c]",
  review_received: "bg-[#fbf3db] text-[#a87900]",
  project_updated: "bg-[#fbecdd] text-[#b56a1c]",
  payment_received: "bg-[#edf3ec] text-[#0f7b6c]",
};

export default function NotificationsPage() {
  const [items, setItems] = React.useState(notifications);

  const unreadCount = items.filter((n) => !n.read).length;

  function markAsRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAllAsRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function renderNotification(notif: (typeof notifications)[0]) {
    const Icon = iconMap[notif.type] || Bell;
    return (
      <motion.div
        key={notif.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          href={notif.link}
          onClick={() => markAsRead(notif.id)}
          className={cn(
            "flex items-start gap-4 p-4 rounded-xl transition-colors",
            !notif.read
              ? "bg-secondary/50 border border-border"
              : "hover:bg-secondary/50"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
              colorMap[notif.type]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{notif.title}</span>
              {!notif.read && (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {notif.message}
            </p>
            <span className="text-xs text-muted-foreground mt-1 block">
              {notif.time}
            </span>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="mt-1 text-muted-foreground">
                You have {unreadCount} unread notifications
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </motion.div>

        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2 h-5 text-xs">
                {items.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge className="ml-2 h-5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-2">
            {items.map(renderNotification)}
          </TabsContent>

          <TabsContent value="unread" className="space-y-2">
            {items.filter((n) => !n.read).map(renderNotification)}
            {items.filter((n) => !n.read).length === 0 && (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">All caught up!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
