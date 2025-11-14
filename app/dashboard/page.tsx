"use client";

import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAppSelector } from "@/store/hooks";
import DoctorDashboard from "@/components/DoctorDashboard";
import PatientDashboard from "@/components/PatientDashboard";
import { PatientData } from "@/types/patient";
import { AuthUser } from "@/types/auth";

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user) as AuthUser | null;

  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [patientsList, setPatientsList] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) {
    return <div>No user found. Please log in again.</div>;
  }

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        if (user.role === "patient" && user.patientDataId) {
          const refPath = ref(db, `patients/${user.patientDataId}`);
          const snap = await get(refPath);

          if (snap.exists()) {
            const data = snap.val() as Record<string, unknown>;
            setPatientData({
              id: user.patientDataId,
              ...(data as Record<string, unknown>),
            });
          }
        }

        if (user.role === "doctor") {
          const refPath = ref(db, "patients");
          const snap = await get(refPath);

          if (snap.exists()) {
            const raw = snap.val() as Record<string, unknown>;

            const patients = Object.entries(raw).map(
              ([id, data]) =>
                ({
                  id,
                  ...(data as Record<string, unknown>),
                } as PatientData)
            );

            setPatientsList(patients);
          }
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) return <div>Loading dashboard...</div>;

  if (!user) return <div>No user found. Please log in again.</div>;

  if (user.role === "doctor") {
    // @ts-ignore
    return <DoctorDashboard patients={patientsList} />;
  }

  return (
    <PatientDashboard
      patientId={user.patientDataId ?? ""}
      patientData={patientData}
    />
  );
}
