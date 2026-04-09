import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useSimulation } from '../../hooks/useSimulation';
import {
  Rocket, BarChart3, Trash2, Gauge, X, AlertTriangle, Users, Zap
} from 'lucide-react';

interface DevPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DevPanel({ isOpen, onClose }: DevPanelProps) {
  const {
    isRunning, speedMultiplier, setSpeedMultiplier,
    spawnMovingPatients, populateDashboard, resetAll, stopSimulation
  } = useSimulation();
  const [spawning, setSpawning] = useState(false);
  const [populating, setPopulating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSpawn = async () => {
    setSpawning(true);
    await spawnMovingPatients(8);
    setSpawning(false);
  };

  const handlePopulate = async () => {
    setPopulating(true);
    await populateDashboard();
    setPopulating(false);
  };

  const handleReset = async () => {
    setResetting(true);
    await resetAll();
    setResetting(false);
    setShowResetConfirm(false);
  };

  return (
    <div className="dev-panel-overlay" onClick={onClose}>
      <div className="dev-panel" onClick={e => e.stopPropagation()}>
        <div className="dev-panel-header">
          <div className="dev-panel-title">
            <Zap size={20} />
            <h3>Developer Mode</h3>
          </div>
          <button className="dev-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="dev-panel-body">
          {/* Live Traffic Spawner */}
          <div className="dev-section">
            <div className="dev-section-header">
              <Rocket size={18} />
              <h4>Live Traffic Spawner</h4>
            </div>
            <p className="dev-section-desc">
              Spawn 8 mock patients that drive toward the hospital in real-time.
              They'll appear on the map and auto-arrive at the 200m geofence.
            </p>
            <div className="dev-section-actions">
              <Button
                variant="primary"
                onClick={handleSpawn}
                loading={spawning}
                disabled={isRunning}
                icon={<Users size={16} />}
              >
                {isRunning ? 'Simulation Running...' : 'Spawn Moving Patients (8)'}
              </Button>
              {isRunning && (
                <Button variant="ghost" onClick={stopSimulation}>
                  Stop Simulation
                </Button>
              )}
            </div>
          </div>

          {/* Speed Control */}
          <div className="dev-section">
            <div className="dev-section-header">
              <Gauge size={18} />
              <h4>Simulation Speed</h4>
            </div>
            <div className="speed-control">
              {[1, 2, 5, 10].map(speed => (
                <button
                  key={speed}
                  className={`speed-btn ${speedMultiplier === speed ? 'active' : ''}`}
                  onClick={() => setSpeedMultiplier(speed)}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Populate Dashboard */}
          <div className="dev-section">
            <div className="dev-section-header">
              <BarChart3 size={18} />
              <h4>Populate Dashboard</h4>
            </div>
            <p className="dev-section-desc">
              Instantly fill the dashboard with patients —
              5 scheduled (tracking off), 3 arrived.
            </p>
            <Button
              variant="secondary"
              onClick={handlePopulate}
              loading={populating}
              icon={<BarChart3 size={16} />}
            >
              Populate Dashboard
            </Button>
          </div>

          {/* Master Reset */}
          <div className="dev-section dev-section-danger">
            <div className="dev-section-header">
              <Trash2 size={18} />
              <h4>Master Reset</h4>
            </div>
            <p className="dev-section-desc">
              Wipe all data from the database. This will clear all patients,
              tracking sessions, and location history.
            </p>
            {showResetConfirm ? (
              <div className="reset-confirm">
                <AlertTriangle size={18} />
                <span>Are you sure? This cannot be undone.</span>
                <div className="reset-confirm-actions">
                  <Button variant="danger" onClick={handleReset} loading={resetting}>
                    Yes, Clear Everything
                  </Button>
                  <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="danger"
                onClick={() => setShowResetConfirm(true)}
                icon={<Trash2 size={16} />}
              >
                Clear All Data
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
