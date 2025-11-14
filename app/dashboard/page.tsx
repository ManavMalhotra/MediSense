"use client";

import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAppSelector } from "@/store/hooks";
import DoctorDashboard from "@/components/DoctorDashboard";
import PatientDashboard from "@/components/PatientDashboard";
import { Dashboard } from "@/components/dashboard/dashboard";

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [patientData, setPatientData] = useState<any>(null);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        if (user.role === "patient" && user.patientDataId) {
          const snap = await get(ref(db, `patients/${user.patientDataId}`));
          if (snap.exists()) setPatientData(snap.val());
        } else if (user.role === "doctor") {
          const snap = await get(ref(db, "patients"));
          if (snap.exists()) {
            const patients = Object.entries(snap.val()).map(([id, data]) => ({
              id,
              ...(data as any),
            }));
            setPatientsList(patients);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) return <div>Loading dashboard...</div>;

  if (!user) return <div>No user found. Please login again.</div>;

  return user.role === "doctor" ? (
    <DoctorDashboard patients={patientsList} />
  ) : (
    <PatientDashboard patientId={user.patientDataId} />
  );
}
