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

import { Input } from "@/components/ui/input";
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
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [mode, setMode] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const slots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

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
    if (!specialist || !slot || !mode || !date) return;

    setLoading(true);

    try {
      const appointmentId = push(ref(db, "appointments")).key!;

      const appointmentData = {
        id: appointmentId,
        doctorId: specialist,
        patientId: user.uid,
        patientDataId: user.patientDataId ?? null,
        patientName: user.fullName || "Unknown Patient",
        patientEmail: user.email || "N/A",

        date,
        time: slot,
        mode,
        status: "pending",
        createdAt: Date.now(),
      };

      await set(ref(db, `appointments/${appointmentId}`), appointmentData);

      alert("Appointment booked successfully!");

      setSpecialist("");
      setDate("");
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SELECT DOCTOR */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Specialist *</label>
            <Select
              value={specialist}
              onValueChange={setSpecialist}
              disabled={loadingDoctors}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    loadingDoctors ? "Loading doctors..." : "Choose specialist"
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

          {/* DATE PICKER */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Date *</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
            />
          </div>

          {/* TIME SLOT PILL BUTTONS */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Time Slot *</label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {slots.map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={slot === t ? "default" : "outline"}
                  onClick={() => setSlot(t)}
                  className="py-2"
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          {/* MODE BUTTONS */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mode of Appointment *</label>

            <div className="flex flex-wrap gap-2">
              {["online", "in-person", "phone"].map((m) => (
                <Button
                  key={m}
                  type="button"
                  variant={mode === m ? "default" : "outline"}
                  onClick={() => setMode(m)}
                  className="capitalize"
                >
                  {m}
                </Button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={!specialist || !slot || !mode || !date || loading}
            className="w-full md:w-auto mt-4"
          >
            {loading ? "Booking..." : "Book Appointment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
