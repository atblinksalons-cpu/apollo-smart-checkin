import { Logo } from '../ui/Logo';
import { formatDistance, estimateETA } from '../../lib/utils';
import { MapPin, Clock, FileText, Smartphone } from 'lucide-react';

interface ActiveTrackingProps {
  distance: number | null;
  isWatching: boolean;
  patientName: string;
}

export function ActiveTracking({ distance, isWatching, patientName }: ActiveTrackingProps) {
  const firstName = patientName.split(' ')[0];

  return (
    <div className="patient-tracking">
      <div className="patient-header">
        <Logo size="md" variant="light" />
        <span className="patient-header-tag tracking-tag">
          <span className="tracking-pulse" />
          Active
        </span>
      </div>

      <div className="tracking-content">
        {/* Warm greeting */}
        <div className="tracking-greeting">
          <h2>You're on your way, {firstName}!</h2>
          <p className="tracking-subtext">
            Great choice enabling Smart Check-in. Your medical records are being 
            prepared so you can skip the wait at reception.
          </p>
        </div>

        {/* ETA & Distance Card */}
        <div className="tracking-stats-card">
          <div className="stat-item">
            <MapPin size={18} className="stat-icon" />
            <div className="stat-data">
              <span className="stat-value">
                {distance !== null ? formatDistance(distance) : '...'}
              </span>
              <span className="stat-label">from hospital</span>
            </div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <Clock size={18} className="stat-icon" />
            <div className="stat-data">
              <span className="stat-value">
                {distance !== null ? estimateETA(distance) : '...'}
              </span>
              <span className="stat-label">estimated arrival</span>
            </div>
          </div>
        </div>

        {/* What's happening */}
        <div className="tracking-info-cards">
          <div className="info-card">
            <FileText size={16} />
            <span>Your file is being prepared ahead of time</span>
          </div>
          <div className="info-card">
            <Smartphone size={16} />
            <span>Keep this page open for a seamless experience</span>
          </div>
        </div>

        {/* Status */}
        <div className="tracking-status">
          <span className={`status-dot ${isWatching ? 'active' : ''}`} />
          <span>{isWatching ? 'Smart Check-in Active' : 'Connecting...'}</span>
        </div>
      </div>
    </div>
  );
}
