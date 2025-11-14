"use client";

import { useState } from "react";
import { ref, remove, get } from "firebase/database";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Patient = {
  id: string;
  name: string;
  dob?: string;
  gender?: string;
  height_cm?: string;
  weight_kg?: string;
};

type DoctorDashboardProps = {
  patients: Patient[];
};

export default function DoctorDashboard({ patients }: DoctorDashboardProps) {
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannedId, setScannedId] = useState("");
  const [loadingScan, setLoadingScan] = useState(false);
  const router = useRouter();

  // Open scanner modal
  const handleOpenScanner = () => {
    setShowScannerModal(true);
    setScannedId("");
  };

  // Handle RFID scan input
  const handleScanInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setScannedId(value);

    if (value.length >= 6) {
      setLoadingScan(true);
      try {
        const snapshot = await get(ref(db, `patients/${value}`));
        if (snapshot.exists()) {
          setShowScannerModal(false);
          router.push(`/patient/${value}`);
        } else {
          alert("❌ No patient found with this RFID ID.");
        }
      } catch (err) {
        console.error("Error scanning patient:", err);
        alert("❌ Failed to fetch patient data.");
      } finally {
        setLoadingScan(false);
      }
    }
  };

  const handleRemovePatient = async (id: string) => {
    if (!confirm("Remove this patient?")) return;
    try {
      await remove(ref(db, `patients/${id}`));
      alert("Patient removed successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to remove patient.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>

      {/* Patients Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Individuals / Patients
          </h2>
          <button
            onClick={handleOpenScanner}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            + Scan Patient
          </button>
        </div>

        {patients.length === 0 ? (
          <p className="text-gray-500 italic">No patients found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {patients.map((p) => (
              <li
                key={p.id}
                className="flex justify-between items-center py-4 hover:bg-gray-50 px-4 rounded-lg transition"
              >
                <Link
                  href={`/patient/${p.id}`}
                  className="flex flex-col cursor-pointer"
                >
                  <span className="font-medium text-gray-900">{p.name}</span>
                  <span className="text-sm text-gray-500">{p.id}</span>
                </Link>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleRemovePatient(p.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* RFID Scanner Modal */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
            <button
              onClick={() => setShowScannerModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Scan Patient RFID
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Please scan the patient’s RFID card. If the ID exists, you’ll be
              redirected to their dashboard.
            </p>

            <input
              type="text"
              autoFocus
              value={scannedId}
              onChange={handleScanInput}
              disabled={loadingScan}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Waiting for RFID scan..."
            />

            {scannedId && (
              <p className="mt-3 text-sm text-gray-700">
                <span className="font-medium">Scanned ID:</span> {scannedId}
              </p>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowScannerModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
