import React, { useState, useRef, useEffect } from 'react';
import { Logo } from '../components/ui/Logo';
import { PatientKanban } from '../components/dashboard/PatientKanban';
import { MapView } from '../components/dashboard/MapView';
import { DevPanel } from '../components/dashboard/DevPanel';
import { CreateAppointmentModal } from '../components/dashboard/CreateAppointmentModal';
import { useRealtimeTracking } from '../hooks/useRealtimeTracking';
import { Activity, Settings, Map, X } from 'lucide-react';

export function Dashboard() {
  const { patients, trackingOn, trackingOff, arrived, loading } = useRealtimeTracking();
  const [devPanelOpen, setDevPanelOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [mapOverlayOpen, setMapOverlayOpen] = useState(false);
  const logoClickCountRef = useRef(0);
  const logoClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Triple-click logo to open dev panel
  const handleLogoClick = () => {
    logoClickCountRef.current += 1;
    if (logoClickTimerRef.current) clearTimeout(logoClickTimerRef.current);

    if (logoClickCountRef.current >= 3) {
      setDevPanelOpen(true);
      logoClickCountRef.current = 0;
      return;
    }

    logoClickTimerRef.current = setTimeout(() => {
      logoClickCountRef.current = 0;
    }, 500);
  };

  // Keyboard shortcut: Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setDevPanelOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <Logo size="sm" variant="dark" />
        </div>
        <div className="header-center">
          <h1>
            <Activity size={20} />
            Smart Check-in Command Center
          </h1>
        </div>
        <div className="header-right">
          <div className="header-live">
            <span className="live-dot" />
            <span>Live</span>
          </div>
          <button
            className="header-settings-btn"
            onClick={() => setDevPanelOpen(true)}
            title="Developer Mode (Ctrl+Shift+D)"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-body">
        {/* Left Panel */}
        <div className="dashboard-left">
          <PatientKanban
            trackingOn={trackingOn}
            trackingOff={trackingOff}
            arrived={arrived}
            allPatients={patients}
            onCreateAppointment={() => setCreateModalOpen(true)}
          />
          {/* Mobile: View Map button */}
          <button className="mobile-map-btn" onClick={() => setMapOverlayOpen(true)}>
            <Map size={16} />
            View Live Map
          </button>
        </div>

        {/* Right Panel - Map (desktop) */}
        <div className="dashboard-right">
          <MapView patients={patients} />
        </div>
      </div>

      {/* Mobile Map Overlay */}
      {mapOverlayOpen && (
        <div className="map-overlay">
          <button className="map-overlay-close" onClick={() => setMapOverlayOpen(false)}>
            <X size={20} />
            Close Map
          </button>
          <MapView patients={patients} />
        </div>
      )}

      {/* Modals */}
      <DevPanel isOpen={devPanelOpen} onClose={() => setDevPanelOpen(false)} />
      <CreateAppointmentModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </div>
  );
}
