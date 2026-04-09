import React, { useState } from 'react';
import { PatientCard } from './PatientCard';
import type { PatientWithSession } from '../../lib/types';
import {
  Calendar, MapPin, ChevronDown, ChevronRight, Navigation, Eye, EyeOff, Plus
} from 'lucide-react';

interface PatientKanbanProps {
  trackingOn: PatientWithSession[];
  trackingOff: PatientWithSession[];
  arrived: PatientWithSession[];
  allPatients: PatientWithSession[];
  onCreateAppointment: () => void;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  className: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, icon, count, className, defaultOpen = true, children }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`kb-section ${className}`}>
      <button className="kb-section-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="kb-section-left">
          {icon}
          <span className="kb-section-title">{title}</span>
          <span className="kb-section-count">{count}</span>
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {isOpen && (
        <div className="kb-section-body">
          {children}
        </div>
      )}
    </div>
  );
}

export function PatientKanban({ trackingOn, trackingOff, arrived, allPatients, onCreateAppointment }: PatientKanbanProps) {
  return (
    <div className="patient-kanban">
      {/* Header */}
      <div className="kb-header">
        <div className="kb-header-title">
          <h2>Patient Board</h2>
          <span className="kb-total">{allPatients.length} today</span>
        </div>
        <button className="kb-add-btn" onClick={onCreateAppointment} title="Create Appointment">
          <Plus size={16} />
        </button>
      </div>

      {/* Metrics */}
      <div className="kb-metrics">
        <div className="kb-metric">
          <Calendar size={14} />
          <span className="kb-metric-val">{allPatients.length}</span>
          <span className="kb-metric-lbl">Appointments</span>
        </div>
        <div className="kb-metric">
          <Navigation size={14} />
          <span className="kb-metric-val">{trackingOn.length}</span>
          <span className="kb-metric-lbl">Tracking</span>
        </div>
        <div className="kb-metric">
          <MapPin size={14} />
          <span className="kb-metric-val">{arrived.length}</span>
          <span className="kb-metric-lbl">Arrived</span>
        </div>
        <div className="kb-metric">
          <EyeOff size={14} />
          <span className="kb-metric-val">{trackingOff.length}</span>
          <span className="kb-metric-lbl">Pending</span>
        </div>
      </div>

      {/* Sections */}
      <div className="kb-sections">
        <Section
          title="Today's Appointments"
          icon={<Calendar size={14} />}
          count={trackingOn.length + trackingOff.length}
          className="kb-appointments"
        >
          {/* Tracking On subsection */}
          {trackingOn.length > 0 && (
            <div className="kb-subsection">
              <div className="kb-subsection-label">
                <Eye size={12} />
                <span>Tracking On</span>
                <span className="kb-sub-count">{trackingOn.length}</span>
              </div>
              <div className="kb-cards">
                {trackingOn.map(p => <PatientCard key={p.id} patient={p} />)}
              </div>
            </div>
          )}

          {/* Tracking Off subsection */}
          {trackingOff.length > 0 && (
            <div className="kb-subsection">
              <div className="kb-subsection-label">
                <EyeOff size={12} />
                <span>Tracking Off</span>
                <span className="kb-sub-count">{trackingOff.length}</span>
              </div>
              <div className="kb-cards">
                {trackingOff.map(p => <PatientCard key={p.id} patient={p} />)}
              </div>
            </div>
          )}

          {trackingOn.length === 0 && trackingOff.length === 0 && (
            <div className="kb-empty">No appointments today</div>
          )}
        </Section>

        {arrived.length > 0 && (
          <Section
            title="Arrived"
            icon={<MapPin size={14} />}
            count={arrived.length}
            className="kb-arrived"
          >
            <div className="kb-cards">
              {arrived.map(p => <PatientCard key={p.id} patient={p} />)}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
