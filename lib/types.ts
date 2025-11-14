// lib/types.ts

// Base type for both users
export interface BaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Patient user
export interface PatientUser extends BaseUser {
  role: "patient";
  patientDataId: string; // The link to the 'patients' node (e.g., "14FAD97B")
}

// Doctor user
export interface DoctorUser extends BaseUser {
  role: "doctor";
  assignedPatients: Record<string, boolean>; // e.g., { "14FAD97B": true }
}

// Union
export type User = PatientUser | DoctorUser;

// Patient node schema
export type Patient = {
  id: string;
  name: string;
  dob?: string;
  gender?: string;
  height_cm?: number | string;
  weight_kg?: number | string;
  previous_diseases?: string[];
  reports?: any[];
};
