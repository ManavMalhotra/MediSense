//@ts-nocheck
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { onValue, ref, remove, get, set } from "firebase/database";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

/**
 * DoctorDashboard (Action-Optimized Layout - Option B)
 * Fixed: duplicate React keys (weekday headers / day cells / report items).
 * - Use stable unique keys (include index or composite identifiers).
 *
 * Drop into your project replacing the previous file.
 */

/* -------------------------
   Types
   -------------------------*/
type PatientRaw = {
  id: string;
  name?: string;
  dob?: string;
  weight_kg?: number | string;
  height_cm?: number | string;
  previous_diseases?: string[];
  reports?: any[];
  [k: string]: any;
};

type AppointmentRaw = {
  id: string;
  date: string;
  time?: string;
  doctorId?: string;
  patientId?: string;
  patientName?: string;
  status?: string;
  mode?: string;
  [k: string]: any;
};

type MedicineItem = {
  id: string;
  name: string;
  dose?: string;
  schedule?: { frequency?: string; times?: string[]; days?: string[] };
  hasTaken?: Array<{ date?: string; time?: string; taken?: boolean }>;
};

/* -------------------------
   Helpers
   -------------------------*/
const formatDateFriendly = (isoDate: string | undefined) => {
  if (!isoDate) return "-";
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    const d = new Date(isoDate + "T00:00:00");
    return d.toLocaleDateString();
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(isoDate)) {
    const parts = isoDate.split("-");
    const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
    return d.toLocaleDateString();
  }
  return isoDate;
};

const calculateAgeFromDob = (dob?: string) => {
  if (!dob) return null;
  try {
    let date: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) date = new Date(dob + "T00:00:00");
    else if (/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
      const [dd, mm, yyyy] = dob.split("-");
      date = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
    } else date = new Date(dob);
    if (isNaN(date.getTime())) return null;
    const diff = Date.now() - date.getTime();
    const age = Math.floor(diff / (1000 * 3600 * 24 * 365.25));
    return age;
  } catch {
    return null;
  }
};

const todayISO = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10); // yyyy-mm-dd
};

/* -------------------------
   Subcomponents (internal)
   -------------------------*/

function TopStats({
  patientsCount,
  criticalCount,
  newReports,
  upcomingAppointments,
}: {
  patientsCount: number;
  criticalCount: number;
  newReports: number;
  upcomingAppointments: number;
}) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="text-sm text-gray-500">Total Patients</div>
        <div className="text-2xl font-semibold mt-2">{patientsCount}</div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="text-sm text-gray-500">Critical Alerts</div>
        <div className="text-2xl font-semibold mt-2 text-red-600">
          {criticalCount}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="text-sm text-gray-500">New Reports</div>
        <div className="text-2xl font-semibold mt-2">{newReports}</div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="text-sm text-gray-500">Upcoming Appointments</div>
        <Link href="/dashboard/appointments">
          <div className="underline text-2xl font-semibold mt-2 hover:text-blue-600 cursor-pointer">
            {upcomingAppointments}
          </div>
        </Link>
      </div>
    </div>
  );
}

function AlertsPanel({
  alerts,
}: {
  alerts: Array<{
    id: string;
    title: string;
    body?: string;
    priority?: "high" | "med" | "low";
  }>;
}) {
  if (!alerts.length)
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="text-gray-500">No critical alerts. All quiet.</div>
      </div>
    );

  return (
    <div className="space-y-3">
      {alerts.map((a) => (
        <div
          key={a.id}
          className={`p-4 rounded-lg border ${
            a.priority === "high"
              ? "border-red-200 bg-red-50"
              : "border-gray-100 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{a.title}</div>
              {a.body && (
                <div className="text-xs text-gray-600 mt-1">{a.body}</div>
              )}
            </div>
            {a.priority === "high" && (
              <div className="text-xs font-semibold text-red-600 px-2 py-1 rounded-full border border-red-200">
                HIGH
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AppointmentsWidget({
  appointments,
}: {
  appointments: AppointmentRaw[];
}) {
  const upcoming = appointments
    .filter((a) => {
      if (!a.date) return false;
      const today = todayISO();
      return a.date >= today;
    })
    .sort((x, y) => (x.date > y.date ? 1 : -1))
    .slice(0, 6);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="text-sm font-semibold mb-2">Upcoming Appointments</div>
      <div className="divide-y divide-gray-100">
        {upcoming.length === 0 && (
          <div className="text-gray-500 text-sm">No upcoming appointments.</div>
        )}
        {upcoming.map((ap) => (
          <div key={ap.id} className="py-3 flex items-start justify-between">
            <div>
              <div className="text-sm font-medium">
                {ap.time ? `${ap.time} • ` : ""}
                {ap.patientName || ap.patientId || "Unknown"}
              </div>
              <div className="text-xs text-gray-500">
                {formatDateFriendly(ap.date)}
              </div>
            </div>
            <div className="text-xs text-gray-400">{ap.mode || ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------
   RFID Modal component
   -------------------------*/
function RFIDModal({
  open,
  onClose,
  onFound,
  rfidStatus,
  setRfLastUidToEmpty,
}: {
  open: boolean;
  onClose: () => void;
  onFound: (patientId: string) => void;
  rfidStatus: string;
  setRfLastUidToEmpty: () => void;
}) {
  const [manualId, setManualId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setManualId("");
  }, [open]);

  const tryManual = async () => {
    const v = manualId.trim();
    if (!v) return;
    setLoading(true);
    try {
      const snap = await get(ref(db, `patients/${v}`));
      if (snap.exists()) {
        onFound(v);
        return;
      }
      const usersSnap = await get(ref(db, `users`));
      if (usersSnap.exists()) {
        const users: Record<string, any> = usersSnap.val();
        const foundUser = Object.values(users).find(
          (u: any) => u.uid === v || u.email === v
        );
        if (foundUser?.patientDataId) {
          onFound(foundUser.patientDataId);
          return;
        }
      }
      Swal.fire({
        icon: "error",
        title: "Not found",
        text: "No patient for this ID.",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to search ID.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl p-6 w-full max-w-xl relative">
        <button
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          onClick={() => {
            setRfLastUidToEmpty();
            onClose();
          }}
        >
          ✕
        </button>
        <h3 className="text-xl font-semibold mb-2">Scan Patient RFID</h3>
        <p className="text-sm text-gray-600 mb-4">
          Present the patient's RFID card to the scanner. When a match is found
          you'll be redirected to their profile automatically. Manual entry
          allowed as fallback.
        </p>

        <div className="mb-3 text-sm">
          RFID Status:{" "}
          <span
            className={rfidStatus === "on" ? "text-green-600" : "text-red-600"}
          >
            {rfidStatus?.toUpperCase() || "OFF"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <input
            placeholder="Manual fallback: enter patient ID or user UID/email"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setRfLastUidToEmpty();
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={tryManual}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              {loading ? "Searching..." : "Find"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------
   Patient Table
   -------------------------*/
function PatientTable({
  patients,
  onRemove,
  medicinesMap,
  onOpenPatient,
}: {
  patients: PatientRaw[];
  onRemove: (id: string) => void;
  medicinesMap: Record<string, MedicineItem[]>;
  onOpenPatient: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const items = patients
    .filter((p) => {
      if (!q) return true;
      const ql = q.toLowerCase();
      return (
        (p.name || "").toLowerCase().includes(ql) ||
        (p.id || "").toLowerCase().includes(ql) ||
        (p.previous_diseases || []).join(" ").toLowerCase().includes(ql)
      );
    })
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  const computeAdherence = (pid: string) => {
    const meds = medicinesMap[pid];
    if (!meds || meds.length === 0) return null;
    const last7 = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      last7.push(d.toISOString().slice(0, 10));
    }
    let total = 0;
    let taken = 0;
    meds.forEach((m) => {
      (m.hasTaken || []).forEach((entry) => {
        if (!entry.date) return;
        const ed = /^\d{4}-\d{2}-\d{2}$/.test(entry.date)
          ? entry.date
          : /^\d{2}-\d{2}-\d{4}$/.test(entry.date)
          ? (() => {
              const [dd, mm, yyyy] = entry.date.split("-");
              return `${yyyy}-${mm}-${dd}`;
            })()
          : entry.date;
        if (last7.includes(ed)) {
          total++;
          if (entry.taken) taken++;
        }
      });
    });
    if (total === 0) return null;
    return Math.round((taken / total) * 100);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Patient List</h3>
        <input
          placeholder="Search name, id, conditions..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-gray-500">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Age</th>
              <th className="py-2 pr-4">Chronic</th>
              <th className="py-2 pr-4">Adherence (7d)</th>
              <th className="py-2 pr-4">Last Report</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((p) => {
              const age = calculateAgeFromDob(p.dob);
              const chronic =
                p.previous_diseases && p.previous_diseases.length > 0
                  ? p.previous_diseases.join(", ")
                  : "-";
              const adherence = computeAdherence(p.id);
              const lastReport =
                (p.reports &&
                  p.reports.length > 0 &&
                  p.reports[p.reports.length - 1]?.date) ||
                null;
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => onOpenPatient(p.id)}
                      className="text-left text-sm text-gray-900 font-medium hover:underline"
                    >
                      {p.name || "Unknown"}
                    </button>
                    <div className="text-xs text-gray-500">{p.id}</div>
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-700">
                    {age ?? "-"}
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-700 max-w-xs truncate">
                    {chronic}
                  </td>
                  <td className="py-3 pr-4 text-sm">
                    {adherence === null ? (
                      <span className="text-gray-400">—</span>
                    ) : adherence >= 80 ? (
                      <span className="text-green-600 font-medium">
                        {adherence}%
                      </span>
                    ) : adherence >= 50 ? (
                      <span className="text-orange-600 font-medium">
                        {adherence}%
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">
                        {adherence}%
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-700">
                    {formatDateFriendly(lastReport)}
                  </td>
                  <td className="py-3 pr-4 text-sm flex gap-2">
                    <button
                      onClick={() => onOpenPatient(p.id)}
                      className="px-2 py-1 rounded-md bg-blue-600 text-white text-sm cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm("Remove this patient?")) return;
                        onRemove(p.id);
                      }}
                      className="px-2 py-1 rounded-md cursor-pointer bg-red-50 text-red-600 text-sm border border-red-100"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="text-gray-500 mt-4">
            No patients match your search.
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------
   Main Dashboard Component
   -------------------------*/
export default function DoctorDashboardRoot() {
  const router = useRouter();

  // data states
  const [patientsMap, setPatientsMap] = useState<Record<string, any>>({});
  const [appointmentsMap, setAppointmentsMap] = useState<
    Record<string, AppointmentRaw>
  >({});
  const [medicinesMap, setMedicinesMap] = useState<
    Record<string, MedicineItem[]>
  >({});
  const [remindersMap, setRemindersMap] = useState<Record<string, any>>({});
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [rfidStatus, setRfidStatus] = useState<string>("off");

  // UI states
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [listeningModal, setListeningModal] = useState(false);

  // fetch patients (live)
  useEffect(() => {
    const node = ref(db, "patients");
    const off = onValue(node, (snap) => {
      const val = snap.val() || {};
      setPatientsMap(val);
    });
    return () => off();
  }, []);

  // appointments
  useEffect(() => {
    const node = ref(db, "appointments");
    const off = onValue(node, (snap) => {
      const val = snap.val() || {};
      setAppointmentsMap(val);
    });
    return () => off();
  }, []);

  // medicines
  useEffect(() => {
    const node = ref(db, "medicines");
    const off = onValue(node, (snap) => {
      const val = snap.val() || {};
      setMedicinesMap(val);
    });
    return () => off();
  }, []);

  // reminders
  useEffect(() => {
    const node = ref(db, "reminders");
    const off = onValue(node, (snap) => {
      setRemindersMap(snap.val() || {});
    });
    return () => off();
  }, []);

  // users
  useEffect(() => {
    const node = ref(db, "users");
    const off = onValue(node, (snap) => {
      setUsersMap(snap.val() || {});
    });
    return () => off();
  }, []);

  // rfid status
  useEffect(() => {
    const node = ref(db, "rfid/status");
    const off = onValue(node, (snap) => {
      const v = snap.val();
      if (v) setRfidStatus(String(v));
      else setRfidStatus("off");
    });
    return () => off();
  }, []);

  // Derived arrays
  const patientsArr: PatientRaw[] = useMemo(
    () =>
      Object.keys(patientsMap).map((k) => {
        const p = { ...patientsMap[k], id: k };
        if (!p.previous_diseases && p.previous_disease)
          p.previous_diseases = p.previous_disease;
        return p;
      }),
    [patientsMap]
  );

  const appointmentsArr: AppointmentRaw[] = useMemo(
    () =>
      Object.keys(appointmentsMap).map((k) => ({
        ...(appointmentsMap[k] || {}),
        id: k,
      })),
    [appointmentsMap]
  );

  // compute top stats
  const totalPatients = patientsArr.length;
  const upcomingAppointmentsCount = appointmentsArr.filter(
    (a) => a.date && a.date >= todayISO()
  ).length;

  // compute new reports count (reports in last 7 days)
  const newReportsCount = patientsArr.reduce((acc, p) => {
    const reports = p.reports || [];
    if (!Array.isArray(reports)) return acc;
    const last7 = new Date();
    last7.setDate(last7.getDate() - 7);
    for (const r of reports) {
      if (!r.date) continue;
      let rd: Date | null = null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(r.date))
        rd = new Date(r.date + "T00:00:00");
      else if (/^\d{2}-\d{2}-\d{4}$/.test(r.date)) {
        const [dd, mm, yyyy] = r.date.split("-");
        rd = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
      } else rd = new Date(r.date);
      if (rd && !isNaN(rd.getTime()) && rd >= last7) {
        acc++;
        break;
      }
    }
    return acc;
  }, 0);

  /* -------------------------
     Critical alerts generation
     -------------------------*/
  const alerts = useMemo(() => {
    const out: Array<{
      id: string;
      title: string;
      body?: string;
      priority?: "high" | "med" | "low";
    }> = [];
    const today = todayISO();

    Object.entries(medicinesMap).forEach(([pid, meds]) => {
      if (!Array.isArray(meds)) return;
      meds.forEach((m: MedicineItem) => {
        const schedTimes = m?.schedule?.times || [];
        if (!schedTimes.length) return;
        const takenTimes = (m.hasTaken || [])
          .filter((h) => {
            if (!h.date) return false;
            const dd = /^\d{4}-\d{2}-\d{2}$/.test(h.date)
              ? h.date
              : /^\d{2}-\d{2}-\d{4}$/.test(h.date)
              ? (() => {
                  const [d, mth, y] = h.date.split("-");
                  return `${y}-${mth}-${d}`;
                })()
              : h.date;
            return dd === today && h.taken;
          })
          .map((h) => h.time);

        schedTimes.forEach((st: string) => {
          if (!st) return;
          try {
            const sParts = st.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
            let scheduled = new Date();
            if (sParts) {
              let hour = parseInt(sParts[1], 10);
              const min = parseInt(sParts[2], 10);
              const ampm = sParts[3];
              if (ampm) {
                if (/pm/i.test(ampm) && hour !== 12) hour += 12;
                if (/am/i.test(ampm) && hour === 12) hour = 0;
              }
              scheduled.setHours(hour, min, 0, 0);
            }
            const diffMin = (Date.now() - scheduled.getTime()) / (1000 * 60);
            if (diffMin > 20 && !takenTimes.includes(st)) {
              out.push({
                id: `${pid}-${m.id}-missed-${st}`,
                title: `Missed dose: ${m.name} (${st})`,
                body: `Patient ${pid} may have missed scheduled dose at ${st}.`,
                priority: "high",
              });
            }
          } catch {
            // ignore
          }
        });
      });
    });

    Object.entries(medicinesMap).forEach(([pid, meds]) => {
      let total = 0;
      let taken = 0;
      const now = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const iso = d.toISOString().slice(0, 10);
        (meds || []).forEach((m: MedicineItem) =>
          (m.hasTaken || []).forEach((ht) => {
            if (!ht.date) return;
            const dnorm = /^\d{4}-\d{2}-\d{2}$/.test(ht.date)
              ? ht.date
              : /^\d{2}-\d{2}-\d{4}$/.test(ht.date)
              ? (() => {
                  const [dd, mm, yy] = ht.date.split("-");
                  return `${yy}-${mm}-${dd}`;
                })()
              : ht.date;
            if (dnorm === iso) {
              total++;
              if (ht.taken) taken++;
            }
          })
        );
      }
      if (total > 0) {
        const pct = Math.round((taken / total) * 100);
        if (pct < 50) {
          out.push({
            id: `${pid}-low-adherence`,
            title: `Low adherence: ${pct}%`,
            body: `Patient ${pid} shows ${pct}% adherence last 7 days.`,
            priority: "med",
          });
        }
      }
    });

    for (const [k, a] of Object.entries(appointmentsMap)) {
      try {
        if (!a.date) continue;
        const dateStr = a.date;
        const timeStr = a.time || "09:00 AM";
        let dateTime: Date;
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          const tparts = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
          let hour = 9,
            min = 0;
          if (tparts) {
            hour = parseInt(tparts[1], 10);
            min = parseInt(tparts[2], 10);
            const ampm = tparts[3];
            if (ampm) {
              if (/pm/i.test(ampm) && hour !== 12) hour += 12;
              if (/am/i.test(ampm) && hour === 12) hour = 0;
            }
          }
          dateTime = new Date(`${dateStr}T00:00:00`);
          dateTime.setHours(hour, min, 0, 0);
        } else {
          dateTime = new Date(`${a.date} ${a.time || ""}`);
        }
        const diffMin = (dateTime.getTime() - Date.now()) / (1000 * 60);
        if (diffMin >= 0 && diffMin <= 60) {
          out.push({
            id: `appt-${k}`,
            title: `Appointment soon: ${
              a.patientName || a.patientId || "Patient"
            }`,
            body: `Scheduled at ${a.time || "N/A"} (${formatDateFriendly(
              a.date
            )})`,
            priority: "med",
          });
        }
      } catch {
        continue;
      }
    }

    out.sort((x, y) => {
      const rank = { high: 0, med: 1, low: 2 };
      return (
        (rank[x.priority || "low"] ?? 2) - (rank[y.priority || "low"] ?? 2)
      );
    });
    return out;
  }, [medicinesMap, appointmentsMap]);

  /* -------------------------
     RFID listener for modal ONLY
     -------------------------*/
  useEffect(() => {
    if (!showScannerModal) return;
    setListeningModal(true);
    // 🔥 Clear before listening so old UID can't trigger
    set(ref(db, "rfid/last_uid"), "");
    const uidRef = ref(db, "rfid/last_uid");
    const off = onValue(uidRef, async (snap) => {
      const uidVal = snap.val();
      if (!uidVal) return;
      try {
        const patientSnap = await get(ref(db, `patients/${uidVal}`));
        if (patientSnap.exists()) {
          const pid = uidVal;
          Swal.fire({
            title: "Patient scanned",
            text: "Opening profile...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
          });
          setTimeout(() => {
            Swal.close();
            setListeningModal(false);
            setShowScannerModal(false);
            router.push(`/patient/${pid}`);
          }, 600);
          return;
        }

        const usersSnap = await get(ref(db, "users"));
        if (usersSnap.exists()) {
          const users = usersSnap.val();
          const foundUserKey = Object.keys(users).find((k) => {
            const u = users[k];
            if (!u) return false;
            if (u.uid && String(u.uid) === String(uidVal)) return true;
            if (u.rfid && String(u.rfid) === String(uidVal)) return true;
            return false;
          });
          if (foundUserKey) {
            const patientDataId = users[foundUserKey].patientDataId;
            if (patientDataId) {
              Swal.fire({
                title: "Patient scanned",
                text: "Opening profile...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
              });
              setTimeout(() => {
                Swal.close();
                setListeningModal(false);
                setShowScannerModal(false);
                router.push(`/patient/${patientDataId}`);
              }, 600);
              return;
            }
          }
        }

        Swal.fire({
          icon: "error",
          title: "Patient not found",
          text: "Scanned RFID doesn't match any patient.",
        });
      } catch (err) {
        console.error("RFID scan error:", err);
      }
    });

    return () => {
      setListeningModal(false);
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showScannerModal]);

  /* -------------------------
     Actions
     -------------------------*/
  const handleRemovePatient = async (id: string) => {
    if (!confirm("Remove this patient?")) return;
    try {
      await remove(ref(db, `patients/${id}`));
      Swal.fire({
        icon: "success",
        title: "Removed",
        text: "Patient removed.",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Removing patient failed.",
      });
    }
  };

  const openPatient = (id: string) => {
    router.push(`/patient/${id}`);
  };

  // const setRfLastUidToEmpty = () => {
  //   try {
  //     // intentionally left empty to avoid permission issues.
  //     // If you want to actually write to DB, import and call set(ref(db,'rfid/last_uid'), '')
  //   } catch {}
  // };
  const setRfLastUidToEmpty = async () => {
    try {
      await set(ref(db, "rfid/last_uid"), "");
    } catch (err) {
      console.error("Failed clearing UID:", err);
    }
  };

  /* -------------------------
     Render layout - Option B (action-optimized)
     -------------------------*/
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <div className="text-sm text-gray-500 mt-1">
            Overview and quick actions
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              await setRfLastUidToEmpty(); // cleared safely
              setShowScannerModal(true);
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            + Scan Patient
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <TopStats
        patientsCount={totalPatients}
        criticalCount={alerts.length}
        newReports={newReportsCount}
        upcomingAppointments={upcomingAppointmentsCount}
      />

      {/* Main split */}
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT: Alerts, Adherence, Reports */}
        <div className="col-span-8 space-y-4">
          {/* Alerts */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Critical Alerts</h2>
            <AlertsPanel
              alerts={alerts.slice(0, 6).map((a) => ({
                id: a.id,
                title: a.title,
                body: a.body,
                priority: a.priority,
              }))}
            />
          </div>

          {/* Adherence mini */}
          <div>
            <h2 className="text-lg font-semibold mb-2">
              Adherence Overview (last 7 days)
            </h2>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Patients on meds</div>
                  <div className="text-2xl font-semibold mt-1">
                    {Object.keys(medicinesMap).length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">
                    Low adherence (&lt;50%)
                  </div>
                  <div className="text-2xl font-semibold mt-1">
                    {
                      alerts.filter((a) => a.id.includes("-low-adherence"))
                        .length
                    }
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">
                    Missed doses (today)
                  </div>
                  <div className="text-2xl font-semibold mt-1">
                    {alerts.filter((a) => a.id.includes("-missed-")).length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Recent Reports</h2>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="divide-y divide-gray-100">
                {patientsArr
                  .flatMap((p) =>
                    (p.reports || []).map((r: any) => ({
                      ...r,
                      patientId: p.id,
                      patientName: p.name,
                    }))
                  )
                  .sort((a, b) => (a.date > b.date ? -1 : 1))
                  .slice(0, 6)
                  .map((r: any, i) => (
                    <div
                      key={`${r.patientId || "unknown"}-${
                        r.date || "nodate"
                      }-${i}`}
                      className="py-3 flex items-start justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {r.title || "Report"} • {r.patientName || r.patientId}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateFriendly(r.date)}
                        </div>
                        {r.summary && (
                          <div className="text-xs text-gray-600 mt-1">
                            {r.summary}
                          </div>
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            if (r.filePath) {
                              window.open(`/storage/${r.filePath}`, "_blank");
                            } else {
                              Swal.fire({
                                text: "No file URL available",
                                icon: "info",
                              });
                            }
                          }}
                          className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                {patientsArr.flatMap((p) => p.reports || []).length === 0 && (
                  <div className="text-gray-500 text-sm">
                    No reports available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Calendar, RFID, Appointments */}
        <div className="col-span-4 space-y-4">
          {/* Calendar (compact) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Calendar</h3>
              <div className="text-xs text-gray-500">
                {new Date().toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500 mb-2">This month</div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  // key uses index to ensure uniqueness even when letters repeat
                  <div
                    key={`weekday-${i}-${d}`}
                    className="text-center text-gray-500"
                  >
                    {d}
                  </div>
                ))}
                {Array.from({ length: 28 }).map((_, i) => (
                  // unique key per day cell
                  <div
                    key={`day-${i + 1}`}
                    className="text-center py-2 rounded"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RFID */}
          <div>
            <h3 className="text-lg font-semibold mb-2">RFID Scanner</h3>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500 mb-3">
                Status:{" "}
                <span
                  className={
                    rfidStatus === "on" ? "text-green-600" : "text-red-600"
                  }
                >
                  {rfidStatus?.toUpperCase() || "OFF"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowScannerModal(true)}
                  className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Open Scanner
                </button>
                <button
                  onClick={() => {
                    Swal.fire({
                      title: "Last UID",
                      text: "Showing last scanned UID (from rfid/last_uid)",
                      didOpen: async () => {
                        try {
                          const snap = await get(ref(db, "rfid/last_uid"));
                          const uid = snap.exists() ? snap.val() : "(none)";
                          Swal.fire({ title: "Last UID", text: String(uid) });
                        } catch {
                          Swal.fire({
                            icon: "error",
                            title: "Failed",
                            text: "Could not read last uid.",
                          });
                        }
                      },
                    });
                  }}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  Show UID
                </button>
              </div>
            </div>
          </div>

          {/* Appointments widget */}
          <div>
            <AppointmentsWidget
              appointments={appointmentsArr.slice(0, 50).map((a) => ({
                ...a,
                patientName:
                  patientsMap[a.patientId]?.name || a.patientName || "Unknown",
              }))}
            />
          </div>
        </div>
      </div>

      {/* Bottom: full patient table */}
      <PatientTable
        patients={patientsArr}
        onRemove={handleRemovePatient}
        medicinesMap={medicinesMap}
        onOpenPatient={openPatient}
      />

      {/* RFID Modal */}
      <RFIDModal
        open={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onFound={(pid) => {
          setShowScannerModal(false);
          router.push(`/patient/${pid}`);
        }}
        rfidStatus={rfidStatus}
        setRfLastUidToEmpty={() => {
          setRfLastUidToEmpty();
        }}
      />
    </div>
  );
}
