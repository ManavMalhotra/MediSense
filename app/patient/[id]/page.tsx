"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ref, get, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { PDFDocument } from "pdf-lib";

// Types
type Report = {
  title: string;
  summary: string;
  date: string;
  pdfData: string; // Base64-encoded PDF
  sizeBytes: number;
};

type Patient = {
  id: string;
  name: string;
  dob?: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  reports?: Report[];
};

type User = {
  uid: string;
  role: "patient" | "doctor" | "pathlab";
  patientDataId?: string;
};

export default function PatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [reportTitle, setReportTitle] = useState("");
  const [reportSummary, setReportSummary] = useState("");

  const auth = getAuth();

  // Fetch current user from Realtime Database
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = ref(db, `users/${user.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setCurrentUser({
              uid: user.uid,
              role: userData.role,
              patientDataId: userData.patientDataId,
            });
          }
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch patient data
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

  // Compress PDF and convert to Base64
  const compressAndEncodePDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Basic compression: disable object streams (reduces size slightly)
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: false,
    });

    // Convert to Base64
    const binary = new Uint8Array(compressedBytes).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    );
    return btoa(binary);
  };

  // Handle report upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !reportTitle || uploading || !id) return;

    // Only professionals can upload
    if (currentUser?.role === "patient") {
      alert("Only doctors or labs can upload reports.");
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    setUploading(true);

    try {
      // Compress and encode
      const pdfBase64 = await compressAndEncodePDF(file);
      const approxSizeBytes = Math.floor((pdfBase64.length * 3) / 4); // Base64 → bytes

      if (approxSizeBytes > 900_000) {
        alert("PDF is too large! Please keep it under ~700 KB.");
        setUploading(false);
        return;
      }

      const newReport: Report = {
        title: reportTitle,
        summary: reportSummary,
        date: new Date().toISOString().split("T")[0], 
        pdfData: pdfBase64,
        sizeBytes: approxSizeBytes,
      };

      // current reports
      const patientRef = ref(db, `patients/${id}`);
      const patientSnap = await get(patientRef);
      const currentReports: Report[] =
        patientSnap.exists() && patientSnap.val().reports
          ? patientSnap.val().reports
          : [];

      await update(patientRef, {
        reports: [...currentReports, newReport],
      });

      // Reset form
      setFile(null);
      setReportTitle("");
      setReportSummary("");
      alert("Report uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Failed to upload report: " + (err.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  // Download Base64 as PDF file
  const downloadBase64AsPDF = (base64Data: string, filename: string) => {
    try {
      const byteString = atob(base64Data);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download PDF.");
    }
  };

  if (loading) return <div className="p-6">Loading patient data...</div>;
  if (!patient)
    return <div className="p-6 text-red-500">Patient not found</div>;

  const isProfessional =
    currentUser?.role === "doctor" || currentUser?.role === "pathlab";

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Patient Details Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Patient Details
          </h2>
          <span className="text-sm text-gray-500">Last updated: Today</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <DetailItem label="Patient ID" value={patient.id} />
            <DetailItem
              label="Date of Birth"
              value={patient.dob || "Not set"}
            />
            <DetailItem
              label="Height"
              value={patient.height_cm ? `${patient.height_cm} cm` : "Not set"}
            />
          </div>
          <div className="space-y-3">
            <DetailItem label="Name" value={patient.name} />
            <DetailItem label="Gender" value={patient.gender || "Not set"} />
            <DetailItem
              label="Weight"
              value={patient.weight_kg ? `${patient.weight_kg} kg` : "Not set"}
            />
          </div>
        </div>
      </div>

      {/* Upload Report Form (for doctors/labs) */}
      {isProfessional && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">
            Upload New Medical Report
          </h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Report Title (e.g., Blood Test)"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <textarea
              value={reportSummary}
              onChange={(e) => setReportSummary(e.target.value)}
              placeholder="Brief Summary (optional)"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500"
              required
            />
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {uploading ? "Processing PDF..." : "Upload Report"}
            </button>
            <p className="text-xs text-gray-500">
              ⚠️ Max file size: ~700 KB (after compression). Larger files will
              be rejected.
            </p>
          </form>
        </div>
      )}
      

      {/* Reports List */}
      {patient.reports && patient.reports.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">
            Medical Reports ({patient.reports.length})
          </h3>
          <div className="space-y-4">
            {patient.reports.map((report, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {report.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {report.summary}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Date: {report.date}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Size: {(report.sizeBytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      downloadBase64AsPDF(
                        report.pdfData,
                        `${report.title.replace(/\s+/g, "_")}.pdf`
                      )
                    }
                    className="px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium rounded hover:bg-green-200 transition"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {patient.reports && patient.reports.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 text-center">
          <p className="text-gray-500">No medical reports uploaded yet.</p>
        </div>
      )}
    </div>
  );
}

// Reusable detail item component
const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value}</p>
  </div>
);
