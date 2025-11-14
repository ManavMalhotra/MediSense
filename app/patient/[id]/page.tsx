"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ref, get, set, push, update, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAppSelector } from "@/store/hooks";
import { Loader2, Trash2, Edit2, Plus } from "lucide-react";
import { format } from "date-fns";
import PatientDashboard from "@/components/PatientDashboard";

type Patient = {
  id: string;
  name?: string;
  dob?: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  reports?: any[];
  vitals?: Record<
    string,
    {
      id: string;
      title: string;
      value: string;
      date: string; // ISO yyyy-mm-dd
      recordedBy?: string;
      createdAt?: number;
    }
  >;
};

export default function PatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingVitalId, setEditingVitalId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // quick form fields (used for add & edit)
  const [vitalForm, setVitalForm] = useState({
    title: "Heart Rate",
    value: "",
    date: new Date().toISOString().slice(0, 10), // default to today yyyy-mm-dd
  });

  const user = useAppSelector((state) => state.auth.user) as any | null;

  // load patient once
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchPatient = async () => {
      try {
        setLoading(true);
        const snapshot = await get(ref(db, `patients/${id}`));
        if (snapshot.exists()) {
          setPatient({
            id: id as string,
            ...(snapshot.val() as object),
          } as Patient);
        } else {
          setPatient(null);
        }
      } catch (err) {
        console.error("Error fetching patient:", err);
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  // helpers to write to firebase and update local state
  const refreshLocalVitals = (updatedVitals?: Patient["vitals"]) => {
    setPatient((p) => (p ? { ...p, vitals: updatedVitals ?? p.vitals } : p));
  };

  const addVital = async () => {
    if (!id) return;
    if (!vitalForm.title || !vitalForm.value) {
      alert("Please provide both a title and value for the vital.");
      return;
    }

    try {
      // create a stable key
      const newKey = push(ref(db, `patients/${id}/vitals`)).key!;
      const payload = {
        id: newKey,
        title: vitalForm.title,
        value: vitalForm.value,
        date: vitalForm.date,
        recordedBy: user?.uid ?? "unknown",
        createdAt: Date.now(),
      };

      await set(ref(db, `patients/${id}/vitals/${newKey}`), payload);

      // update local
      const newVitals = { ...(patient?.vitals ?? {}), [newKey]: payload };
      refreshLocalVitals(newVitals);

      // reset form quickly (date stays today)
      setVitalForm((f) => ({ ...f, value: "" }));
      setIsAdding(false);
    } catch (err) {
      console.error("Failed to add vital:", err);
      alert("Failed to add vital.");
    }
  };

  const startEditVital = (vitalId: string) => {
    const v = patient?.vitals?.[vitalId];
    if (!v) return;
    setEditingVitalId(vitalId);
    setVitalForm({
      title: v.title,
      value: v.value,
      date: v.date,
    });
  };

  const saveEditVital = async () => {
    if (!id || !editingVitalId) return;
    try {
      const payload = {
        title: vitalForm.title,
        value: vitalForm.value,
        date: vitalForm.date,
        // do not overwrite recordedBy/createdAt
      };

      await update(ref(db, `patients/${id}/vitals/${editingVitalId}`), payload);

      // update local state copy
      const updatedVitals = { ...(patient?.vitals ?? {}) };
      if (updatedVitals[editingVitalId]) {
        updatedVitals[editingVitalId] = {
          ...updatedVitals[editingVitalId],
          ...payload,
        };
      }
      refreshLocalVitals(updatedVitals);
      setEditingVitalId(null);
      setVitalForm({
        title: "Heart Rate",
        value: "",
        date: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      console.error("Failed to save vital edit:", err);
      alert("Failed to save changes.");
    }
  };

  const deleteVital = async (vitalId: string) => {
    if (!confirm("Delete this vital? This action cannot be undone.")) return;
    try {
      await remove(ref(db, `patients/${id}/vitals/${vitalId}`));
      const updated = { ...(patient?.vitals ?? {}) };
      delete updated[vitalId];
      refreshLocalVitals(updated);
    } catch (err) {
      console.error("Failed to delete vital:", err);
      alert("Failed to delete.");
    }
  };

  // small utility: sorted list newest first
  const vitalsArray = patient?.vitals
    ? Object.values(patient.vitals).sort(
        (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)
      )
    : [];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-indigo-600" />
      </div>
    );
  }

  if (!patient) {
    return <div className="p-6 text-red-500">Patient not found</div>;
  }

  const isDoctor = user?.role === "doctor";

  return (
    <div className="flex flex-col gap-6">
      {/* Header / Basic Details */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Patient Details
            </h2>
            <p className="text-sm text-gray-500">Last updated: Today</p>
          </div>
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
                {patient.height_cm ?? "Not set"} cm
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 uppercase">Name</p>
              <p className="text-sm font-medium text-gray-800">
                {patient.name ?? "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Gender</p>
              <p className="text-sm font-medium text-gray-800">
                {patient.gender ?? "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Weight</p>
              <p className="text-sm font-medium text-gray-800">
                {patient.weight_kg ?? "Not set"} kg
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* VITALS SECTION */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Vitals</h3>
            <p className="text-sm text-gray-500">
              Doctor-editable vitals and quick-add.
            </p>
          </div>

          {/* Doctor controls: quick add toggle */}
          {isDoctor && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsAdding((v) => !v);
                  // reset form when toggling on
                  setVitalForm({
                    title: "Heart Rate",
                    value: "",
                    date: new Date().toISOString().slice(0, 10),
                  });
                  setEditingVitalId(null);
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
              >
                <Plus className="h-4 w-4" />
                Add Vital
              </button>
            </div>
          )}
        </div>

        {/* Add / Edit Form (only for doctor) */}
        {isDoctor && (isAdding || editingVitalId) && (
          <div className="border rounded-lg p-4 mb-4 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Type</span>
                <select
                  value={vitalForm.title}
                  onChange={(e) =>
                    setVitalForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="mt-1 px-3 py-2 border rounded-lg"
                >
                  <option>Heart Rate</option>
                  <option>BP</option>
                  <option>SpO2</option>
                  <option>Weight</option>
                  <option>ECG</option>
                  <option>Temperature</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Value</span>
                <input
                  value={vitalForm.value}
                  onChange={(e) =>
                    setVitalForm((f) => ({ ...f, value: e.target.value }))
                  }
                  placeholder="e.g. 78 BPM or 120/80"
                  className="mt-1 px-3 py-2 border rounded-lg"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-xs text-gray-600">Date</span>
                <input
                  type="date"
                  value={vitalForm.date}
                  onChange={(e) =>
                    setVitalForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="mt-1 px-3 py-2 border rounded-lg"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 mt-3">
              {!editingVitalId ? (
                <button
                  onClick={addVital}
                  className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition"
                >
                  Save Vital
                </button>
              ) : (
                <>
                  <button
                    onClick={saveEditVital}
                    className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingVitalId(null);
                      setIsAdding(false);
                      setVitalForm({
                        title: "Heart Rate",
                        value: "",
                        date: new Date().toISOString().slice(0, 10),
                      });
                    }}
                    className="px-3 py-2 rounded-lg bg-gray-200 text-sm hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Vitals list */}
        <div className="grid gap-3">
          {vitalsArray.length === 0 ? (
            <div className="text-sm text-gray-500">No vitals recorded yet.</div>
          ) : (
            vitalsArray.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-white/80"
              >
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-semibold text-gray-800">
                      {v.title}
                    </span>
                    <span className="text-sm text-gray-500">
                      • {format(new Date(v.date), "dd MMM yyyy")}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mt-1">{v.value}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Recorded by: {v.recordedBy ?? "unknown"}
                  </div>
                </div>

                {isDoctor && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditVital(v.id)}
                      title="Edit"
                      className="p-2 rounded-md hover:bg-gray-100"
                    >
                      <Edit2 className="h-4 w-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => deleteVital(v.id)}
                      title="Delete"
                      className="p-2 rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pass-through: keep your PatientDashboard intact */}
      <div>
        {/* If you want to prevent editing of PatientDashboard itself, that component is unchanged.
            We still render it so the overall UI is same as your previous flow. */}
        <PatientDashboard patientId={id as string} patientData={patient} />
      </div>
    </div>
  );
}
