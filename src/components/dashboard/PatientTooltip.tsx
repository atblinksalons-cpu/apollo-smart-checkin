import React from 'react';
import type { PatientWithSession } from '../../lib/types';
import { formatDistance, estimateETA } from '../../lib/utils';
import { User, Phone, Stethoscope, MapPin, Clock, Navigation } from 'lucide-react';

interface PatientTooltipProps {
  patient: PatientWithSession;
  style?: React.CSSProperties;
}

export function PatientTooltip({ patient, style }: PatientTooltipProps) {
  const session = patient.tracking_sessions?.[0];
  const distance = session?.distance_km;

  return (
    <div className="patient-tooltip" style={style}>
      <div className="tooltip-header">
        <div className="tooltip-avatar">
          <User size={18} />
        </div>
        <div className="tooltip-name">
          <h4>{patient.name}</h4>
          <span className="tooltip-meta">
            {patient.age && `${patient.age} yrs`}
            {patient.gender && ` • ${patient.gender}`}
          </span>
        </div>
        <div className="tooltip-live">
          <span className="live-dot" />
          Live
        </div>
      </div>

      <div className="tooltip-details">
        {patient.mobile && (
          <div className="tooltip-row">
            <Phone size={14} />
            <span>{patient.mobile}</span>
          </div>
        )}
        {patient.doctor_name && (
          <div className="tooltip-row">
            <Stethoscope size={14} />
            <span>{patient.doctor_name}</span>
          </div>
        )}
        {patient.department && (
          <div className="tooltip-row">
            <MapPin size={14} />
            <span>{patient.department}</span>
          </div>
        )}
      </div>

      {distance != null && (
        <div className="tooltip-distance">
          <div className="tooltip-distance-info">
            <Navigation size={14} />
            <span className="tooltip-distance-value">{formatDistance(distance)}</span>
            <span className="tooltip-distance-label">away</span>
          </div>
          <div className="tooltip-eta">
            <Clock size={14} />
            <span>{estimateETA(distance)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
