import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  HOSPITAL_COORDS, MAP_TILE_URL, MAP_TILE_ATTRIBUTION,
  MAP_DEFAULT_ZOOM, GEOFENCE_ARRIVED_KM, HOSPITAL_ZONES
} from '../../lib/constants';
import { haversineDistance, formatDistance, estimateETA } from '../../lib/utils';
import type { PatientWithSession } from '../../lib/types';

// Hospital marker icon
const hospitalIcon = L.divIcon({
  className: 'hospital-marker',
  html: `<div class="hospital-marker-inner">
    <div class="hospital-pulse"></div>
    <div class="hospital-dot">H</div>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Patient marker icon
function createPatientIcon() {
  return L.divIcon({
    className: 'patient-map-marker',
    html: `<div class="patient-dot patient-dot-arriving">
      <div class="patient-dot-pulse"></div>
      <div class="patient-dot-core"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// Zone label icon
function createZoneLabel(name: string, count: number) {
  return L.divIcon({
    className: 'zone-label-marker',
    html: `<div class="zone-label">
      <span class="zone-name">${name}</span>
      <span class="zone-count">${count}</span>
    </div>`,
    iconSize: [80, 36],
    iconAnchor: [40, 18],
  });
}

interface MapViewProps {
  patients: PatientWithSession[];
}

function MapContent({ patients }: MapViewProps) {
  const patientIcon = useMemo(() => createPatientIcon(), []);

  // Filter: only show patients OUTSIDE the geofence
  const outsidePatients = patients.filter(p => {
    const s = p.tracking_sessions?.[0];
    if (!s?.current_lat || !s?.current_lng) return false;
    const dist = haversineDistance(s.current_lat, s.current_lng, HOSPITAL_COORDS.lat, HOSPITAL_COORDS.lng);
    return dist > GEOFENCE_ARRIVED_KM;
  });

  // Count arrived patients in each zone
  const arrivedPatients = patients.filter(p => {
    const s = p.tracking_sessions?.[0];
    return s?.status === 'arrived' && s?.current_lat && s?.current_lng;
  });

  const zoneCounts = HOSPITAL_ZONES.map(zone => {
    // Count patients closest to this zone
    const count = arrivedPatients.filter(p => {
      const s = p.tracking_sessions[0];
      if (!s.current_lat || !s.current_lng) return false;
      // Find which zone this patient is closest to
      let minDist = Infinity;
      let closestZone = '';
      HOSPITAL_ZONES.forEach(z => {
        const d = haversineDistance(s.current_lat!, s.current_lng!, z.lat, z.lng);
        if (d < minDist) { minDist = d; closestZone = z.id; }
      });
      return closestZone === zone.id;
    }).length;
    return { ...zone, count };
  });

  const map = useMap();
  const zoom = map.getZoom();
  const showZones = zoom >= 15;

  return (
    <>
      <TileLayer url={MAP_TILE_URL} attribution={MAP_TILE_ATTRIBUTION} />

      {/* 200m geofence circle */}
      <Circle
        center={[HOSPITAL_COORDS.lat, HOSPITAL_COORDS.lng]}
        radius={GEOFENCE_ARRIVED_KM * 1000}
        pathOptions={{
          color: '#10B981',
          fillColor: '#10B981',
          fillOpacity: 0.08,
          weight: 1.5,
        }}
      />

      {/* 4 Zone circles — visible only at high zoom */}
      {showZones && zoneCounts.map(zone => (
        <React.Fragment key={zone.id}>
          <Circle
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{
              color: 'rgba(255,255,255,0.25)',
              fillColor: 'rgba(255,255,255,0.06)',
              fillOpacity: 1,
              weight: 1,
            }}
          />
          <Marker
            position={[zone.lat, zone.lng]}
            icon={createZoneLabel(zone.name, zone.count)}
            interactive={false}
          />
        </React.Fragment>
      ))}

      {/* Hospital marker */}
      <Marker
        position={[HOSPITAL_COORDS.lat, HOSPITAL_COORDS.lng]}
        icon={hospitalIcon}
      >
        <Popup>
          <strong>Apollo Smart Check-in</strong><br />
          Jubilee Hills, Hyderabad
        </Popup>
      </Marker>

      {/* Patient markers — only outside geofence */}
      {outsidePatients.map(patient => {
        const session = patient.tracking_sessions?.[0];
        if (!session?.current_lat || !session?.current_lng) return null;

        return (
          <Marker
            key={patient.id}
            position={[session.current_lat, session.current_lng]}
            icon={patientIcon}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 140 }}>
                <strong style={{ fontSize: 13 }}>{patient.name}</strong>
                {session.distance_km != null && (
                  <div style={{ fontSize: 12, color: '#097895', marginTop: 2 }}>
                    {formatDistance(session.distance_km)} · {estimateETA(session.distance_km)}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      <ZoomListener />
    </>
  );
}

// Force re-render on zoom change so zones appear/disappear
function ZoomListener() {
  const map = useMap();
  React.useEffect(() => {
    const handler = () => map.invalidateSize();
    map.on('zoomend', handler);
    return () => { map.off('zoomend', handler); };
  }, [map]);
  return null;
}

export function MapView({ patients }: MapViewProps) {
  return (
    <div className="map-container">
      <MapContainer
        center={[HOSPITAL_COORDS.lat, HOSPITAL_COORDS.lng]}
        zoom={MAP_DEFAULT_ZOOM}
        className="leaflet-map"
        zoomControl={true}
        attributionControl={false}
      >
        <MapContent patients={patients} />
      </MapContainer>

      {/* Map legend */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-circle legend-200m" />
          <span>Arrival (200m)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot legend-patient" />
          <span>Patient</span>
        </div>
      </div>
    </div>
  );
}
