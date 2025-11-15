"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  ref,
  onValue,
  push,
  set as firebaseSet,
  update as firebaseUpdate,
  remove as firebaseRemove,
  get,
} from "firebase/database";
import { db } from "@/lib/firebase";
import {
  Plus,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Edit2,
} from "lucide-react";
import { motion } from "framer-motion";

/*
  Reminders + Prescriptions Page
  - Realtime DB paths used:
    /patients/{patientId}/reminders
    /patients/{patientId}/prescriptions

  Recommended DB schemas:

  patients
    {patientId}
      name: "Manav Malhotra"
      ...
      reminders:
        {reminderId}:
          title: "Morning Medicine"
          time: "09:00"          // 24h HH:mm (local)
          enabled: true
          createdAt: 1699999999999
          repeat: "daily"        // optional: "daily", "weekdays", "once", or {days: [1,3,5]} Sun=0
          medicationId: "<prescriptionId>" // optional link to prescription
      prescriptions:
        {prescriptionId}:
          name: "Atorvastatin"
          dose: "10 mg"
          schedule: {
            times: ["09:00","21:00"], // daily times
            repeat: "daily" // or custom
          }
          startDate: "2025-11-10"
          endDate: "2025-12-10" // optional
          enabled: true
          createdAt: 1699999999999

  NOTE: For real phone push (while app closed) you'll need Firebase Cloud Messaging (FCM) + a server or Cloud Functions to send push notifications when a reminder is due.
*/

type Reminder = {
  id?: string;
  title: string;
  time: string; // "HH:mm" local
  enabled: boolean;
  createdAt?: number;
  repeat?: "daily" | "weekdays" | "once"; // simple repeat
  medicationId?: string | null;
};

type Prescription = {
  id?: string;
  name: string;
  dose: string;
  schedule: { times: string[]; repeat?: "daily" | "weekdays" | "once" };
  startDate?: string; // yyyy-mm-dd
  endDate?: string | null;
  enabled?: boolean;
  createdAt?: number;
};

export default function RemindersPage({
  patientIdProp,
}: {
  patientIdProp?: string;
}) {
  // Prefer passed patientId prop, else localStorage fallback
  const patientId =
    patientIdProp ||
    (typeof window !== "undefined"
      ? localStorage.getItem("patientId") || ""
      : "");

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI states
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("09:00");
  const [newRepeat, setNewRepeat] = useState<Reminder["repeat"]>("daily");

  // in-app toast
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Scheduler interval ref
  const pollRef = useRef<number | null>(null);

  // subscribe to realtime db
  useEffect(() => {
    if (!patientId) {
      setError("No patient selected (no patientId).");
      setLoading(false);
      return;
    }

    setLoading(true);
    const remindersRef = ref(db, `patients/${patientId}/reminders`);
    const prescriptionsRef = ref(db, `patients/${patientId}/prescriptions`);

    const unsubRem = onValue(
      remindersRef,
      (snap) => {
        const data = snap.exists() ? snap.val() : {};
        const arr: Reminder[] = Object.keys(data).map((k) => ({
          id: k,
          ...(data[k] as any),
        }));
        // sort by time for display
        arr.sort((a, b) => a.time.localeCompare(b.time));
        setReminders(arr);
        setLoading(false);
      },
      (err) => {
        console.error("reminders read error", err);
        setError("Failed to read reminders.");
        setLoading(false);
      }
    );

    const unsubPres = onValue(
      prescriptionsRef,
      (snap) => {
        const data = snap.exists() ? snap.val() : {};
        const arr: Prescription[] = Object.keys(data).map((k) => ({
          id: k,
          ...(data[k] as any),
        }));
        setPrescriptions(arr);
      },
      (err) => {
        console.error("prescriptions read error", err);
      }
    );

    return () => {
      unsubRem();
      unsubPres();
    };
  }, [patientId]);

  // Request Notification permission on first load if not granted
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      // ask once
      Notification.requestPermission().then((p) => {
        if (p === "granted") showInAppToast("Notifications enabled");
      });
    }
  }, []);

  // Scheduler: check every 20s for due reminders
  useEffect(() => {
    // immediate check + interval
    const checkNow = () => {
      const now = new Date();
      reminders.forEach((r) => {
        if (!r.enabled) return;
        if (!shouldTriggerReminder(r, now)) return;
        // prevent double-trigger: we'll mark lastTriggered locally on rem object (not persisted)
        // but better approach: store lastTriggered timestamp in DB (if you want durable suppression)
        // Here, do a transient check: attach a _lastTriggered local mark
        const key = `_lastTriggered_${r.id}`;
        const last = (window as any)[key] as number | undefined;
        const diffMinutes = last ? (Date.now() - last) / 1000 / 60 : Infinity;
        if (!last || diffMinutes > 0.9) {
          // trigger
          triggerReminderNotification(r);
          (window as any)[key] = Date.now();
        }
      });

      // prescriptions: expand to reminders if needed (prescriptions with schedule.times)
      prescriptions.forEach((p) => {
        if (!p.enabled) return;
        (p.schedule.times || []).forEach((t) => {
          const mockRem: Reminder = {
            id: `pres_${p.id}_${t}`,
            title: `${p.name} • ${p.dose}`,
            time: t,
            enabled: true,
            createdAt: p.createdAt,
            repeat: p.schedule.repeat || "daily",
            medicationId: p.id,
          };
          if (shouldTriggerReminder(mockRem, new Date())) {
            const key = `_lastTriggered_${mockRem.id}`;
            const last = (window as any)[key] as number | undefined;
            const diffMinutes = last
              ? (Date.now() - last) / 1000 / 60
              : Infinity;
            if (!last || diffMinutes > 0.9) {
              triggerReminderNotification(mockRem);
              (window as any)[key] = Date.now();
            }
          }
        });
      });
    };

    checkNow();
    // poll every 20 seconds
    pollRef.current = window.setInterval(checkNow, 20_000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [reminders, prescriptions]);

  // show toast helper
  function showInAppToast(message: string) {
    setToast(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(
      () => setToast(null),
      5400
    ) as unknown as number;
  }

  // create or update reminder in db
  async function saveReminderToDB(rem: Partial<Reminder> & { id?: string }) {
    if (!patientId) {
      setError("No patient selected.");
      return;
    }
    const now = Date.now();
    if (rem.id) {
      const rRef = ref(db, `patients/${patientId}/reminders/${rem.id}`);
      await firebaseUpdate(rRef, {
        title: rem.title,
        time: rem.time,
        enabled: !!rem.enabled,
        repeat: rem.repeat || "daily",
      });
    } else {
      const listRef = ref(db, `patients/${patientId}/reminders`);
      const newRef = push(listRef);
      await firebaseSet(newRef, {
        title: rem.title,
        time: rem.time,
        enabled: rem.enabled ?? true,
        repeat: rem.repeat || "daily",
        createdAt: now,
      });
    }
  }

  async function deleteReminderFromDB(id?: string) {
    if (!patientId || !id) return;
    const rRef = ref(db, `patients/${patientId}/reminders/${id}`);
    await firebaseRemove(rRef);
  }

  // UI actions
  function toggleReminderLocal(id?: string) {
    if (!id) return;
    // optimistic UI update + persist
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
    const r = reminders.find((x) => x.id === id);
    saveReminderToDB({
      id,
      enabled: !r?.enabled,
      title: r?.title,
      time: r?.time,
      repeat: r?.repeat,
    });
  }

  function openNewModal() {
    setEditing(null);
    setNewTitle("");
    setNewTime("09:00");
    setNewRepeat("daily");
    setShowModal(true);
  }

  function openEditModal(r: Reminder) {
    setEditing(r);
    setNewTitle(r.title);
    setNewTime(r.time);
    setNewRepeat(r.repeat || "daily");
    setShowModal(true);
  }

  async function submitModal() {
    if (!newTitle || !newTime) return;
    const payload: Partial<Reminder> = {
      title: newTitle,
      time: newTime,
      enabled: true,
      repeat: newRepeat,
    };
    if (editing?.id) {
      await saveReminderToDB({ ...payload, id: editing.id });
    } else {
      await saveReminderToDB(payload);
    }
    setShowModal(false);
  }

  // Notification trigger
  function triggerReminderNotification(r: Reminder) {
    const text = `${r.title} · ${r.time}`;
    // Browser Notification
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const n = new Notification(r.title, {
          body: `It's time — ${r.time}`,
          tag: r.id ?? `rem-${Math.random()}`,
          renotify: false,
        });
        // click behaviour
        n.onclick = () => {
          window.focus();
          // optionally navigate to patient or open app
        };
      } catch (e) {
        console.warn("notification failed", e);
      }
    } else {
      // fallback: in-app toast
      showInAppToast(text);
      // try to vibrate (mobile)
      if (navigator.vibrate) navigator.vibrate(200);
    }

    // Optionally, record a 'lastNotified' timestamp in DB to avoid duplicate triggers across clients.
    // E.g. set patients/{patientId}/reminders/{id}/lastNotified = Date.now()
    // (omitted here to avoid write churn — add if you want central suppression)
  }

  /* --------------------- RENDER --------------------- */

  // Derived: upcoming vs missed (simple)
  const upcoming = reminders.filter((r) => r.enabled);
  const missed = reminders.filter((r) => !r.enabled);

  const addTimeSlot = () => setTimes((s) => [...s, "09:00"]);
  const removeTimeSlot = (idx: number) =>
    setTimes((s) => s.filter((_, i) => i !== idx));
  const updateTimeSlot = (idx: number, val: string) =>
    setTimes((s) => s.map((t, i) => (i === idx ? val : t)));

  const toggleWeekday = (day: string) => {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ y: -14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          className="fixed left-1/2 -translate-x-1/2 top-6 z-50 bg-white rounded-xl shadow-lg px-4 py-2"
        >
          <div className="text-sm">{toast}</div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Bell className="text-purple-600" />
          Reminders & Medicines
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            title="Add Reminder"
          >
            <Plus size={16} /> Add Reminder
          </button>
          <button
            className="px-3 py-2 rounded-md border"
            onClick={() => {
              // test notification
              if ("Notification" in window) {
                if (Notification.permission !== "granted") {
                  Notification.requestPermission().then((p) => {
                    if (p === "granted") {
                      showInAppToast("Notifications enabled");
                    } else {
                      showInAppToast("Notifications blocked");
                    }
                  });
                } else {
                  const fake: Reminder = {
                    id: "test",
                    title: "Test reminder",
                    time: new Date().toLocaleTimeString(),
                    enabled: true,
                  };
                  triggerReminderNotification(fake);
                }
              } else {
                alert("This browser does not support notifications.");
              }
            }}
            title="Test notification"
          >
            Test
          </button>
        </div>
      </div>

      {/* Loading / error */}
      {loading && (
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-1/3 bg-slate-200 rounded-md"></div>
          <div className="h-40 bg-slate-200 rounded-lg"></div>
        </div>
      )}
      {error && <div className="text-red-600 mb-3">{error}</div>}

      {/* Content */}
      <div className="space-y-8">
        {/* Upcoming */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.length === 0 && (
              <EmptyState text="No active reminders. Add one!" />
            )}
            {upcoming.map((r) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                onToggle={() => toggleReminderLocal(r.id)}
                onEdit={() => openEditModal(r)}
                onDelete={() => deleteReminderFromDB(r.id)}
              />
            ))}
          </div>
        </div>

        {/* Missed / Disabled */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Disabled / Other
          </h2>
          <div className="space-y-3">
            {missed.length === 0 && (
              <div className="text-sm text-gray-500">No disabled reminders</div>
            )}
            {missed.map((r) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                onToggle={() => toggleReminderLocal(r.id)}
                onEdit={() => openEditModal(r)}
                onDelete={() => deleteReminderFromDB(r.id)}
              />
            ))}
          </div>
        </section>

        {/* Prescriptions (Cherry on top) */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Prescriptions
          </h2>
          <div className="space-y-3">
            {prescriptions.length === 0 && (
              <EmptyState text="No prescriptions found." />
            )}
            {prescriptions.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-white rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-gray-500">
                    {p.dose} • {p.schedule.times?.join(", ")}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  {p.enabled ? "Active" : "Stopped"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">
              {editing ? "Edit reminder" : "Add reminder"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Medicine name</label>
                <input
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  className="w-full border rounded-md p-2 mt-1"
                  placeholder="e.g. Morning Medicine"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700">
                  Dosage (optional)
                </label>
                <input
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full border rounded-md p-2 mt-1"
                  placeholder="e.g. 500 mg"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700">Repeat</label>
                <select
                  value={newRepeat}
                  onChange={(e) =>
                    setNewRepeat(e.target.value as Reminder["repeat"])
                  }
                  className="w-full border rounded-md p-2 mt-1"
                >
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="once">Once</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={submitModal}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Save
                </button>
              </div>

              {/* Presets & times */}
              <div className="md:col-span-2">
                <label className="text-sm text-gray-700">
                  Dose frequency / Times
                </label>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    className={`px-3 py-1 rounded-md border ${
                      preset === "once" ? "bg-purple-600 text-white" : ""
                    }`}
                    onClick={() => applyPreset("once")}
                  >
                    Once
                  </button>
                  <button
                    className={`px-3 py-1 rounded-md border ${
                      preset === "twice" ? "bg-purple-600 text-white" : ""
                    }`}
                    onClick={() => applyPreset("twice")}
                  >
                    Twice
                  </button>
                  <button
                    className={`px-3 py-1 rounded-md border ${
                      preset === "thrice" ? "bg-purple-600 text-white" : ""
                    }`}
                    onClick={() => applyPreset("thrice")}
                  >
                    Thrice
                  </button>
                  <button
                    className={`px-3 py-1 rounded-md border ${
                      preset === "custom" ? "bg-purple-600 text-white" : ""
                    }`}
                    onClick={() => applyPreset("custom")}
                  >
                    Custom
                  </button>

                  <div className="ml-auto text-sm text-gray-500">
                    Times per day: {times.length}
                  </div>
                </div>

                {/* times list */}
                <div className="mt-3 space-y-2">
                  {times.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={t}
                        onChange={(e) => updateTimeSlot(idx, e.target.value)}
                        className="border rounded-md p-2"
                      />
                      <button
                        className="px-3 py-1 bg-gray-200 rounded-md"
                        onClick={() => removeTimeSlot(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <div className="mt-2">
                    <button
                      onClick={addTimeSlot}
                      className="px-3 py-1 bg-gray-100 rounded-md"
                    >
                      + Add time
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={saveReminder}
                className="px-4 py-2 bg-purple-600 text-white rounded-md"
              >
                {editing ? "Save changes" : "Add reminder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- Helper components -------------------- */

function ReminderCard({
  reminder,
  onToggle,
  onEdit,
  onDelete,
}: {
  reminder: Reminder;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-4 bg-white rounded-lg shadow flex justify-between items-center">
      <div>
        <h3 className="font-semibold flex items-center gap-2">
          {reminder.enabled ? (
            <Clock className="text-purple-600" size={18} />
          ) : (
            <XCircle className="text-red-500" size={18} />
          )}
          {reminder.title}
        </h3>
        <p className="text-gray-500 text-sm">
          {formatTimeToReadable(reminder.time)} • {reminder.repeat || "daily"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={reminder.enabled}
            onChange={onToggle}
            className="sr-only"
          />
          <div
            className={`w-11 h-6 rounded-full transition ${
              reminder.enabled ? "bg-purple-600" : "bg-gray-300"
            }`}
          />
        </label>

        <button
          onClick={onEdit}
          className="p-2 rounded-md hover:bg-slate-100"
          title="Edit"
        >
          <Edit2 size={16} />
        </button>

        <button
          onClick={onDelete}
          className="p-2 rounded-md hover:bg-red-50 text-red-600"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="p-4 bg-slate-50 rounded-lg text-sm text-gray-500">
      {text}
    </div>
  );
}

/* -------------------- Utilities -------------------- */

function formatTimeToReadable(hhmm: string) {
  // hh:mm -> localized AM/PM
  if (!hhmm) return "—";
  const [hh, mm] = hhmm.split(":").map((x) => Number(x));
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function shouldTriggerReminder(r: Reminder, now: Date) {
  if (!r.enabled) return false;
  // match time within a 40-second window to avoid misses due to interval frequency.
  const [h, m] = r.time.split(":").map((x) => Number(x));
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const target = new Date(now);
  target.setHours(h, m, 0, 0);

  // Repeat handling (simple)
  if (r.repeat === "weekdays") {
    const day = now.getDay(); // 0..6
    if (day === 0 || day === 6) return false; // skip weekends
  }
  // "once" would require an associated date field; if you need it, extend the schema.

  const diff = Math.abs(now.getTime() - target.getTime());
  // trigger if within 40 seconds
  return diff < 40_000;
}
