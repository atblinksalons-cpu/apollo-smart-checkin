import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WelcomeScreen } from '../components/patient/WelcomeScreen';
import { ActiveTracking } from '../components/patient/ActiveTracking';
import { ArrivedScreen } from '../components/patient/ArrivedScreen';
import { useGeolocation } from '../hooks/useGeolocation';
import { supabase } from '../lib/supabase';
import { distanceFromHospital, detectZone } from '../lib/utils';
import { GEOFENCE_ARRIVING_KM, GEOFENCE_ARRIVED_KM, LOCATION_UPDATE_INTERVAL_MS } from '../lib/constants';
import type { Patient, TrackingSession } from '../lib/types';

type Screen = 'welcome' | 'tracking' | 'arrived' | 'invalid';

export function PatientTrack() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient_id');

  const [screen, setScreen] = useState<Screen>('welcome');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [session, setSession] = useState<TrackingSession | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSimulated, setIsSimulated] = useState(false);
  const sessionRef = useRef<TrackingSession | null>(null);

  const { latitude, longitude, isWatching, startWatching, stopWatching } = useGeolocation();

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Fetch patient data
  useEffect(() => {
    async function fetchPatient() {
      if (!patientId) {
        setScreen('invalid');
        setLoading(false);
        return;
      }

      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (!patientData) {
        setScreen('invalid');
        setLoading(false);
        return;
      }

      setPatient(patientData);

      // Check for existing session
      const { data: sessionData } = await supabase
        .from('tracking_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (sessionData) {
        setSession(sessionData);
        const simulated = sessionData.is_simulated === true;
        setIsSimulated(simulated);

        if (sessionData.status === 'arrived') {
          setScreen('arrived');
        } else if (sessionData.status === 'arriving' || sessionData.status === 'location_shared') {
          setScreen('tracking');
          if (!simulated) {
            startWatching();
          } else {
            setDistance(sessionData.distance_km);
          }
        }
      }

      setLoading(false);
    }

    fetchPatient();
  }, [patientId, startWatching]);

  // Realtime subscription for session updates
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`patient-session-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tracking_sessions',
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          const updated = payload.new as TrackingSession;
          setSession(updated);

          if (isSimulated && updated.distance_km != null) {
            setDistance(updated.distance_km);
          }

          if (updated.status === 'arrived') {
            stopWatching();
            setScreen('arrived');
          } else if (updated.status === 'arriving' || updated.status === 'location_shared') {
            setScreen('tracking');
          }
        }
      )
      .subscribe();

    // Polling fallback every 3s
    const pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from('tracking_sessions')
        .select('*')
        .eq('id', sessionRef.current?.id ?? session.id)
        .single();

      if (data) {
        const current = sessionRef.current;
        if (current && (data.status !== current.status || (isSimulated && data.distance_km !== current.distance_km))) {
          setSession(data);
          if (isSimulated && data.distance_km != null) setDistance(data.distance_km);
          if (data.status === 'arrived') { stopWatching(); setScreen('arrived'); }
        }
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [session?.id, isSimulated, stopWatching]);

  // Location updates — only for real patients, update tracking_sessions directly (no location_history)
  const updateLocation = useCallback(async () => {
    if (isSimulated) return;
    if (!latitude || !longitude || !session) return;
    if (session.status === 'arrived') return;

    const dist = distanceFromHospital(latitude, longitude);
    setDistance(dist);

    let newStatus: string;
    if (dist <= GEOFENCE_ARRIVED_KM) {
      newStatus = 'arrived';
    } else if (dist <= GEOFENCE_ARRIVING_KM) {
      newStatus = 'arriving';
    } else {
      newStatus = 'location_shared';
    }

    const updateData: Record<string, unknown> = {
      current_lat: latitude,
      current_lng: longitude,
      distance_km: dist,
      status: newStatus,
      current_zone: detectZone(latitude, longitude),
      updated_at: new Date().toISOString(),
    };

    if (newStatus === 'arrived') {
      updateData.arrived_at = new Date().toISOString();
      setScreen('arrived');
      stopWatching();
    }

    await supabase
      .from('tracking_sessions')
      .update(updateData)
      .eq('id', session.id);
  }, [latitude, longitude, session, isSimulated, stopWatching]);

  // Send location updates at interval
  useEffect(() => {
    if (isSimulated || !isWatching || !latitude || !longitude) return;

    updateLocation();
    const interval = setInterval(updateLocation, LOCATION_UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isWatching, latitude, longitude, updateLocation, isSimulated]);

  const handleStartTracking = async () => {
    if (!patientId || !patient) return;

    let currentSession = session;

    if (!currentSession) {
      const { data: existingSession } = await supabase
        .from('tracking_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingSession) currentSession = existingSession;
    }

    if (currentSession && !currentSession.is_simulated) {
      await supabase
        .from('tracking_sessions')
        .update({
          status: 'location_shared',
          location_shared_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSession.id);
    }

    if (!currentSession) {
      const { data: newSession } = await supabase
        .from('tracking_sessions')
        .insert({
          patient_id: patientId,
          status: 'location_shared',
          location_shared_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!newSession) return;
      currentSession = newSession;
    }

    if (!currentSession) return;

    const simulated = currentSession.is_simulated === true;
    setIsSimulated(simulated);
    setSession(currentSession);

    if (!simulated) {
      startWatching();
    } else {
      setDistance(currentSession.distance_km);
    }
    setScreen('tracking');
  };

  if (loading) {
    return (
      <div className="patient-loading">
        <div className="loading-spinner" />
        <p>Loading your appointment...</p>
      </div>
    );
  }

  if (screen === 'invalid') {
    return (
      <div className="patient-page">
        <div className="patient-invalid">
          <div className="invalid-icon">⚠️</div>
          <h2>Invalid Link</h2>
          <p>This tracking link is not valid. Please check the link you received and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-page">
      {screen === 'welcome' && (
        <WelcomeScreen
          patient={patient}
          onStartTracking={handleStartTracking}
        />
      )}
      {screen === 'tracking' && (
        <ActiveTracking
          distance={distance}
          isWatching={isSimulated ? true : isWatching}
          patientName={patient?.name || 'Patient'}
        />
      )}
      {screen === 'arrived' && (
        <ArrivedScreen patientName={patient?.name || 'Patient'} />
      )}
    </div>
  );
}
