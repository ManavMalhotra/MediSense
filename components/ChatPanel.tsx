"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";

// --- TYPE DEFINITIONS ---
type ChatUser = {
  id: number;
  name: string;
  initials: string;
  unreadCount: number;
};

type ChatMessage = {
  id: number;
  text: string;
  sender: "doctor" | "patient";
};

// --- MOCK DATA ---
const mockChatUsers: ChatUser[] = [
  { id: 1, name: "Ayush Srivastava", initials: "AS", unreadCount: 1 },
  { id: 2, name: "Lakshya Singh", initials: "LS", unreadCount: 1 },
  { id: 3, name: "Harsh Draveriya", initials: "HD", unreadCount: 0 },
  { id: 4, name: "Aastha Rastogi", initials: "AR", unreadCount: 0 },
];

const mockMessages: ChatMessage[] = [
  { id: 1, text: "Do you require a checkup?", sender: "patient" },
  { id: 2, text: "Yes, I've been feeling a bit off today.", sender: "doctor" },
  {
    id: 3,
    text: "Okay, I am scheduling a remote consultation for 2 PM. Please be available.",
    sender: "patient",
  },
];

// --- SEPARATE CHILD COMPONENTS ---

function ChatListView({
  users,
  onSelectChat,
}: {
  users: ChatUser[];
  onSelectChat: (user: ChatUser) => void;
}) {
  return (
    <>
      <CardHeader className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg text-gray-800">Chats</h2>
      </CardHeader>

      <CardContent className="relative px-2 space-y-1 overflow-y-auto w-full h-full">
        <div className="absolute wifull h-full inset-0 bg-gradient-to-b from-[#8B5CF6] to-[#3B82F6] opacity-15 pointer-events-none"></div>

        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelectChat(user)}
            className="w-full flex items-center gap-4 p-3 rounded-lg text-left hover:bg-black/5 transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{user.name}</p>
            </div>
            {user.unreadCount > 0 && (
              <div className="bg-indigo-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {user.unreadCount}
              </div>
            )}
          </button>
        ))}
      </CardContent>
    </>
  );
}

function ChatDetailView({
  user,
  messages,
  onGoBack,
}: {
  user: ChatUser;
  messages: ChatMessage[];
  onGoBack: () => void;
}) {
  return (
    <>
      <CardHeader className="flex flex-row items-center gap-4 p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={onGoBack}
          className="rounded-full"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        <h2 className="font-semibold text-lg">{user.name}</h2>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "doctor" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-xs ${
                msg.sender === "doctor"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </CardContent>
      <div className="p-4 border-t bg-white">
        <div className="relative">
          <Input placeholder="Type a message..." className="pr-12 rounded-lg" />
          <Button
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-indigo-500 hover:bg-indigo-600 rounded-lg"
          >
            <PaperAirplaneIcon className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </>
  );
}

// --- MAIN PARENT COMPONENT ---

export default function ChatPanel() {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);

  // DEBUGGING: Log the current state every time the component re-renders
  console.log("Current selected user:", selectedUser);

  const handleSelectChat = (user: ChatUser) => {
    // DEBUGGING: Log which user was clicked
    console.log(`Setting selected user to: ${user.name}`);
    setSelectedUser(user);
  };

  const handleGoBack = () => {
    console.log("Going back to chat list.");
    setSelectedUser(null);
  };

  return (
    <Card className="h-full bg-[#FBFBFF] border-none shadow-sm flex flex-col">
      {selectedUser ? (
        <ChatDetailView
          user={selectedUser}
          messages={mockMessages}
          onGoBack={handleGoBack}
        />
      ) : (
        <ChatListView users={mockChatUsers} onSelectChat={handleSelectChat} />
      )}
    </Card>
  );
}
