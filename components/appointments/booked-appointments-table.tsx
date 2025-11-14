"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Appointment {
  id: string
  date: string
  time: string
  mode: string
  specialist: string
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    date: "27-Sept-2025",
    time: "10:00 AM",
    mode: "Online",
    specialist: "Dr. Ayush Srivastava",
  },
  {
    id: "2",
    date: "23-Sept-2025",
    time: "02:00 PM",
    mode: "Online",
    specialist: "Dr. Ayush Srivastava",
  },
  {
    id: "3",
    date: "20-Sept-2025",
    time: "11:00 AM",
    mode: "In-Person",
    specialist: "Dr. Lakshya Singh",
  },
  {
    id: "4",
    date: "18-Sept-2025",
    time: "03:00 PM",
    mode: "Phone",
    specialist: "Dr. Harsh Draveriya",
  },
]

export function BookedAppointmentsTable() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)

  const handleCancel = (id: string) => {
    setAppointments(appointments.filter((apt) => apt.id !== id))
  }

  const handleReschedule = (id: string) => {
    console.log("Reschedule appointment:", id)
    // This would open a modal or navigate to reschedule page
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Booked Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop View - Table */}
        <div className="hidden md:block">
          <ScrollArea className="w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Date & Time</TableHead>
                  <TableHead className="min-w-[120px]">Mode</TableHead>
                  <TableHead className="min-w-[180px]">Specialist</TableHead>
                  <TableHead className="min-w-[200px]">Operations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="text-sm">
                      {appointment.date} + {appointment.time}
                    </TableCell>
                    <TableCell className="text-sm">{appointment.mode}</TableCell>
                    <TableCell className="text-sm">{appointment.specialist}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleReschedule(appointment.id)}>
                          Reschedule
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this appointment? This action cannot be undone.
                            </AlertDialogDescription>
                            <div className="flex gap-2 justify-end">
                              <AlertDialogCancel>Keep</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancel(appointment.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Cancel Appointment
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {/* Mobile View - Card Layout */}
        <div className="md:hidden space-y-3">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="p-4 border">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-muted-foreground">Date & Time</p>
                    <p className="text-sm font-medium">
                      {appointment.date} + {appointment.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Mode</p>
                    <p className="text-sm font-medium">{appointment.mode}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Specialist</p>
                  <p className="text-sm font-medium">{appointment.specialist}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => handleReschedule(appointment.id)}
                  >
                    Reschedule
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex-1">
                        Cancel
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel this appointment? This action cannot be undone.
                      </AlertDialogDescription>
                      <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Keep</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleCancel(appointment.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Cancel Appointment
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {appointments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No appointments booked yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
