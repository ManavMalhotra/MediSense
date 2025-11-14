"use client"

import { useState } from "react"
import { Bell, Settings, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const notifications = [
    { id: 1, message: "Your appointment is tomorrow at 2 PM", time: "2 hours ago" },
    { id: 2, message: "Blood pressure reading is slightly elevated", time: "1 hour ago" },
    { id: 3, message: "New health report available", time: "30 minutes ago" },
  ]

  return (
    <header className="border-b border-border bg-card h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Logo and Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden h-8 w-8 sm:h-10 sm:w-10">
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div className="flex items-center gap-2">
          {/* <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs sm:text-sm">CS</span>
          </div> */}
          <span className="font-bold text-sm sm:text-lg hidden sm:inline">CardioSense</span>
        </div>
      </div>

      {/* Right: Settings and Notifications */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Notifications Dropdown */}
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-10 sm:w-10">
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
                <p className="font-medium">{notif.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings Button */}
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </header>
  )
}
