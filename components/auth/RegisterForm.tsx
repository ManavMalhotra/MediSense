"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { handleGoogleSignIn } from "@/lib/authService";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [labName, setLabName] = useState(""); 

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [role, setRole] = useState<"patient" | "doctor" | "pathlab">("patient");
  const router = useRouter();

  // Validation
  const isProfessionalInfoValid = () => {
    if (role === "patient") return true;
    if (role === "doctor")
      return licenseNumber.trim() !== "" && specialization.trim() !== "";
    if (role === "pathlab")
      return licenseNumber.trim() !== "" && labName.trim() !== "";
    return false;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isGoogleLoading || !isProfessionalInfoValid()) return;

    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      localStorage.setItem(
        "onboardingData",
        JSON.stringify({
          role,
          email,
          licenseNumber: role !== "patient" ? licenseNumber : undefined,
          specialization: role === "doctor" ? specialization : undefined,
          labName: role === "pathlab" ? labName : undefined,
        })
      );

      router.push("/complete-profile");
    } catch (err: any) {
      setError(err.message || "Failed to register");
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (isLoading || isGoogleLoading || !isProfessionalInfoValid()) return;

    setIsGoogleLoading(true);
    setError(null);

    try {
      await handleGoogleSignIn();

      localStorage.setItem(
        "onboardingData",
        JSON.stringify({ 
          role,
          email,
          licenseNumber: role !== "patient" ? licenseNumber : undefined,
          specialization: role === "doctor" ? specialization : undefined,
          labName: role === "pathlab" ? labName : undefined,
        })
      );

      router.push("/complete-profile");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
      setIsGoogleLoading(false);
    }
  };

  // Helper: Is current role a professional?
  const isProfessional = role === "doctor" || role === "pathlab";

  return (
    <div className="rounded-lg border bg-white p-8 shadow-sm max-w-md mx-auto">
      <div className="text-left">
        <h1 className="text-3xl font-semibold text-gray-900">Register</h1>
        <p className="mt-1 mb-6 text-gray-500">
          Start your health journey today
        </p>
      </div>

      {/* Role selector */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { value: "patient", label: "Individual" },
          { value: "doctor", label: "Specialist" },
          { value: "pathlab", label: "Path Lab" },
        ].map((option) => (
          <label
            key={option.value}
            className={`p-3 border rounded-md cursor-pointer text-center ${
              role === option.value
                ? "border-[#8B5CF6] ring-2 ring-[#8B5CF6] text-[#8B5CF6] font-semibold bg-purple-50"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="role"
              value={option.value}
              checked={role === option.value}
              onChange={() => setRole(option.value as any)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>

      <form onSubmit={handleRegister} className="mt-6 space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Email"
          className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="Password (min 6 chars)"
          className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
        />

        {/* Conditional Fields for Professionals */}
        {isProfessional && (
          <>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              required
              placeholder={
                role === "doctor"
                  ? "Medical License Number (e.g., MCI-12345)"
                  : "Lab License Number (e.g., NABL-LAB-6789)"
              }
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
            />

            {role === "doctor" ? (
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                required
                placeholder="Specialization (e.g., Cardiologist)"
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
              />
            ) : (
              <input
                type="text"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                required
                placeholder="Pathology Lab Name"
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
              />
            )}
          </>
        )}

        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#3B82F6] hover:underline"
          >
            Login
          </Link>
        </p>

        <button
          type="submit"
          disabled={isLoading || isGoogleLoading || !isProfessionalInfoValid()}
          className="w-full justify-center rounded-md border border-transparent bg-[#3B82F6] py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-center text-red-500 text-sm">{error}</p>
      )}

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">or continue with</span>
        </div>
      </div>

      <button
        onClick={handleGoogleRegister}
        disabled={isLoading || isGoogleLoading || !isProfessionalInfoValid()}
        className="w-full flex justify-center items-center gap-2 rounded-md border border-gray-300 bg-white py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
      >
        <svg className="h-5 w-5" viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          ></path>
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          ></path>
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          ></path>
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          ></path>
        </svg>
        {isGoogleLoading ? "Signing up..." : "Continue with Google"}
      </button>
    </div>
  );
}
