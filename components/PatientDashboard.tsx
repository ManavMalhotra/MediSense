"use client";

import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { PatientData } from "@/types/patient";
import { Heart, Activity, Stethoscope, Shield, FileText } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface PatientDashboardProps {
  patientId: string;
  patientData: PatientData | null;
}

export default function PatientDashboard({
  patientId,
  patientData,
}: PatientDashboardProps) {
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
    return (
      <div className="p-6 animate-pulse text-gray-500">
        Loading patient data...
      </div>
    );
  }

  if (!patient) {
    return <div className="p-6 text-red-500">No patient data found.</div>;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#eef1ff] to-[#f7f8ff] p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold text-gray-800">
          Good Evening, {patient.name || "Patient"} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Last synced: 2 mins ago</p>
      </motion.div>

      {/* Health Score Circle */}
      <motion.div
        className="flex justify-center mt-6 mb-4"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative w-48 h-48">
          {/* Animated health ring */}
          <motion.svg
            className="w-full h-full -rotate-90"
            initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - 0.9628) }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          >
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="#e5e7eb"
              strokeWidth="14"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="url(#grad1)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 80}
              fill="none"
            />
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </motion.svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">96.28%</span>
            <span className="text-gray-500 text-sm -mt-1">Overall Health</span>
            <span className="text-green-600 text-xs mt-1">↑ 4% this week</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <SectionTitle title="Quick Action Grid" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/chat">
          <ActionCard icon={<Stethoscope />} label="AI Assistant" />
        </Link>
        {/* <Link href="#">
          <ActionCard icon={<FileText />} label="My Reports" />
        </Link> */}
        {/* <Link href="/appointments">
          <ActionCard icon={<Shield />} label="Health Card" />
        </Link> */}
        <Link href="/emergency">
          <ActionCard icon={<Activity />} label="Emergency Hotline" />
        </Link>
      </div>

      {/* Vitals */}
      <SectionTitle title="Vitals Snapshot" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <VitalCard label="Heart Rate" value="78 BPM" status="Normal" />
        <VitalCard label="BP" value="120/80" status="Normal" />
        <VitalCard label="SpO2" value="98%" status="Normal" />
        <VitalCard label="Last ECG" value="Normal" status="Normal" />
      </div>

      {/* Medication Adherence */}
      <SectionTitle title="Medication Adherence (Last 7 Days)" />
      <div className="flex gap-2 mt-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="w-6 h-12 bg-purple-300 rounded-xl"
          ></motion.div>
        ))}
      </div>

      {/* CTA */}
      <Link href="/dashboard/chat">
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          className="w-full mt-8 py-4 
          cursor-pointer font-semibold
          bg-purple-600 text-white rounded-2xl shadow-lg hover:bg-purple-700 transition"
        >
          Ask your health assistant anything →
        </motion.button>
      </Link>
    </div>
  );
}

/* -------------------------------------------
   COMPONENTS WITH MICRO-INTERACTIONS
------------------------------------------- */

function ActionCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer flex flex-col items-center justify-center gap-3"
    >
      <div className="text-purple-600">{icon}</div>
      <span className="text-gray-800 font-medium">{label}</span>
    </motion.div>
  );
}

function VitalCard({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md flex flex-col items-center"
    >
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-xl font-bold text-gray-800 mt-1">{value}</span>
      <span className="text-green-600 text-xs mt-1">{status}</span>
    </motion.div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-lg font-semibold text-gray-700 mt-8 mb-3 tracking-tight">
      {title}
    </h2>
  );
}
