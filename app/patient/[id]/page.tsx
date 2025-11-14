"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ref, get } from "firebase/database";
import { db } from "@/types/firebase";
import PatientDashboard from "@/components/PatientDashboard";

type Patient = {
  id: string;
  name: string;
  dob?: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  reports?: any[];
};

export default function PatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPatient = async () => {
      try {
        const snapshot = await get(ref(db, `patients/${id}`));
        if (snapshot.exists()) {
          setPatient({ id: id as string, ...snapshot.val() });
        }
      } catch (err) {
        console.error("Error fetching patient:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!patient)
    return <div className="p-6 text-red-500">Patient not found</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Patient Details
          </h2>
          <span className="text-sm text-gray-500">Last updated: Today</span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 uppercase">Patient ID</p>
              <p className="text-sm font-medium text-gray-800">{patient.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Date of Birth</p>
              <p className="text-sm font-medium text-gray-800">
                {patient.dob || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Height</p>
              <p className="text-sm font-medium text-gray-800">
                {patient.height_cm || "Not set"} cm
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 uppercase">Name</p>
              <p className="text-sm font-medium text-gray-800">
                {patient.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Gender</p>
              <p className="text-sm font-medium text-gray-800">
                {patient.gender || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Weight</p>
              <p className="text-sm font-medium text-gray-800">
                {patient.weight_kg || "Not set"} kg
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Dashboard (pass the ID explicitly!) */}
      <PatientDashboard patientId={id as string} patientData={patient} />
    </div>
  );
}
