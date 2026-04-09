import { Logo } from '../ui/Logo';
import { MapPin, Clock, User, Stethoscope, Shield } from 'lucide-react';
import { formatDateTime } from '../../lib/utils';
import { HOSPITAL_NAME } from '../../lib/constants';
import type { Patient } from '../../lib/types';

interface WelcomeScreenProps {
  patient: Patient | null;
  onStartTracking: () => void;
}

export function WelcomeScreen({ patient, onStartTracking }: WelcomeScreenProps) {
  return (
    <div className="patient-welcome">
      <div className="patient-header">
        <Logo size="md" variant="light" />
        <span className="patient-header-tag">Smart Check-in</span>
      </div>

      <div className="patient-content">
        <div className="welcome-card-unified">
          {/* Patient Info Section */}
          <div className="welcome-info-section">
            <div className="welcome-card-type">
              <span className="card-type-label">HOSPITAL VISIT</span>
              <span className="upcoming-badge">UPCOMING</span>
            </div>

            {patient?.doctor_name && (
              <div className="welcome-card-doctor">
                <div className="doctor-avatar">
                  <Stethoscope size={22} />
                </div>
                <div className="doctor-info">
                  <h3>{patient.doctor_name}</h3>
                  <p>{patient.department || 'General Medicine'}</p>
                </div>
              </div>
            )}

            <div className="welcome-card-details">
              <div className="detail-row">
                <User size={16} />
                <span>{patient?.name || 'Patient'}{patient?.age ? `, ${patient.age} yrs` : ''}{patient?.gender ? ` • ${patient.gender}` : ''}</span>
              </div>
              <div className="detail-row">
                <Clock size={16} />
                <span>{patient?.appointment_time ? formatDateTime(patient.appointment_time) : 'Today'}</span>
              </div>
              <div className="detail-row">
                <MapPin size={16} />
                <span>{HOSPITAL_NAME}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="welcome-divider" />

          {/* Consent & Action Section */}
          <div className="welcome-action-section">
            <div className="consent-info">
              <Shield size={18} className="consent-shield" />
              <p>
                Share your location so we can prepare your file in advance and reduce your wait time. 
                Your location is only used during your hospital visit.
              </p>
            </div>

            <button
              className="start-journey-btn"
              onClick={onStartTracking}
            >
              <MapPin size={18} />
              Enable Smart Check-in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
