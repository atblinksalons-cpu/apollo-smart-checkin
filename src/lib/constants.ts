// Apollo Hospitals Jubilee Hills, Hyderabad
export const HOSPITAL_COORDS = { lat: 17.4150, lng: 78.4123 };
export const HOSPITAL_NAME = 'Apollo Hospitals, Jubilee Hills, Hyderabad';
export const HOSPITAL_ADDRESS = 'Road No. 72, Jubilee Hills, Hyderabad, Telangana 500033';

// Geofence radii
export const GEOFENCE_ARRIVING_KM = 15;
export const GEOFENCE_ARRIVED_KM = 0.2;

// Update intervals
export const LOCATION_UPDATE_INTERVAL_MS = 60000; // 1 minute
export const SIMULATION_UPDATE_INTERVAL_MS = 2000;

// Hospital Zones — 4 symmetric zones inside the geofence
export const HOSPITAL_ZONES = [
  { id: 'atrium', name: 'Atrium', lat: 17.4155, lng: 78.4116, radius: 50 },
  { id: 'millet_marvels', name: 'Millet Marvels', lat: 17.4157, lng: 78.4130, radius: 50 },
  { id: 'medical_college', name: 'Medical College', lat: 17.4145, lng: 78.4133, radius: 50 },
  { id: 'emergency', name: 'Emergency', lat: 17.4142, lng: 78.4120, radius: 50 },
];

// Supabase
export const SUPABASE_URL = 'https://cxfzmauqsytnchakxpgb.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4ZnptYXVxc3l0bmNoYWt4cGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NzM4MTMsImV4cCI6MjA4NTI0OTgxM30.exq-6Vw-Po0c4EqOgmQ5kIY_NinSjuLjLdUmTAGwNto';

// Map
export const MAP_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
export const MAP_TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';
export const MAP_DEFAULT_ZOOM = 12;

// Mock data
export const MOCK_DOCTORS = [
  { name: 'Dr. Bharat Reddy', department: 'General Physician / Internal Medicine' },
  { name: 'Dr. Prem Sagar Panda', department: 'Preventive Medicine' },
  { name: 'Dr. Sunitha Rao', department: 'Cardiology' },
  { name: 'Dr. Arvind Krishna', department: 'Orthopedics' },
  { name: 'Dr. Kavitha Narayan', department: 'Dermatology' },
  { name: 'Dr. Venkat Subramanian', department: 'Neurology' },
  { name: 'Dr. Meena Sharma', department: 'ENT' },
  { name: 'Dr. Rajesh Gupta', department: 'Urology' },
  { name: 'Dr. Lakshmi Devi', department: 'Obstetrics & Gynaecology' },
  { name: 'Dr. Sanjay Reddy', department: 'Paediatrics' },
];

export const MOCK_MALE_NAMES = [
  'Rajesh Kumar', 'Sanjay Reddy', 'Venkat Rao', 'Anil Sharma',
  'Suresh Babu', 'Ravi Teja', 'Mohammed Asif', 'Vikram Singh',
  'Deepak Patel', 'Harish Chandra', 'Pradeep Verma', 'Ganesh Iyer',
];

export const MOCK_FEMALE_NAMES = [
  'Priya Sharma', 'Lakshmi Devi', 'Sunita Reddy', 'Anitha Kumari',
  'Deepa Nair', 'Kavitha Iyer', 'Meena Srinivas', 'Swathi Reddy',
  'Padma Rao', 'Rekha Gupta', 'Savitri Devi', 'Radha Krishna',
];

export const MOCK_MOBILE_PREFIXES = ['+91 98', '+91 77', '+91 63', '+91 90', '+91 87'];
