"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ref, set, get } from "firebase/database";
import { auth, db } from "@/types/firebase";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/authSlice";
import type { DoctorUser, PatientUser } from "@/types/auth";

function generatePatientIdCandidate() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

async function generateUniquePatientId() {
  for (let tries = 0; tries < 5; tries++) {
    const candidate = generatePatientIdCandidate();
    const snap = await get(ref(db, `patients/${candidate}`));
    if (!snap.exists()) return candidate;
  }
  return `P${Date.now().toString(36).toUpperCase().slice(-7)}`;
}

export default function CompleteProfileForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    mobNo: "",
    occupation: "",
    height: "",
    weight: "",
    state: "",
    city: "",
    pincode: "",
    landmark: "",
  });

  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = auth.currentUser;

  useEffect(() => {
    if (user?.displayName) {
      const parts = user.displayName.split(" ");
      setFormData((prev) => ({
        ...prev,
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("No authenticated user found. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const displayName = `${formData.firstName} ${formData.lastName}`.trim();

    try {
      if (role === "doctor") {
        /** -------------------------
         *    DOCTOR PROFILE
         * ------------------------*/
        const doctorObj: DoctorUser = {
          uid: user.uid,
          email: user.email,
          role: "doctor",
          displayName,
          profile: formData,
        };

        await set(ref(db, `users/${user.uid}`), doctorObj);
        dispatch(setUser(doctorObj));
      } else {
        /** -------------------------
         *    PATIENT PROFILE
         * ------------------------*/
        const patientId = await generateUniquePatientId();

        const userStub: PatientUser = {
          uid: user.uid,
          email: user.email,
          role: "patient",
          patientDataId: patientId,
          displayName, // optional but useful
        };

        // save stub to /users/{uid}
        await set(ref(db, `users/${user.uid}`), userStub);
        dispatch(setUser(userStub));

        // create full patient record
        const patientRecord = {
          name: displayName,
          dob: formData.dob,
          gender: formData.gender,
          height_cm: formData.height,
          weight_kg: formData.weight,
          previous_diseases: [],
          reports: [],
        };

        await set(ref(db, `patients/${patientId}`), patientRecord);

        localStorage.setItem("patientId", patientId);
      }

      await user.getIdToken(true);
      router.push("/dashboard");
    } catch (err) {
      console.error("CompleteProfile error:", err);
      setError("Failed to save profile. Please try again.");
      setIsLoading(false);
    }
  };

  if (!user) return <div>Loading user information...</div>;

  return (
    <div className="rounded-lg border bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold text-gray-900">
        Complete your profile
      </h1>
      <p className="mt-1 text-gray-500">Please enter your details</p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
      >
        {/* first name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-3"
          />
        </div>

        {/* last name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-3"
          />
        </div>

        {/* ROLE SELECT */}
        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-gray-700">
            Please select registration type
          </p>

          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* patient */}
            <label
              className={`relative flex cursor-pointer rounded-lg border p-4 ${
                role === "patient"
                  ? "border-[#8B5CF6] ring-2 ring-[#8B5CF6] text-[#8B5CF6] font-semibold"
                  : "border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="role"
                checked={role === "patient"}
                onChange={() => setRole("patient")}
                className="sr-only"
              />
              I'm an individual / patient
            </label>

            {/* doctor */}
            <label
              className={`relative flex cursor-pointer rounded-lg border p-4 ${
                role === "doctor"
                  ? "border-[#8B5CF6] ring-2 ring-[#8B5CF6] text-[#8B5CF6] font-semibold"
                  : "border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="role"
                checked={role === "doctor"}
                onChange={() => setRole("doctor")}
                className="sr-only"
              />
              I'm a specialist / doctor
            </label>
          </div>
        </div>

        {/* submit */}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full justify-center rounded-md bg-[#3B82F6] py-3 px-4 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-center text-red-500">{error}</p>}
    </div>
  );
}
