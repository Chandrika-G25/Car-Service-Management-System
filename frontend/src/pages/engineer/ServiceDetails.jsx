import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, CheckCircle, FileText, PlusCircle, AlertCircle, Clock } from 'lucide-react';
import { serviceRequestService } from '../../services/serviceRequestService';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import ProgressTracker from '../../components/ProgressTracker';
import Modal from '../../components/Modal';

export const EngineerServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status progression modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [finalCost, setFinalCost] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Notes modal
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [techNotes, setTechNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const data = await serviceRequestService.getRequestById(id);
      setService(data);
      setFinalCost(data.final_cost || data.estimated_cost);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const openStatusUpdate = (nextStatus) => {
    setTargetStatus(nextStatus);
    setStatusRemarks('');
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      await serviceRequestService.updateEngineerStatus(id, {
        status: targetStatus,
        remarks: statusRemarks,
        final_cost: targetStatus === 'COMPLETED' ? finalCost : undefined,
      });
      setStatusModalOpen(false);
      fetchJobDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update job status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!techNotes.trim()) return;
    setSavingNotes(true);
    try {
      await serviceRequestService.addEngineerNotes(id, techNotes);
      setNoteModalOpen(false);
      setTechNotes('');
      fetchJobDetails();
    } catch (err) {
      alert('Failed to log technical notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) return <Loading message="Loading bay ticket and diagnostic docket..." />;
  if (!service) return <div className="card empty-state">Workorder ticket not found.</div>;

  const car = service.car_details || {};

  // Stage advancement buttons logic
  const nextStageOptions = {
    ASSIGNED: [{ status: 'IN_PROGRESS', label: 'Commence Work (In Progress)' }],
    IN_PROGRESS: [{ status: 'INSPECTION', label: 'Begin Multi-Point Inspection' }],
    INSPECTION: [{ status: 'REPAIRING', label: 'Commence Mechanical Repairs' }],
    REPAIRING: [{ status: 'TESTING', label: 'Advance to Diagnostic Testing' }],
    TESTING: [{ status: 'COMPLETED', label: 'Certify & Mark Completed' }],
  };

  const availableNext = nextStageOptions[service.current_status] || [];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <button
            onClick={() => navigate('/engineer/services')}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '0.75rem' }}
          >
            <ArrowLeft size={16} /> Back to Assigned Bay Queue
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h1>Bay Workorder: {service.request_number}</h1>
            <StatusBadge status={service.current_status} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setNoteModalOpen(true)}>
            <PlusCircle size={16} /> Log Tech Notes
          </button>
          {availableNext.map((opt) => (
            <button
              key={opt.status}
              className="btn btn-primary"
              onClick={() => openStatusUpdate(opt.status)}
            >
              <CheckCircle size={16} /> {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 7-Stage Visual Progress Tracker */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Service Bay Stage Tracker</h3>
        <ProgressTracker currentStatus={service.current_status} history={service.history} />
      </div>

      {/* Vehicle and Customer Specs */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Vehicle Intake Specs</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Automobile</span>
              <p style={{ margin: '0.2rem 0', fontWeight: 700, fontSize: '1.1rem' }}>{car.brand} {car.model}</p>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Plate: {car.registration_number}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Fuel / Engine</span>
              <p style={{ margin: '0.2rem 0', fontWeight: 700 }}>{car.fuel_type}</p>
              <span style={{ color: 'var(--text-muted)' }}>Year: {car.manufacturing_year}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Odometer at Intake</span>
              <p style={{ margin: '0.2rem 0', fontWeight: 700 }}>
                {service.current_mileage ? `${service.current_mileage.toLocaleString()} km` : 'Standard'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>VIN Identifier</span>
              <p style={{ margin: '0.2rem 0', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {car.vin_number || 'N/A'}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>Customer Symptoms & Complaints</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {service.description || 'Routine scheduled maintenance.'}
            </p>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Customer Contact</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>OWNER</span>
              <p style={{ margin: '0.2rem 0', fontWeight: 700 }}>{service.customer_name}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>PHONE</span>
              <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>{service.customer_phone || 'N/A'}</p>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>EMAIL</span>
              <p style={{ margin: '0.2rem 0' }}>{service.customer_email}</p>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>COST QUOTE</span>
              <p style={{ margin: '0.2rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                ${service.final_cost || service.estimated_cost}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Audit & Technical Notes */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Technician Logs & Timeline</h3>
          <button className="btn btn-sm btn-secondary" onClick={() => setNoteModalOpen(true)}>
            <PlusCircle size={14} /> Add Technical Note
          </button>
        </div>

        {(!service.history || service.history.length === 0) ? (
          <p style={{ color: 'var(--text-dim)' }}>No timeline entries.</p>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-subtle)' }}>
            {service.history.map((h) => (
              <div key={h.id} style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '-2.05rem',
                    top: '2px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    border: '3px solid var(--bg-surface)',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                  <StatusBadge status={h.new_status} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {new Date(h.created_at).toLocaleString()}
                  </span>
                </div>
                <p style={{ margin: '0.25rem 0', fontSize: '0.925rem' }}>{h.remarks}</p>
                {h.updated_by_name && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Logged by: {h.updated_by_name} ({h.updated_by_role})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Advance Workorder to: ${targetStatus.replace('_', ' ')}`}
      >
        <form onSubmit={handleStatusSubmit}>
          <div className="form-group">
            <label className="form-label">Technician Remarks & Observations *</label>
            <textarea
              className="form-control"
              rows={3}
              required
              placeholder="e.g. Brake rotors checked. Ceramic pads installed and torque tested to 120 Nm."
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
            />
          </div>

          {targetStatus === 'COMPLETED' && (
            <div className="form-group">
              <label className="form-label">Final Billed Cost ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                className="form-control"
                value={finalCost}
                onChange={(e) => setFinalCost(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                This will finalize the customer invoice and notify client for collection.
              </span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updatingStatus}>
              <CheckCircle size={16} /> {updatingStatus ? 'Updating...' : `Set to ${targetStatus}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Tech Note Modal */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title="Add Technical Bay Note"
      >
        <form onSubmit={handleAddNote}>
          <div className="form-group">
            <label className="form-label">Diagnostic / Inspection Note *</label>
            <textarea
              className="form-control"
              rows={4}
              required
              placeholder="Document diagnostic trouble codes (DTC), micrometer measurements, fluid levels, or part serial numbers..."
              value={techNotes}
              onChange={(e) => setTechNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setNoteModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={savingNotes}>
              <FileText size={16} /> {savingNotes ? 'Saving...' : 'Log Technical Note'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EngineerServiceDetails;
