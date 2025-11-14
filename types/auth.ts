// BASE SHARED FIELDS FOR ALL USERS
export interface BaseUser {
  uid: string;
  fullName?: string;
  email: string | null;
  role: "doctor" | "patient";
  patientDataId?: string | null;
}

// DOCTOR TYPE
export interface DoctorUser extends BaseUser {
  role: "doctor";
  displayName: string;

  profile: {
    firstName: string;
    lastName: string;
    gender: string;
    dob: string;
    mobNo: string;
    occupation: string;
    height: string;
    weight: string;
    state: string;
    city: string;
    pincode: string;
    landmark: string;
  };

  // optional because you don’t save this on registration
  assignedPatients?: string[];
}

// PATIENT TYPE
export interface PatientUser extends BaseUser {
  role: "patient";
  patientDataId: string;

  // you are NOT saving displayName for patient – so optional
  displayName?: string;
}

// **THE ONLY AUTH USER TYPE**
export type AuthUser = PatientUser | DoctorUser;
