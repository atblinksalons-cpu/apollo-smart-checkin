import React, { useState } from 'react';
import type { PatientWithSession } from '../../lib/types';
import { formatDistance, estimateETA, formatTime, copyToClipboard } from '../../lib/utils';
import {
  User, ChevronDown, ChevronUp, Phone, Clock, Copy, Check, Send, MapPin, Navigation
} from 'lucide-react';

interface PatientCardProps {
  patient: PatientWithSession;
}

export function PatientCard({ patient }: PatientCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const session = patient.tracking_sessions?.[0];
  const status = session?.status || 'scheduled';

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/track?patient_id=${patient.id}`;
    const success = await copyToClipboard(link);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!patient.mobile) return;

    const link = `${window.location.origin}/track?patient_id=${patient.id}`;
    const message = `Hi ${patient.name}, your appointment at Apollo Hospitals is confirmed. Enable Smart Check-in to skip the waiting line: ${link}`;

    // Clean phone number (remove spaces, ensure +91 prefix)
    const phone = patient.mobile.replace(/\s/g, '').replace(/^\+/, '');
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className={`pcard ${expanded ? 'pcard-expanded' : ''}`} onClick={() => setExpanded(!expanded)}>
      <div className="pcard-main">
        <div className="pcard-avatar">
          <User size={14} />
        </div>
        <div className="pcard-info">
          <span className="pcard-name">{patient.name}</span>
          <span className="pcard-meta">
            {patient.age && <span>{patient.age} yrs</span>}
            {patient.gender && <span> • {patient.gender}</span>}
            {session?.distance_km != null && (status === 'arriving' || status === 'location_shared') && (
              <>
                <span className="pcard-dist"> • <Navigation size={10} /> {formatDistance(session.distance_km)}</span>
                <span className="pcard-eta"> • <Clock size={10} /> {estimateETA(session.distance_km)}</span>
              </>
            )}
            {status === 'arrived' && session?.arrived_at && (
              <span className="pcard-arrived-time"> • <MapPin size={10} /> Arrived {formatTime(session.arrived_at)}</span>
            )}
          </span>
        </div>
        <span className="pcard-chevron">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>

      {expanded && (
        <div className="pcard-details">
          {patient.mobile && (
            <div className="pcard-detail-row">
              <Phone size={13} />
              <span>{patient.mobile}</span>
            </div>
          )}
          {patient.doctor_name && (
            <div className="pcard-detail-row">
              <Clock size={13} />
              <span>{patient.doctor_name}{patient.appointment_time ? ` • ${formatTime(patient.appointment_time)}` : ''}</span>
            </div>
          )}
          <div className="pcard-actions">
            <button className={`pcard-link ${copied ? 'copied' : ''}`} onClick={handleCopyLink}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy Link'}
            </button>
            {patient.mobile && (
              <button className="pcard-send" onClick={handleSendWhatsApp}>
                <Send size={12} />
                Send
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
