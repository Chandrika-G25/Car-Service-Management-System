import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Car, User, Calendar, DollarSign, Clock, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { serviceRequestService } from '../../services/serviceRequestService';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import ProgressTracker from '../../components/ProgressTracker';
import Modal from '../../components/Modal';

export const CustomerServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelRemarks, setCancelRemarks] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchServiceDetails = async () => {
    setLoading(true);
    try {
      const data = await serviceRequestService.getRequestById(id);
      setService(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const handleCancelService = async () => {
    setCancelling(true);
    try {
      await serviceRequestService.cancelRequest(id, cancelRemarks);
      setCancelModalOpen(false);
      fetchServiceDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Unable to cancel service.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loading message="Loading service details and live diagnostics..." />;
  if (!service) return <div className="card empty-state">Service ticket not found.</div>;

  const car = service.car_details || {};
  const canCancel = ['PENDING', 'ASSIGNED'].includes(service.current_status);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <button
            onClick={() => navigate('/customer/services')}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: '0.75rem' }}
          >
            <ArrowLeft size={16} /> Back to Services
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h1>Ticket: {service.request_number}</h1>
            <StatusBadge status={service.current_status} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {canCancel && (
            <button className="btn btn-danger" onClick={() => setCancelModalOpen(true)}>
              Cancel Request
            </button>
          )}
          {service.current_status === 'COMPLETED' && (
            <Link to="/customer/invoices" className="btn btn-primary">
              <FileText size={16} /> View Official Invoice
            </Link>
          )}
        </div>
      </div>

      {/* 7-Stage Visual Status Tracker */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Service Bay Progress Tracker</h3>
        <ProgressTracker currentStatus={service.current_status} history={service.history} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Main Details Card */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Job Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Vehicle
              </span>
              <p style={{ margin: '0.2rem 0', fontWeight: 700, fontSize: '1.05rem' }}>
                {car.brand} {car.model}
              </p>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>
                Plate: {car.registration_number}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Service Category
              </span>
              <p style={{ margin: '0.2rem 0', fontWeight: 700, fontSize: '1.05rem' }}>
                {service.category_name}
              </p>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Scheduled: {service.preferred_date} ({service.preferred_time})
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Lead Technician
              </span>
              <p style={{ margin: '0.2rem 0', fontWeight: 700, fontSize: '1.05rem' }}>
                {service.engineer_name || 'Pending assignment'}
              </p>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ID: {service.engineer_employee_id || 'N/A'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Odometer Intake
              </span>
              <p style={{ margin: '0.2rem 0', fontWeight: 700, fontSize: '1.05rem' }}>
                {service.current_mileage ? `${service.current_mileage.toLocaleString()} km` : 'Standard'}
              </p>
            </div>
          </div>

          {service.description && (
            <div style={{ background: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem' }}>Customer Description / Complaints</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{service.description}</p>
            </div>
          )}
        </div>

        {/* Cost Summary Card */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Billing Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Fee:</span>
              <span>${service.estimated_cost}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Diagnostic Work:</span>
              <span>Included</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.15rem',
                fontWeight: 700,
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.75rem',
              }}
            >
              <span>Total Cost:</span>
              <span style={{ color: 'var(--accent-cyan)' }}>
                ${service.final_cost || service.estimated_cost}
              </span>
            </div>
          </div>

          {service.current_status === 'COMPLETED' ? (
            <Link to="/customer/invoices" className="btn btn-primary" style={{ width: '100%' }}>
              <FileText size={16} /> View Invoice
            </Link>
          ) : (
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              * Final invoice will be prepared once diagnostic testing is marked completed.
            </p>
          )}
        </div>
      </div>

      {/* Historical Audit Timeline */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>Service Timeline & Technician Logs</h3>
        {(!service.history || service.history.length === 0) ? (
          <p style={{ color: 'var(--text-dim)' }}>No timeline entries recorded yet.</p>
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
                <p style={{ margin: '0.25rem 0', fontSize: '0.925rem' }}>
                  {h.remarks || 'Status updated'}
                </p>
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

      {/* Cancel Service Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Service Request"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setCancelModalOpen(false)}>
              Keep Appointment
            </button>
            <button className="btn btn-danger" onClick={handleCancelService} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={32} color="#ef4444" style={{ flexShrink: 0 }} />
          <div style={{ width: '100%' }}>
            <p style={{ margin: 0 }}>
              Are you sure you want to cancel ticket <strong>{service.request_number}</strong>?
            </p>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Cancellation Reason (Optional)</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Let us know why you need to cancel this appointment..."
                value={cancelRemarks}
                onChange={(e) => setCancelRemarks(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerServiceDetails;
