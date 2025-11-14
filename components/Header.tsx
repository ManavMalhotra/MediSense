"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import cardiosense_logo from "@/app/img/cardiosense_logo.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

const CardioSenseLogo = () => (
  <Image
    src={cardiosense_logo}
    alt="CardioSense logo"
    className="w-50 m-2 ms-0 rounded"
  />
);

const mockNotifications = [
  {
    id: 1,
    title: "Notification1 Heading",
    message:
      "doctor's dashboard and the patient's dashboard with the right balance of information is critical",
  },
  {
    id: 2,
    title: "High Alert: Patient At-Risk",
    message:
      "Patient Lakshya Singh's vitals are trending downwards. Please review immediately.",
  },
  {
    id: 3,
    title: "System Update",
    message:
      "The reporting module will be updated tonight at 10 PM. Expect brief downtime.",
  },
];

const DashboardHeader = () => {
  const notificationCount = mockNotifications.length;

  return (
    <header className="bg-white w-full flex items-center justify-between px-6 py-3 border-b border-gray-200">
      LOGO

      <div className="flex items-center gap-4">
        <div className="relative w-72">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Search here..."
            className="pl-11 bg-gray-50 rounded-lg border-gray-200"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:bg-gray-100 rounded-lg"
        >
          <Cog6ToothIcon className="h-6 w-6" />
          <span className="sr-only">Settings</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 h-auto "
            >
              <BellIcon className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">Notifications</span>
              {notificationCount > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {notificationCount}
                </span>
              )}
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-96 p-2 bg-white rounded-lg shadow-lg"
          >
            <DropdownMenuLabel className="px-2 py-1.5 font-semibold">
              Recent Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {mockNotifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className="flex flex-col items-start gap-1 p-3 rounded-md"
              >
                <p className="font-semibold text-gray-800">{notif.title}</p>
                <p className="text-sm text-gray-500 leading-snug whitespace-normal">
                  {notif.message}
                </p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;