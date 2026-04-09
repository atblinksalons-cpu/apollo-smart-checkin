import { Logo } from '../ui/Logo';
import { CheckCircle, Map, Calendar, Coffee, MessageCircle } from 'lucide-react';
import { HOSPITAL_NAME } from '../../lib/constants';

interface ArrivedScreenProps {
  patientName: string;
}

export function ArrivedScreen({ patientName }: ArrivedScreenProps) {
  const firstName = patientName.split(' ')[0];

  const services = [
    {
      icon: <Map size={20} />,
      title: 'Wayfinder',
      description: 'Navigate the hospital campus',
    },
    {
      icon: <Calendar size={20} />,
      title: 'Your Appointment',
      description: 'View consultation details',
    },
    {
      icon: <Coffee size={20} />,
      title: 'Cafeteria',
      description: 'Food & beverages nearby',
    },
    {
      icon: <MessageCircle size={20} />,
      title: 'Talk to Agent',
      description: 'Get assistance anytime',
    },
  ];

  return (
    <div className="patient-arrived">
      <div className="patient-header">
        <Logo size="md" variant="light" />
        <span className="patient-header-tag arrived-tag">Arrived</span>
      </div>

      <div className="arrived-content">
        {/* Welcome */}
        <div className="arrived-welcome">
          <div className="arrived-check">
            <CheckCircle size={36} />
          </div>
          <h2>Welcome, {firstName}!</h2>
          <p>Your file is ready. Proceed to the reception to begin.</p>
        </div>

        {/* Service Cards */}
        <div className="arrived-services">
          <h3>Services Available</h3>
          <div className="service-grid">
            {services.map(s => (
              <div key={s.title} className="service-card">
                <div className="service-icon">{s.icon}</div>
                <div className="service-info">
                  <span className="service-title">{s.title}</span>
                  <span className="service-desc">{s.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hospital */}
        <div className="arrived-hospital">
          <Map size={14} />
          <span>{HOSPITAL_NAME}</span>
        </div>
      </div>
    </div>
  );
}
