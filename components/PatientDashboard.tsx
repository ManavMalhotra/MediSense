"use client";

import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import HealthScoreGraph from "@/components/HealthScoreGraph";
import CheckupHistoryTable from "@/components/CheckupHistoryTable";

type Report = {
  date: string;
  title: string;
  summary: string;
  filePath: string;
};

type PatientData = {
  name: string;
  dob: string;
  gender: string;
  height_cm: number;
  weight_kg: number;
  previous_diseases: string[];
  reports: Report[];
};

export default function PatientDashboard({
  patientId,
}: {
  patientId?: string;
}) {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = patientId || localStorage.getItem("patientId");
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchPatient = async () => {
      try {
        const snapshot = await get(ref(db, `patients/${id}`));
        if (snapshot.exists()) {
          setPatient(snapshot.val() as PatientData);
        }
      } catch (err) {
        console.error("Error fetching patient:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  if (loading) {
    return <div className="p-6">Loading patient data...</div>;
  }

  if (!patient) {
    return <div className="p-6 text-red-500">No patient data found.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Live Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
          🔴 Live{" "}
          <span className="text-gray-500 font-normal">Live readings</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 border rounded flex items-center justify-center text-gray-400">
            Space for Live Readings
          </div>
          <div className="h-40 border rounded flex items-center justify-center text-gray-400">
            Space for Graph
          </div>
        </div>
      </div>

      {/* Health Score */}
      {/* <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-600">
            {patient.reports?.length > 0 ? "96.28%" : "--"}{" "}
            <span className="text-gray-600 text-base">Health Score</span>
          </h2>
        </div>
        <HealthScoreGraph />
      </div> */}

      {/* Checkup History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Checkup History</h2>
        {patient.reports && patient.reports.length > 0 ? (
          <CheckupHistoryTable reports={patient.reports} />
        ) : (
          <p className="text-gray-500">No reports available.</p>
        )}
      </div>
    </div>
  );
}
