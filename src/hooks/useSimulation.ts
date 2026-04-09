import { useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  HOSPITAL_COORDS, MOCK_DOCTORS, MOCK_MALE_NAMES, MOCK_FEMALE_NAMES,
  GEOFENCE_ARRIVED_KM, SIMULATION_UPDATE_INTERVAL_MS
} from '../lib/constants';
import {
  randomPositionAround, calculateBearing, moveAlongBearing,
  distanceFromHospital, pickRandom, randomMobile, randomAge, detectZone
} from '../lib/utils';
import type { SimulatedPatient } from '../lib/types';

export function useSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const simulatedRef = useRef<SimulatedPatient[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speedRef = useRef(1);

  speedRef.current = speedMultiplier;

  const spawnMovingPatients = useCallback(async (count: number = 8) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const newSimulated: SimulatedPatient[] = [];

    for (let i = 0; i < count; i++) {
      const isMale = Math.random() > 0.5;
      const name = pickRandom(isMale ? MOCK_MALE_NAMES : MOCK_FEMALE_NAMES);
      const doctor = pickRandom(MOCK_DOCTORS);
      const age = randomAge();
      const mobile = randomMobile();
      const gender = isMale ? 'Male' : 'Female';

      const pos = randomPositionAround(HOSPITAL_COORDS.lat, HOSPITAL_COORDS.lng, 5, 12);

      const { data: patient, error: pErr } = await supabase
        .from('patients')
        .insert({
          name,
          mobile,
          age,
          gender,
          doctor_name: doctor.name,
          department: doctor.department,
          appointment_time: new Date(Date.now() + 3600000).toISOString(),
          appointment_type: 'hospital_visit',
        })
        .select()
        .single();

      if (pErr || !patient) continue;

      const { data: session, error: sErr } = await supabase
        .from('tracking_sessions')
        .insert({
          patient_id: patient.id,
          status: 'arriving',
          current_lat: pos.lat,
          current_lng: pos.lng,
          distance_km: distanceFromHospital(pos.lat, pos.lng),
          is_simulated: true,
          location_shared_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (sErr || !session) continue;

      const bearing = calculateBearing(pos.lat, pos.lng, HOSPITAL_COORDS.lat, HOSPITAL_COORDS.lng);
      const speed = 40 + Math.random() * 30;

      newSimulated.push({
        sessionId: session.id,
        lat: pos.lat,
        lng: pos.lng,
        speed,
        bearing,
        jitterOffset: (Math.random() - 0.5) * 20,
      });
    }

    simulatedRef.current = newSimulated;
    setIsRunning(true);

    const tickMs = SIMULATION_UPDATE_INTERVAL_MS;
    intervalRef.current = setInterval(async () => {
      const toUpdate = [...simulatedRef.current];
      const toRemove: string[] = [];

      if (toUpdate.length === 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);
        return;
      }

      const updates = toUpdate.map(async (sim) => {
        const tickSeconds = tickMs / 1000;
        const distancePerTick = (sim.speed * speedRef.current) / 3600 * tickSeconds;

        const bearingToHospital = calculateBearing(
          sim.lat, sim.lng, HOSPITAL_COORDS.lat, HOSPITAL_COORDS.lng
        );
        const jitteredBearing = bearingToHospital + sim.jitterOffset * (Math.random() * 0.3 + 0.7);

        const newPos = moveAlongBearing(sim.lat, sim.lng, jitteredBearing, distancePerTick);
        sim.lat = newPos.lat;
        sim.lng = newPos.lng;

        const distance = distanceFromHospital(sim.lat, sim.lng);

        if (distance <= GEOFENCE_ARRIVED_KM) {
          await supabase
            .from('tracking_sessions')
            .update({
              status: 'arrived',
              current_lat: HOSPITAL_COORDS.lat + (Math.random() - 0.5) * 0.001,
              current_lng: HOSPITAL_COORDS.lng + (Math.random() - 0.5) * 0.001,
              distance_km: 0,
              current_zone: detectZone(HOSPITAL_COORDS.lat, HOSPITAL_COORDS.lng),
              arrived_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', sim.sessionId);

          toRemove.push(sim.sessionId);
        } else {
          await supabase
            .from('tracking_sessions')
            .update({
              current_lat: sim.lat,
              current_lng: sim.lng,
              distance_km: distance,
              current_zone: detectZone(sim.lat, sim.lng),
              updated_at: new Date().toISOString(),
            })
            .eq('id', sim.sessionId);
        }
      });

      await Promise.all(updates);

      simulatedRef.current = simulatedRef.current.filter(
        s => !toRemove.includes(s.sessionId)
      );

      if (simulatedRef.current.length === 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);
      }
    }, tickMs);
  }, []);

  const populateDashboard = useCallback(async () => {
    // Create scheduled patients (tracking off)
    const scheduledNames = ['Arun Mehta', 'Pooja Reddy', 'Kiran Rao', 'Neha Gupta', 'Rahul Verma'];
    for (const name of scheduledNames) {
      const doctor = pickRandom(MOCK_DOCTORS);
      const { data: patient } = await supabase
        .from('patients')
        .insert({
          name,
          mobile: randomMobile(),
          age: randomAge(),
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          doctor_name: doctor.name,
          department: doctor.department,
          appointment_time: new Date(Date.now() + (1 + Math.random() * 4) * 3600000).toISOString(),
        })
        .select()
        .single();

      if (patient) {
        await supabase.from('tracking_sessions').insert({
          patient_id: patient.id,
          status: 'scheduled',
          is_simulated: true,
        });
      }
    }

    // Create arrived patients
    const arrivedNames = ['Shalini Iyer', 'Manoj Kumar', 'Divya Rao'];
    for (const name of arrivedNames) {
      const doctor = pickRandom(MOCK_DOCTORS);
      const { data: patient } = await supabase
        .from('patients')
        .insert({
          name,
          mobile: randomMobile(),
          age: randomAge(),
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          doctor_name: doctor.name,
          department: doctor.department,
          appointment_time: new Date(Date.now() + 1800000).toISOString(),
        })
        .select()
        .single();

      if (patient) {
        const arrivedLat = HOSPITAL_COORDS.lat + (Math.random() - 0.5) * 0.001;
        const arrivedLng = HOSPITAL_COORDS.lng + (Math.random() - 0.5) * 0.001;
        await supabase.from('tracking_sessions').insert({
          patient_id: patient.id,
          status: 'arrived',
          current_lat: arrivedLat,
          current_lng: arrivedLng,
          distance_km: 0,
          current_zone: detectZone(arrivedLat, arrivedLng),
          is_simulated: true,
          location_shared_at: new Date(Date.now() - 1200000).toISOString(),
          arrived_at: new Date(Date.now() - 300000).toISOString(),
        });
      }
    }

    console.log('[Simulation] Dashboard populated with 5 scheduled, 3 arrived');
  }, []);

  const resetAll = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    simulatedRef.current = [];
    setIsRunning(false);

    await supabase.from('location_history').delete().gte('created_at', '1970-01-01T00:00:00Z');
    await supabase.from('tracking_sessions').delete().gte('created_at', '1970-01-01T00:00:00Z');
    await supabase.from('patients').delete().gte('created_at', '1970-01-01T00:00:00Z');

    console.log('[Reset] Master reset complete');
  }, []);

  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    simulatedRef.current = [];
    setIsRunning(false);
  }, []);

  return {
    isRunning,
    speedMultiplier,
    setSpeedMultiplier,
    spawnMovingPatients,
    populateDashboard,
    resetAll,
    stopSimulation,
    activeCount: simulatedRef.current.length,
  };
}
