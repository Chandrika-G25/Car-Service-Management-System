import React from 'react';
import { Check, Clock, AlertTriangle } from 'lucide-react';

export const ProgressTracker = ({ currentStatus, history = [] }) => {
  const steps = [
    { key: 'PENDING', label: 'Request Created' },
    { key: 'ASSIGNED', label: 'Engineer Assigned' },
    { key: 'IN_PROGRESS', label: 'Service Started' },
    { key: 'INSPECTION', label: 'Inspection' },
    { key: 'REPAIRING', label: 'Repairing' },
    { key: 'TESTING', label: 'Diagnostic Testing' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <AlertTriangle size={24} />
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', color: '#f87171' }}>Service Request Cancelled</h4>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>This service request was cancelled and is no longer active.</p>
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="progress-tracker-container">
      <div className="progress-steps">
        {steps.map((step, index) => {
          const isCompleted = currentIndex > index || currentStatus === 'COMPLETED';
          const isActive = currentIndex === index && currentStatus !== 'COMPLETED';
          const stateClass = isCompleted ? 'completed' : isActive ? 'active' : '';

          return (
            <div key={step.key} className={`progress-step-item ${stateClass}`}>
              <div className="step-node">
                {isCompleted ? (
                  <Check size={18} strokeWidth={3} />
                ) : isActive ? (
                  <Clock size={18} />
                ) : (
                  index + 1
                )}
              </div>
              <div className="step-label">{step.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
