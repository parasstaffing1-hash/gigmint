"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Send,
  Paperclip,
  Smile,
  Image,
  MoreVertical,
  Phone,
  Video,
  Search,
  Check,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";

// Mock conversations
const conversations = [
  {
    id: "1",
    name: "TechCorp Inc.",
    lastMessage: "Sounds good! Let's proceed with the proposal.",
    time: "5m ago",
    unread: 2,
    online: true,
    messages: [
      {
        id: "1",
        sender: "them",
        content: "Hi Sarah! We saw your proposal for the SaaS dashboard project. Looks great!",
        time: "2:30 PM",
        read: true,
      },
      {
        id: "2",
        sender: "me",
        content: "Thanks! I'm very excited about this project. Do you have any questions about my approach?",
        time: "2:35 PM",
        read: true,
      },
      {
        id: "3",
        sender: "them",
        content: "Yes, could you tell us more about the real-time data streaming approach you'd use?",
        time: "2:40 PM",
        read: true,
      },
      {
        id: "4",
        sender: "me",
        content: "I'd use WebSocket connections with a Redis pub/sub layer for real-time updates. This allows us to handle thousands of concurrent connections while maintaining low latency. For the frontend, I'd use a custom hook with Server-Sent Events as a fallback.",
        time: "2:45 PM",
        read: true,
      },
      {
        id: "5",
        sender: "them",
        content: "Sounds good! Let's proceed with the proposal.",
        time: "2:50 PM",
        read: false,
      },
    ],
  },
  {
    id: "2",
    name: "StartupXYZ",
    lastMessage: "The designs look amazing! When can you start?",
    time: "1h ago",
    unread: 0,
    online: false,
    messages: [],
  },
  {
    id: "3",
    name: "InnovateLabs",
    lastMessage: "Perfect, I'll review the codebase and get back to you.",
    time: "3h ago",
    unread: 0,
    online: true,
    messages: [],
  },
  {
    id: "4",
    name: "RetailPro",
    lastMessage: "Thanks for the update on the project.",
    time: "1d ago",
    unread: 0,
    online: false,
    messages: [],
  },
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = React.useState(
    conversations[0]
  );
  const [newMessage, setNewMessage] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  React.useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  function sendMessage() {
    if (!newMessage.trim()) return;

    const message = {
      id: String(Date.now()),
      sender: "me",
      content: newMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: true,
    };

    setSelectedConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
      lastMessage: newMessage,
    }));
    setNewMessage("");
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Conversation List */}
        <div className="w-full sm:w-80 border-r border-border flex flex-col bg-background">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors",
                    selectedConversation.id === conv.id
                      ? "bg-secondary"
                      : "hover:bg-secondary"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {conv.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">{conv.name}</span>
                      <span className="text-xs text-muted-foreground">{conv.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <Badge className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center mt-1">
                      {conv.unread}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="hidden sm:flex flex-1 flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {selectedConversation.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{selectedConversation.name}</div>
                <div className="text-xs text-muted-foreground">
                  {selectedConversation.online ? "Online" : "Offline"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              {selectedConversation.messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex",
                    msg.sender === "me" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2.5",
                      msg.sender === "me"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary rounded-bl-md"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <div
                      className={cn(
                        "flex items-center gap-1 mt-1",
                        msg.sender === "me"
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      <span className="text-xs opacity-60">{msg.time}</span>
                      {msg.sender === "me" && (
                        msg.read ? (
                          <CheckCheck className="h-3.5 w-3.5 opacity-60" />
                        ) : (
                          <Check className="h-3.5 w-3.5 opacity-60" />
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-end gap-2 max-w-3xl mx-auto">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Image className="h-4 w-4" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="icon"
                className="shrink-0"
                onClick={sendMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
