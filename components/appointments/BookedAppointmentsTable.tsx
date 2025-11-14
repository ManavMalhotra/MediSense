"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, update, remove } from "firebase/database";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [loading, setLoading] = useState(true);

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-red-300 text-red-600">
        Error: No user found.
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const q = ref(db, "appointments");

    const unsub = onValue(
      q,
      (snapshot) => {
        if (!snapshot.exists()) {
          setAppointments([]);
          setLoading(false);
          return;
        }

        const data = snapshot.val();
        const arr: Appointment[] = Object.values(data);

        // filter based on role
        const filteredRaw =
          user.role === "doctor"
            ? arr.filter((a) => a.doctorId === user.uid)
            : arr.filter((a) => a.patientId === user.uid);

        // show only future and active
        const filtered = filteredRaw.filter((a) => {
          const isFutureOrToday = a.date >= today;
          const isActive = a.status === "pending" || a.status === "confirmed";
          return isFutureOrToday && isActive;
        });

        setAppointments(filtered);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        toast.error("Failed to load appointments.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user.uid, user.role]);

  const statusColor = (status: string) =>
    cn(
      "px-3 py-1 text-xs rounded-full font-medium",
      status === "pending" && "bg-yellow-100 text-yellow-700",
      status === "confirmed" && "bg-blue-100 text-blue-700",
      status === "completed" && "bg-green-100 text-green-700",
      status === "cancelled" && "bg-red-100 text-red-700"
    );

  // 🔥 NEW: remove from Firebase
  const removeFromFirebase = async (id: string) => {
    try {
      await remove(ref(db, `appointments/${id}`));
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove appointment.");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      if (newStatus === "completed" || newStatus === "cancelled") {
        // DELETE from DB
        await removeFromFirebase(id);

        toast.success(
          `Appointment ${
            newStatus === "completed" ? "completed" : "cancelled"
          }.`
        );

        return;
      }

      // CONFIRM only updates
      await update(ref(db, `appointments/${id}`), { status: newStatus });
      toast.success("Appointment confirmed");

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "confirmed" } : a))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="font-semibold text-lg mb-4 text-gray-800">
        {user.role === "doctor"
          ? "Upcoming Appointments"
          : "Your Upcoming Appointments"}
      </h2>

      {/* Loading */}
      {loading && (
        <div className="py-6 text-center text-gray-500 animate-pulse">
          Loading appointments...
        </div>
      )}

      {/* Empty */}
      {!loading && appointments.length === 0 && (
        <div className="py-8 text-center text-gray-400">
          <p className="text-sm">No upcoming appointments.</p>
        </div>
      )}

      {/* TABLE */}
      {!loading && appointments.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                {user.role === "doctor" && (
                  <th className="p-3 text-left font-medium text-gray-600">
                    Patient
                  </th>
                )}
                <th className="p-3 text-left font-medium text-gray-600">
                  Date
                </th>
                <th className="p-3 text-left font-medium text-gray-600">
                  Time
                </th>
                <th className="p-3 text-left font-medium text-gray-600">
                  Mode
                </th>
                <th className="p-3 text-left font-medium text-gray-600">
                  Status
                </th>
                {user.role === "doctor" && (
                  <th className="p-3 text-left font-medium text-gray-600">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {appointments.map((a) => (
                <tr
                  key={a.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  {user.role === "doctor" && (
                    <td className="p-3 font-medium text-gray-800">
                      {a.patientName ?? "Unknown"}
                    </td>
                  )}

                  <td className="p-3 text-gray-700">{a.date}</td>
                  <td className="p-3 text-gray-700">{a.time}</td>
                  <td className="p-3 capitalize text-gray-700">{a.mode}</td>

                  <td className="p-3">
                    <span className={statusColor(a.status)}>{a.status}</span>
                  </td>

                  {/* DOCTOR ACTIONS */}
                  {user.role === "doctor" && (
                    <td className="p-3 text-gray-700 space-x-3">
                      <button
                        onClick={() => handleStatusChange(a.id, "confirmed")}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Confirm
                      </button>

                      <button
                        onClick={() => handleStatusChange(a.id, "completed")}
                        className="text-green-600 hover:underline text-xs"
                      >
                        Complete
                      </button>

                      <button
                        onClick={() => handleStatusChange(a.id, "cancelled")}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Cancel
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
