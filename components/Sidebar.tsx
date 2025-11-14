"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Home, Calendar, MapPin, Zap, User, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/types/utils";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // 👈 dynamic route detection

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    {
      id: "appointments",
      label: "Manage Appointments",
      icon: Calendar,
      href: "/dashboard/appointments",
    },
    {
      id: "hospitals",
      label: "Nearby Hospitals",
      icon: MapPin,
      href: "/dashboard/hospitals",
    },
    {
      id: "prediction",
      label: "Quick Health Prediction",
      icon: Zap,
      href: "/dashboard/prediction",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"; // Only active on the main dashboard page
    }
    return pathname.startsWith(href); // Subpages
  };

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 h-10 w-10 bg-white shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white border-r transition-all duration-300 flex flex-col shadow-sm",
          isOpen ? "w-64 md:w-20" : "w-0 md:w-20",
          "fixed md:relative h-full z-50 md:z-auto overflow-hidden"
        )}
      >
        {/* Close for mobile */}
        <div className="md:hidden flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-3 flex flex-col items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href); // 👈 real active state

            return (
              <Link
                key={item.id}
                href={item.href}
                className="w-full flex justify-center"
              >
                <Button
                  variant={active ? "default" : "ghost"}
                  size="icon"
                  className={cn("h-11 w-11", active && "shadow-md")}
                  onClick={() => setIsOpen(false)}
                  title={item.label}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Profile */}
        <div className="border-t p-3 flex justify-center">
          <Link href="/profile">
            <Button
              variant={pathname.startsWith("/profile") ? "default" : "ghost"}
              size="icon"
              className="h-11 w-11"
              onClick={() => setIsOpen(false)}
              title="Profile"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </aside>
    </>
  );
}
