"use client"

import { useState } from "react"
import { Home, Calendar, MapPin, Zap, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface SidebarProps {
  isOpen: boolean
}

export function Sidebar({ isOpen }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("dashboard")

  const topItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    { id: "appointments", label: "Manage Appointments", icon: Calendar, href: "/appointments" },
    { id: "hospitals", label: "Nearby Hospitals", icon: MapPin, href: "/hospitals" },
    { id: "prediction", label: "Quick Health Prediction", icon: Zap, href: "/prediction" },
  ]

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" />}

      <aside
        className={cn(
          "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
          isOpen ? "w-64 md:w-20" : "w-0 md:w-20",
          "fixed md:relative h-full z-40 md:z-auto",
        )}
      >
        <div className="md:hidden flex justify-end p-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {}}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Top Navigation Items */}
        <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto flex flex-col items-center md:items-center">
          {topItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.id} href={item.href}>
                <Button
                  variant={activeItem === item.id ? "default" : "ghost"}
                  size="icon"
                  className="h-10 w-10 md:h-10 md:w-10"
                  onClick={() => setActiveItem(item.id)}
                  title={item.label}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Profile Section */}
        <div className="border-t border-sidebar-border p-2 flex justify-center">
          <Link href="/profile">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setActiveItem("profile")}
              title="Profile"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </aside>
    </>
  )
}
