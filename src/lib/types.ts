export type PatientStatus = 'scheduled' | 'location_shared' | 'arriving' | 'arrived';

export interface Patient {
  id: string;
  name: string;
  mobile: string | null;
  age: number | null;
  gender: string | null;
  doctor_name: string | null;
  department: string | null;
  appointment_time: string | null;
  appointment_type: string;
  created_at: string;
}

export interface TrackingSession {
  id: string;
  patient_id: string;
  status: PatientStatus;
  current_lat: number | null;
  current_lng: number | null;
  distance_km: number | null;
  is_simulated: boolean;
  share_link: string;
  location_shared_at: string | null;
  arrived_at: string | null;
  completed_at: string | null;
  current_zone: string | null;
  updated_at: string;
  created_at: string;
}

export interface PatientWithSession extends Patient {
  tracking_sessions: TrackingSession[];
}

export interface SimulatedPatient {
  sessionId: string;
  lat: number;
  lng: number;
  speed: number; // km/h
  bearing: number;
  jitterOffset: number;
}

export interface HospitalZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number; // meters
}
