"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ChatPanel } from "@/components/dashboard/chat-panel"
import { HospitalsContent } from "@/components/hospitals/hospitals-content"

export default function HospitalsPage() {
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
          {/* Main Hospitals Content */}
          <HospitalsContent />

          {/* Chat Panel */}
          <ChatPanel />
        </div>
      </div>
    </div>
  )
}
