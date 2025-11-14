"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useAppSelector } from "@/store/hooks";

type Appointment = {
  id: string;
  doctorId: string;
  patientId: string;
  patientName?: string;
  date: string;
  time: string;
  mode: string;
  status: string;
};

export function BookedAppointmentsTable() {
  const user = useAppSelector((s) => s.auth.user);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // FIX: Early return for user
  if (!user) {
    return (
      <div className="bg-white p-6 rounded shadow text-red-500">
        Error: No user found.
      </div>
    );
  }

  useEffect(() => {
    const q = ref(db, "appointments");

    const unsub = onValue(q, (snapshot) => {
      if (!snapshot.exists()) {
        setAppointments([]);
        return;
      }

      const data = snapshot.val();
      const arr: Appointment[] = Object.values(data);

      const filtered =
        user.role === "doctor"
          ? arr.filter((a) => a.doctorId === user.uid)
          : arr.filter((a) => a.patientId === user.uid);

      setAppointments(filtered);
    });

    return () => unsub();
  }, [user.uid, user.role]);
  
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="font-bold text-lg mb-4">Appointments</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            {user.role === "doctor" && (
              <th className="p-2 text-left">Patient</th>
            )}
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Time</th>
            <th className="p-2 text-left">Mode</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((a) => (
            <tr key={a.id} className="border-b">
              {user.role === "doctor" && (
                <td className="p-2 font-medium">
                  {a.patientName ?? "Unknown"}
                </td>
              )}
              <td className="p-2">{a.date}</td>
              <td className="p-2">{a.time}</td>
              <td className="p-2 capitalize">{a.mode}</td>
              <td className="p-2">{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
