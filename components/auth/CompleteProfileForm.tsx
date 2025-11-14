"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ref, set, get } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/authSlice";

function generatePatientIdCandidate() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

async function generateUniquePatientId() {
  // try a few times to avoid collision
  for (let tries = 0; tries < 5; tries++) {
    const candidate = generatePatientIdCandidate();
    const snap = await get(ref(db, `patients/${candidate}`));
    if (!snap.exists()) return candidate;
  }
  // fallback - if collisions (very unlikely), append timestamp
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
      setFormData((p) => ({
        ...p,
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
        // write full doctor profile under /users/{uid}
        const doctorObj = {
          uid: user.uid,
          email: user.email,
          displayName,
          role: "doctor",
          profile: formData,
        };

        await set(ref(db, `users/${user.uid}`), doctorObj);
        // update Redux immediately
        dispatch(setUser(doctorObj));
      } else {
        // patient flow:
        const patientId = await generateUniquePatientId();

        // 1) Write minimal /users/{uid} stub first (so AuthProvider sees it)
        const userStub = {
          uid: user.uid,
          email: user.email,
          role: "patient",
          patientDataId: patientId,
        };
        await set(ref(db, `users/${user.uid}`), userStub);

        // immediately update redux so AuthProvider doesn't redirect
        dispatch(setUser(userStub));

        // 2) Write actual patient record under /patients/{patientId}
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

        // save patientId locally for convenient access by dashboard
        localStorage.setItem("patientId", patientId);
      }

      // refresh token (so any token-based claims update) and then push
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
        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-3"
          />
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-3"
          />
        </div>

        {/* more fields... */}
        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-gray-700">
            Please select registration type
          </p>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                value="patient"
                checked={role === "patient"}
                onChange={() => setRole("patient")}
                className="sr-only"
              />
              <span className="block text-sm font-medium">
                I'm an individual / patient
              </span>
            </label>

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
                value="doctor"
                checked={role === "doctor"}
                onChange={() => setRole("doctor")}
                className="sr-only"
              />
              <span className="block text-sm font-medium">
                I'm a specialist / doctor
              </span>
            </label>
          </div>
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full justify-center rounded-md border border-transparent bg-[#3B82F6] py-3 px-4 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-center text-red-500">{error}</p>}
    </div>
  );
}
