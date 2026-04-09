import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MOCK_DOCTORS } from '../../lib/constants';
import { X, User, Phone, Calendar, Stethoscope } from 'lucide-react';

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAppointmentModal({ isOpen, onClose }: CreateAppointmentModalProps) {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    age: '',
    gender: 'Male',
    doctorIndex: 0,
    appointmentTime: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const doctor = MOCK_DOCTORS[form.doctorIndex];

      const { data: patient, error: patientErr } = await supabase
        .from('patients')
        .insert({
          name: form.name,
          mobile: form.mobile || null,
          age: form.age ? parseInt(form.age) : null,
          gender: form.gender,
          doctor_name: doctor.name,
          department: doctor.department,
          appointment_time: form.appointmentTime
            ? new Date(form.appointmentTime).toISOString()
            : new Date(Date.now() + 3600000).toISOString(),
          appointment_type: 'hospital_visit',
        })
        .select()
        .single();

      if (patientErr || !patient) throw patientErr;

      await supabase.from('tracking_sessions').insert({
        patient_id: patient.id,
        status: 'scheduled',
      });

      // Reset form & close
      setForm({ name: '', mobile: '', age: '', gender: 'Male', doctorIndex: 0, appointmentTime: '' });
      onClose();
    } catch (err) {
      console.error('Error creating appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-appt-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New Appointment</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="appt-form">
          <div className="appt-field">
            <label><User size={14} /> Patient Name *</label>
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div className="appt-row">
            <div className="appt-field">
              <label><Phone size={14} /> Mobile</label>
              <input
                type="tel"
                placeholder="+91 98XXXXXXXX"
                value={form.mobile}
                onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
              />
            </div>
            <div className="appt-field appt-field-sm">
              <label>Age</label>
              <input
                type="number"
                placeholder="Age"
                min="1"
                max="120"
                value={form.age}
                onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
              />
            </div>
          </div>

          <div className="appt-row">
            <div className="appt-field">
              <label>Gender</label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="appt-field">
              <label><Calendar size={14} /> Time</label>
              <input
                type="datetime-local"
                value={form.appointmentTime}
                onChange={e => setForm(f => ({ ...f, appointmentTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="appt-field">
            <label><Stethoscope size={14} /> Doctor</label>
            <select
              value={form.doctorIndex}
              onChange={e => setForm(f => ({ ...f, doctorIndex: parseInt(e.target.value) }))}
            >
              {MOCK_DOCTORS.map((d, i) => (
                <option key={i} value={i}>{d.name} — {d.department}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="appt-submit" disabled={loading || !form.name}>
            {loading ? 'Creating...' : 'Create Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}
