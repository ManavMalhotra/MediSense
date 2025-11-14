"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ChatPanel } from "@/components/dashboard/chat-panel"
import { AppointmentForm } from "./appointment-form"
import { BookedAppointmentsTable } from "./booked-appointments-table"

export function Appointments() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background flex-col md:flex-row">
      <Sidebar isOpen={sidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content with Chat - Stack vertically on mobile, horizontal on lg+ */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Main Appointments Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Appointment Form */}
              <AppointmentForm />

              {/* Booked Appointments Table */}
              <BookedAppointmentsTable />
            </div>
          </div>

          {/* Chat Panel */}
          <ChatPanel />
        </div>
      </div>
    </div>
  )
}
