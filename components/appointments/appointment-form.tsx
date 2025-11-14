"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ref, push, set, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAppSelector } from "@/store/hooks";

type DoctorInfo = {
  uid: string;
  displayName: string;
  email: string | null;
  role: string;
};

export function AppointmentForm() {
  const user = useAppSelector((s) => s.auth.user);

  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [specialist, setSpecialist] = useState("");
  const [slot, setSlot] = useState("");
  const [mode, setMode] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // 🔥 Fetch all doctors from DB
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const snap = await get(ref(db, "users"));
        if (!snap.exists()) {
          setDoctors([]);
          return;
        }

        const usersObj = snap.val();

        const docs = Object.values(usersObj)
          .filter((u: any) => u.role === "doctor")
          .map((u: any) => ({
            uid: u.uid,
            displayName: u.displayName ?? "Unnamed Doctor",
            email: u.email ?? "",
            role: u.role,
          }));

        setDoctors(docs);
      } catch (err) {
        console.error("Error loading doctors:", err);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return alert("User not logged in");
    if (!specialist || !slot || !mode) return;

    setLoading(true);

    try {
      const appointmentId = push(ref(db, "appointments")).key!;

      const appointmentData = {
        id: appointmentId,
        doctorId: specialist,
        patientId: user.uid,
        patientDataId: user.patientDataId ?? null,
        patientName: user.name || "Unknown Patient",
        patientEmail: user.email || "N/A",

        date: new Date().toISOString().split("T")[0],
        time: slot,
        mode,
        status: "pending",
        createdAt: Date.now(),
      };

      await set(ref(db, `appointments/${appointmentId}`), appointmentData);

      alert("Appointment booked successfully!");

      setSpecialist("");
      setSlot("");
      setMode("");
    } catch (err) {
      console.error("Error booking appointment:", err);
      alert("Failed to book appointment");
    }

    setLoading(false);
  };

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

              <Select
                value={specialist}
                onValueChange={setSpecialist}
                disabled={loadingDoctors}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      loadingDoctors
                        ? "Loading doctors..."
                        : "Choose specialist"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {doctors.length === 0 && (
                    <SelectItem disabled value="none">
                      No doctors found
                    </SelectItem>
                  )}

                  {doctors.map((doc) => (
                    <SelectItem key={doc.uid} value={doc.uid}>
                      {doc.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Appointment Slot */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select appointment slot *
              </label>
              <Select value={slot} onValueChange={setSlot}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                  <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                  <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                  <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                  <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                  <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mode */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Mode of appointment *
              </label>
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

          <div className="flex justify-start pt-4">
            <Button
              type="submit"
              disabled={!specialist || !slot || !mode || loading}
              className="w-full md:w-auto"
            >
              {loading ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
