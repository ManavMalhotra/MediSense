"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AppointmentForm() {
  const [specialist, setSpecialist] = useState("")
  const [slot, setSlot] = useState("")
  const [mode, setMode] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (specialist && slot && mode) {
      console.log("Appointment booked:", { specialist, slot, mode })
      // Reset form
      setSpecialist("")
      setSlot("")
      setMode("")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Book Appointment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Select Specialist */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select specialist *</label>
              <Select value={specialist} onValueChange={setSpecialist}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose specialist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dr-ayush">Dr. Ayush Srivastava</SelectItem>
                  <SelectItem value="dr-lakshya">Dr. Lakshya Singh</SelectItem>
                  <SelectItem value="dr-harsh">Dr. Harsh Draveriya</SelectItem>
                  <SelectItem value="dr-aastha">Dr. Aastha Rastogi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Select Appointment Slot */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select appointment slot *</label>
              <Select value={slot} onValueChange={setSlot}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00">09:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="02:00">02:00 PM</SelectItem>
                  <SelectItem value="03:00">03:00 PM</SelectItem>
                  <SelectItem value="04:00">04:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mode of Appointment */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Mode of appointment *</label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-start pt-4">
            <Button type="submit" disabled={!specialist || !slot || !mode} className="w-full md:w-auto">
              Book Appointment
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
