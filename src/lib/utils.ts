import { HOSPITAL_COORDS, HOSPITAL_ZONES } from './constants';

/**
 * Calculate Haversine distance between two coordinates in km
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate distance from hospital
 */
export function distanceFromHospital(lat: number, lng: number): number {
  return haversineDistance(lat, lng, HOSPITAL_COORDS.lat, HOSPITAL_COORDS.lng);
}

/**
 * Calculate bearing from point 1 to point 2 in degrees
 */
export function calculateBearing(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const dLng = toRad(lng2 - lng1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Move a point along a bearing by a given distance
 */
export function moveAlongBearing(
  lat: number, lng: number,
  bearingDeg: number, distanceKm: number
): { lat: number; lng: number } {
  const R = 6371;
  const d = distanceKm / R;
  const brng = toRad(bearingDeg);
  const lat1 = toRad(lat);
  const lng1 = toRad(lng);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );
  const lng2 = lng1 + Math.atan2(
    Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
    Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
  );

  return { lat: toDeg(lat2), lng: toDeg(lng2) };
}

/**
 * Generate a random position at a given distance range from a center point
 */
export function randomPositionAround(
  centerLat: number, centerLng: number,
  minKm: number, maxKm: number
): { lat: number; lng: number } {
  const distance = minKm + Math.random() * (maxKm - minKm);
  const bearing = Math.random() * 360;
  return moveAlongBearing(centerLat, centerLng, bearing, distance);
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Estimate ETA based on distance and average speed
 */
export function estimateETA(distanceKm: number, speedKmh: number = 30): string {
  const minutes = Math.round((distanceKm / speedKmh) * 60);
  if (minutes < 1) return 'Arriving now';
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `~${hours}h ${mins}m`;
}

/**
 * Format time to display string
 */
export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date and time
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ', ' + formatTime(dateStr);
}

/**
 * Generate random mobile number
 */
export function randomMobile(): string {
  const prefix = ['+91 98', '+91 77', '+91 63', '+91 90', '+91 87'][Math.floor(Math.random() * 5)];
  const suffix = String(Math.floor(10000000 + Math.random() * 90000000)).slice(0, 8);
  return `${prefix}${suffix}`;
}

/**
 * Generate random age between min and max
 */
export function randomAge(min = 25, max = 65): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Pick random item from array
 */
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}

/**
 * Detect which hospital zone a position is closest to.
 * Returns zone id string or null if outside all zones.
 */
export function detectZone(lat: number, lng: number): string | null {
  let minDist = Infinity;
  let closestZone: string | null = null;

  for (const zone of HOSPITAL_ZONES) {
    const d = haversineDistance(lat, lng, zone.lat, zone.lng);
    if (d < minDist) {
      minDist = d;
      closestZone = zone.id;
    }
  }

  return closestZone;
}

function toRad(deg: number): number { return deg * Math.PI / 180; }
function toDeg(rad: number): number { return rad * 180 / Math.PI; }
