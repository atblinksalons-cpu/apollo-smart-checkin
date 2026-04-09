import React from 'react';
import type { PatientStatus } from '../../lib/types';

const statusConfig: Record<PatientStatus, { label: string; className: string }> = {
  scheduled: { label: 'Scheduled', className: 'badge-scheduled' },
  location_shared: { label: 'Location Shared', className: 'badge-location-shared' },
  arriving: { label: 'Arriving', className: 'badge-arriving' },
  arrived: { label: 'Arrived', className: 'badge-arrived' },
};

export function Badge({ status, className = '' }: { status: PatientStatus; className?: string }) {
  const config = statusConfig[status];
  return (
    <span className={`badge ${config.className} ${className}`}>
      {status === 'arriving' && <span className="badge-live-dot" />}
      {config.label}
    </span>
  );
}
