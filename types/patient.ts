export interface PatientData {
  id: string;
  name?: string;
  dob?: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  heartRate?: number;
  bp?: string;
  [key: string]: any;
}
