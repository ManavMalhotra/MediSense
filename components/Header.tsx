"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Bell, Settings, Menu } from "lucide-react";
import cardiosense_logo from "@/app/img/cardiosense_logo.svg";

// Mock notifications (fixed missing fields)
const mockNotifications = [
  {
    id: 1,
    title: "Notification1 Heading",
    message:
      "doctor's dashboard and the patient's dashboard with the right balance of information is critical",
    time: "2m ago",
  },
  {
    id: 2,
    title: "High Alert: Patient At-Risk",
    message:
      "Patient Lakshya Singh's vitals are trending downwards. Please review immediately.",
    time: "10m ago",
  },
  {
    id: 3,
    title: "System Update",
    message:
      "The reporting module will be updated tonight at 10 PM. Expect brief downtime.",
    time: "1h ago",
  },
];

// Better logo component
const CardioSenseLogo = () => (
  <Image
    src={cardiosense_logo}
    alt="CardioSense logo"
    className="w-50 m-2 ms-0 rounded"
  />
);

const DashboardHeader = () => {
  // FIX: missing state
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // FIX: notifications reference
  const notifications = mockNotifications;

  // FIX: placeholder for menu click
  const onMenuClick = () => {
    console.log("Menu clicked");
  };

  return (
    <header className="border-b border-border bg-card h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Logo and Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden h-8 w-8 sm:h-10 sm:w-10"
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        <div className="flex items-center gap-2">
          {/* <CardioSenseLogo /> */}

          <span className="font-bold text-sm sm:text-lg hidden sm:inline">
            CardioSense
          </span>
        </div>
      </div>

      {/* Right: Settings + Notifications */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Notifications Dropdown */}
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 sm:h-10 sm:w-10"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-72 sm:w-80">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm">Notifications</h3>
            </div>

            {notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className="flex flex-col items-start py-3 px-4 cursor-default hover:bg-muted text-xs sm:text-sm"
              >
                <p className="font-medium">{notif.title}</p>
                <p>{notif.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {notif.time}
                </p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
